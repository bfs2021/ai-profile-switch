#!/usr/bin/env node
// Draws the claude and cpf screens as SVG pictures for the website and README.
// The real screens run against example profiles in a temporary home folder. A fake
// `security` and fetch stand in for the Keychain and the usage request, so no real
// account or network is touched.
//
//   node scripts/screenshots.mjs          write website/public/screens/{en,ko}/*.svg
//   node scripts/screenshots.mjs --text   print the screens as plain text instead
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const COLUMNS = 84;
const MINUTE = 60000;
const HOUR = 60 * MINUTE;

// ── Example profiles ────────────────────────────────────────────────────────

const official = 'claude-plugins-official';
const PROFILES = {
  work: {
    email: 'kim@company.com', plan: 'claude_max',
    usage: { five: 23, fiveIn: 2.2 * HOUR, week: 41, weekIn: 4 * 24 * HOUR },
    servers: { github: { type: 'stdio', command: 'github-mcp' }, figma: { type: 'http', url: 'https://mcp.figma.com/mcp' } },
    plugins: ['commit-commands', 'pr-review-toolkit', 'frontend-design'],
  },
  personal: {
    email: 'me@example.com', plan: 'claude_pro',
    usage: { five: 64, fiveIn: 1.4 * HOUR, week: 52, weekIn: 2 * 24 * HOUR },
    servers: { notion: { type: 'http', url: 'https://mcp.notion.com/mcp' } },
    needsLogin: ['notion'],
    plugins: ['commit-commands'],
  },
  // No current usage comes back for this one, so the saved value shows dim.
  team: {
    email: 'lee@company.com', plan: 'claude_team', offline: true,
    usage: { five: 88, fiveIn: 3.1 * HOUR, week: 77, weekIn: 5 * 24 * HOUR, savedAgo: 12 * MINUTE },
    servers: { github: { type: 'stdio', command: 'github-mcp' } },
    plugins: [],
  },
  side: {},
};

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function fixture() {
  const base = mkdtempSync(join(tmpdir(), 'cpf-screens-'));
  const home = join(base, 'home');
  const profiles = join(home, '.claude-profiles');
  const bin = join(base, 'bin');
  mkdirSync(join(profiles, '_shared'), { recursive: true });
  mkdirSync(bin);
  const now = Date.now();
  const live = {};
  for (const [name, profile] of Object.entries(PROFILES)) {
    const dir = join(profiles, name);
    mkdirSync(join(dir, 'plugins'), { recursive: true });
    writeFileSync(join(dir, 'history.jsonl'), '');
    if (!profile.email) continue;
    const { usage } = profile;
    const windows = {
      five_hour: { utilization: usage.five, resets_at: new Date(now + usage.fiveIn).toISOString() },
      seven_day: { utilization: usage.week, resets_at: new Date(now + usage.weekIn).toISOString() },
    };
    writeJson(join(dir, '.claude.json'), {
      oauthAccount: { emailAddress: profile.email, organizationType: profile.plan },
      cachedUsageUtilization: { fetchedAtMs: now - (usage.savedAgo ?? 40 * MINUTE), utilization: windows },
      mcpServers: profile.servers,
      ...(profile.needsLogin ? { mcpNeedsAuthNoticed: profile.needsLogin } : {}),
    });
    writeJson(join(dir, 'plugins', 'installed_plugins.json'), {
      version: 2,
      plugins: Object.fromEntries(profile.plugins.map(id => [`${id}@${official}`, [{ scope: 'user' }]])),
    });
    writeJson(join(dir, 'plugins', 'known_marketplaces.json'), {
      [official]: { source: { source: 'github', repo: 'anthropics/claude-plugins-official' } },
    });
    // The service name Claude Code gives the Keychain item of this profile folder.
    const service = `Claude Code-credentials-${createHash('sha256').update(dir).digest('hex').slice(0, 8)}`;
    if (!profile.offline) live[service] = windows;
    writeJson(join(dir, '.credentials.json'), { claudeAiOauth: { accessToken: service, expiresAt: now + HOUR } });
  }
  writeJson(join(profiles, 'meta.json'), {
    version: 1, activeProfile: 'work', shareSettings: true,
    profiles: Object.keys(PROFILES), shared: ['CLAUDE.md', 'skills'],
  });
  // `security find-generic-password -s <service> -w` hands back a token naming the service.
  writeFileSync(join(bin, 'security'), '#!/bin/sh\nprintf \'{"claudeAiOauth":{"accessToken":"%s","expiresAt":32503680000000}}\' "$3"\n', { mode: 0o755 });
  writeFileSync(join(bin, 'claude'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  return { base, home, bin, live };
}

// ── Running a screen ────────────────────────────────────────────────────────

// Runs the CLI with a terminal-like stdin and stdout, presses keys, and keeps the
// output written up to each snapshot.
function capture(context, language, args, steps) {
  const script = `
    import { PassThrough } from 'node:stream';
    const live = JSON.parse(process.env.SHOT_LIVE);
    globalThis.fetch = async (url, { headers }) => {
      const usage = live[headers.Authorization.slice('Bearer '.length)];
      return { ok: Boolean(usage), json: async () => usage };
    };
    const input = new PassThrough();
    input.isTTY = true;
    input.setRawMode = value => { input.isRaw = value; };
    Object.defineProperty(process, 'stdin', { value: input });
    let output = '';
    const realWrite = process.stdout.write.bind(process.stdout);
    for (const stream of [process.stdout, process.stderr]) {
      Object.defineProperty(stream, 'isTTY', { value: true });
      Object.defineProperty(stream, 'columns', { value: ${COLUMNS} });
      stream.write = (chunk, encoding, done) => {
        output += String(chunk);
        (typeof encoding === 'function' ? encoding : done)?.();
        return true;
      };
    }
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const { run } = await import(${JSON.stringify(new URL('../src/index.mjs', import.meta.url).href)});
    run(${JSON.stringify(args)});
    const snaps = [];
    for (const step of ${JSON.stringify(steps)}) {
      if (step.wait) await sleep(step.wait);
      if (step.keys) { input.write(step.keys); await sleep(120); }
      if (step.snap) snaps.push({ name: step.snap, at: output.length });
    }
    realWrite(JSON.stringify({ output, snaps }));
    process.exit(0);
  `;
  const env = {
    PATH: [context.bin, process.env.PATH].join(delimiter), HOME: context.home, USERPROFILE: context.home,
    TERM: 'xterm-256color', FORCE_COLOR: '1', AI_PROFILE_SWITCH_LANG: language,
    CLAUDE_SWITCH_DISABLE_AUTO_UPDATE: '1', SHOT_LIVE: JSON.stringify(context.live), TZ: 'Asia/Seoul',
  };
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env, encoding: 'utf8', timeout: 20000 });
  if (result.status !== 0) throw new Error(`${args.join(' ')} failed:\n${result.stderr}`);
  const { output, snaps } = JSON.parse(result.stdout);
  return snaps.map(({ name, at }) => ({ name, screen: emulate(output.slice(0, at)) }));
}

// ── A small terminal ────────────────────────────────────────────────────────

const wide = char => /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿＀-｠]/.test(char);

// Understands what the screens write: text, newlines, cursor up, clear line, clear
// below and colors. Returns rows of { char, style } cells.
function emulate(text) {
  const rows = [[]];
  let row = 0;
  let col = 0;
  let style = {};
  const line = () => (rows[row] ??= []);
  const sgr = (codes) => {
    for (const code of codes.length ? codes : [0]) {
      if (code === 0) style = {};
      else if (code === 1) style = { ...style, bold: true };
      else if (code === 2) style = { ...style, dim: true };
      else if (code === 22) style = { ...style, bold: false, dim: false };
      else if (code >= 30 && code <= 37) style = { ...style, color: code };
      else if (code === 39) style = { ...style, color: undefined };
    }
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\x1b' && text[i + 1] === '[') {
      const match = /^\x1b\[([0-9;]*)([A-Za-z])/.exec(text.slice(i));
      const numbers = match[1] ? match[1].split(';').map(Number) : [];
      if (match[2] === 'm') sgr(numbers);
      else if (match[2] === 'A') row = Math.max(0, row - (numbers[0] || 1));
      else if (match[2] === 'K') rows[row] = [];
      else if (match[2] === 'J') {
        line().length = Math.min(line().length, col);
        rows.length = row + 1;
      }
      i += match[0].length - 1;
    } else if (char === '\n') {
      row += 1;
      col = 0;
      line();
    } else if (char === '\r') {
      col = 0;
    } else {
      const width = wide(char) ? 2 : 1;
      if (col + width > COLUMNS) {
        row += 1;
        col = 0;
      }
      const cells = line();
      while (cells.length < col) cells.push({ char: ' ', style: {} });
      cells[col] = { char, style };
      if (width === 2) cells[col + 1] = { char: '', style };
      col += width;
    }
  }
  while (rows.length && !rows.at(-1).some(cell => cell.char.trim())) rows.pop();
  return rows.map(cells => Array.from(cells, cell => cell ?? { char: ' ', style: {} }));
}

// ── Pictures ────────────────────────────────────────────────────────────────

const CELL = 8.4;
const LINE = 21;
const PAD = 18;
const BAR = 30;
const PALETTE = { fg: '#d6d8de', dim: '#7d828c', 31: '#f38b8b', 32: '#8fd694', 33: '#f2c66d', 36: '#7cc9f0' };

const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const same = (a, b) => a.bold === b.bold && a.dim === b.dim && a.color === b.color;

function fill(style) {
  if (style.color && PALETTE[style.color]) return style.dim ? PALETTE.dim : PALETTE[style.color];
  return style.dim ? PALETTE.dim : PALETTE.fg;
}

// Every character is placed on its own cell, as a terminal does, so columns line up
// whatever font the viewer has. A Korean syllable sits in the middle of its two cells.
// The usage bars are drawn as blocks because their glyphs come out faint in most fonts.
const BARS = { '▰': true, '▱': false };

function svg(screen, title) {
  const width = Math.round(COLUMNS * CELL + PAD * 2);
  const height = Math.round(BAR + PAD + screen.length * LINE + PAD);
  const shapes = [];
  screen.forEach((cells, y) => {
    const baseline = BAR + PAD + y * LINE + 15;
    const blank = cell => !cell.char.trim() || Object.hasOwn(BARS, cell.char);
    cells.forEach((cell, x) => {
      if (!Object.hasOwn(BARS, cell.char)) return;
      const on = BARS[cell.char];
      shapes.push(`<rect x="${(PAD + x * CELL + 1).toFixed(1)}" y="${baseline - 10}" width="${(CELL - 2).toFixed(1)}" height="10" rx="1.5" fill="${on ? fill(cell.style) : '#3a3d45'}"/>`);
    });
    let start = 0;
    while (start < cells.length) {
      if (blank(cells[start])) { start += 1; continue; }
      let end = start + 1;
      while (end < cells.length && (cells[end].char === '' || (!blank(cells[end]) && same(cells[end].style, cells[start].style)))) end += 1;
      const placed = cells.slice(start, end).map((item, offset) => ({ ...item, x: start + offset })).filter(item => item.char);
      const xs = placed.map(item => (PAD + item.x * CELL + (wide(item.char) ? CELL - 7 : 0)).toFixed(1)).join(' ');
      const { style } = cells[start];
      shapes.push(`<text x="${xs}" y="${baseline}" fill="${fill(style)}"${style.bold ? ' font-weight="700"' : ''}>${escape(placed.map(item => item.char).join(''))}</text>`);
      start = end;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(title)}">
<rect width="${width}" height="${height}" rx="10" fill="#1d1f24"/>
<circle cx="18" cy="15" r="5" fill="#3d4048"/><circle cx="34" cy="15" r="5" fill="#3d4048"/><circle cx="50" cy="15" r="5" fill="#3d4048"/>
<text x="${width / 2}" y="19" text-anchor="middle" fill="${PALETTE.dim}" font-family="-apple-system, 'Segoe UI', sans-serif" font-size="12">${escape(title)}</text>
<g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', 'Noto Sans Mono CJK KR', monospace" font-size="14">
${shapes.join('\n')}
</g>
</svg>
`;
}

function plain(screen) {
  return screen.map(cells => cells.map(cell => cell.char).join('').trimEnd()).join('\n');
}

// ── What to draw ────────────────────────────────────────────────────────────

const DOWN = '\x1b[B';
const UP = '\x1b[A';
const ENTER = '\r';
const SETTLE = 600;

const SHOTS = [
  { title: 'claude', args: ['shell', 'pick', '--print'], steps: [{ wait: SETTLE }, { keys: DOWN, snap: 'launch' }] },
  { title: 'cpf', args: ['manage'], steps: [
    { wait: SETTLE }, { keys: DOWN + DOWN, snap: 'home' },
    { keys: UP + ENTER, wait: SETTLE, snap: 'detail' },
    { keys: DOWN + DOWN + ENTER, wait: 200 },
    { keys: ENTER, wait: 200, snap: 'import' },
  ] },
  { title: 'cpf', args: ['manage'], steps: [{ wait: SETTLE }, { keys: UP + ENTER }, { keys: ENTER, snap: 'share' }] },
];

const TITLES = {
  launch: 'claude', home: 'cpf', detail: 'cpf · personal', import: 'cpf · personal', share: 'cpf · settings',
};

const asText = process.argv.includes('--text');
for (const language of ['en', 'ko']) {
  const context = fixture();
  try {
    for (const shot of SHOTS) {
      for (const { name, screen } of capture(context, language, shot.args, shot.steps)) {
        if (asText) {
          console.log(`── ${language}/${name}\n${plain(screen)}\n`);
          continue;
        }
        const dir = join(root, 'website', 'public', 'screens', language);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `${name}.svg`), svg(screen, TITLES[name]));
      }
    }
  } finally {
    rmSync(context.base, { recursive: true, force: true });
  }
}
if (!asText) console.log('website/public/screens/{en,ko}: launch, home, detail, import, share');
