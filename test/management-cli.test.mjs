import './helpers/home.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, lstatSync, readlinkSync, writeFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url));
const indexURL = new URL('../src/index.mjs', import.meta.url).href;

function fixture() {
  const directory = mkdtempSync(join(process.env.TMPDIR, 'manager-'));
  const profiles = join(directory, '.claude-profiles');
  mkdirSync(join(profiles, 'work'), { recursive: true });
  writeFileSync(join(profiles, 'work', 'history.jsonl'), 'keep history\n');
  const meta = join(profiles, 'meta.json');
  writeFileSync(meta, JSON.stringify({ version: 1, activeProfile: 'work', shareSettings: true, profiles: ['work'] }));
  return { directory, profiles, meta, env: { ...process.env, HOME: directory, USERPROFILE: directory, SHELL: '/bin/zsh' } };
}

function run(args, context) {
  const result = spawnSync(process.execPath, [cli, ...args], { env: context.env, encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  return result;
}

function snapshot(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) return { link: readlinkSync(path) };
  if (stat.isFile()) return readFileSync(path).toString('base64');
  return Object.fromEntries(readdirSync(path).sort().map(name => [name, snapshot(join(path, name))]));
}

describe('command help and validation', () => {
  for (const args of [
    ['init', '--help'], ['add', 'new', '--help'], ['remove', 'work', '--help'],
    ['rename', 'work', 'new', '--help'], ['use', 'other', '--help'],
    ['install-shell', '--help'], ['migrate', '--help'], ['update', '--help'],
    ['manage', 'add', 'new', '--help'], ['manage', 'rename', 'work', 'new', '-h'],
  ]) {
    it(args.join(' ') + ' shows help without writing', () => {
      const context = fixture();
      const before = snapshot(context.directory);
      const result = run(args, context);
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /Usage:/);
      assert.deepEqual(snapshot(context.directory), before);
    });
  }

  for (const args of [
    ['init', 'extra'], ['install-shell', '--bad'], ['list', 'extra'],
    ['add', 'new', 'extra'], ['use', 'work', '--bad-option'],
    ['remove', 'work', 'extra'], ['rename', 'work', 'new', 'extra'],
    ['manage', 'add', 'new', 'extra'], ['manage', '--list', 'extra'],
    ['manage', '--unknown'], ['constructor'],
  ]) {
    it(args.join(' ') + ' is rejected before writing', () => {
      const context = fixture();
      const before = snapshot(context.directory);
      const result = run(args, context);
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.deepEqual(snapshot(context.directory), before);
    });
  }
});

describe('cpf management commands', () => {
  it('adds, renames, switches, and lists through the manager', () => {
    const context = fixture();
    assert.equal(run(['manage', 'add', 'work2'], context).status, 0);
    assert.equal(run(['manage', 'work2'], context).status, 0);
    assert.equal(run(['manage', 'rename', 'work2', 'personal'], context).status, 0);
    const meta = JSON.parse(readFileSync(context.meta));
    assert.equal(meta.activeProfile, 'personal');
    assert.deepEqual(meta.profiles, ['work', 'personal']);
    assert.ok(!existsSync(join(context.profiles, 'work2')));
    const listed = run(['manage', '--list'], context);
    assert.equal(listed.status, 0, listed.stderr);
    assert.match(listed.stdout, /Active: personal/);
  });

  it('keeps one-word command names available as existing profiles', () => {
    const context = fixture();
    for (const name of ['add', 'remove', 'rename', 'list']) {
      assert.equal(run(['add', name], context).status, 0);
      assert.equal(run(['manage', name], context).status, 0);
      assert.equal(JSON.parse(readFileSync(context.meta)).activeProfile, name);
    }
  });

  it('does not open a menu or delete anything with noninteractive stdin', () => {
    const context = fixture();
    const before = snapshot(context.directory);
    const menu = run(['manage'], context);
    assert.equal(menu.status, 0, menu.stderr);
    assert.match(menu.stdout, /Usage:/);
    const removal = run(['manage', 'remove', 'work'], context);
    assert.equal(removal.status, 0, removal.stderr);
    assert.match(removal.stdout, /Cancelled/);
    assert.deepEqual(snapshot(context.directory), before);
  });

  // Answers each prompt when its text appears, then returns everything the session printed.
  function menuSession(context, replies) {
    const script = "Object.defineProperty(process.stdin,'isTTY',{value:true}); process.stdin.setRawMode=()=>{}; const {run}=await import(" + JSON.stringify(indexURL) + "); await run(['manage']); console.log('MANAGEMENT_DONE');";
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ['--input-type=module', '-e', script], { env: context.env });
      let stdout = '', stderr = '', offset = 0, step = 0;
      const timer = setTimeout(() => { child.kill(); reject(new Error('Menu timed out at ' + step + ': ' + stdout + stderr)); }, 10000);
      child.stdout.on('data', chunk => {
        stdout += chunk;
        if (stdout.includes('MANAGEMENT_DONE')) child.stdin.end();
        if (step < replies.length && stdout.slice(offset).includes(replies[step][0])) {
          const reply = replies[step++][1];
          offset = stdout.length;
          child.stdin.write(reply);
        }
      });
      child.stderr.on('data', chunk => { stderr += chunk; });
      child.on('error', err => { clearTimeout(timer); reject(err); });
      child.on('close', status => { clearTimeout(timer); resolve({ status, stdout, stderr, step }); });
    });
  }

  it('recovers from invalid input and completes add, rename and confirmed deletion in one menu session', async () => {
    const context = fixture();
    const home = '◆  Profiles';
    const replies = [
      [home, '\x1b[B\r'],
      ['New profile name (empty to cancel):', 'Work\n'],
      // The cursor stays on "Add a profile" after a name that did not work.
      [home, '\r'],
      ['New profile name (empty to cancel):', 'work\n'],
      [home, '\r'],
      ['New profile name (empty to cancel):', '\n'],
      [home, '\r'],
      ['New profile name (empty to cancel):', 'work2\n'],
      [home, '\r'],
      ['◆  work2', '\x1b[B\x1b[B\r'],
      ['New name', 'personal\n'],
      ['Rename work2 to personal?', 'y\r'],
      ['◆  personal', '\x1b[A\r'],
      ['Delete profile "personal"?', '\r'],
      ['◆  personal', '\x1b[A\r'],
      ['Delete profile "personal"?', 'y\r'],
      [home, '\x1b'],
    ];
    const output = await menuSession(context, replies);
    assert.equal(output.status, 0, output.stdout + output.stderr);
    assert.equal(output.step, replies.length, output.stdout);
    assert.match(output.stdout, /MANAGEMENT_DONE/);
    assert.match(output.stderr, /Only lowercase letters/);
    assert.match(output.stderr, /Profile "work" already exists/);
    assert.match(output.stdout, /◆  work2  not signed in/);
    assert.match(output.stdout, /Connected  none/);
    assert.match(output.stdout, /Bring over from another profile  same as the others/);
    assert.match(output.stdout, /Cancelled/);
    assert.match(output.stdout, /Renamed profile: work2/);
    assert.equal(output.stdout.split('Close Claude windows using work2').length - 1, 1, 'rename warns once');
    assert.match(output.stdout, /Removed profile: personal/);
    assert.deepEqual(JSON.parse(readFileSync(context.meta)).profiles, ['work']);
    assert.equal(JSON.parse(readFileSync(context.meta)).activeProfile, 'work');
    assert.equal(readFileSync(join(context.profiles, 'work', 'history.jsonl'), 'utf8'), 'keep history\n');
  });

  it('turns sharing on from the settings screen', async () => {
    const context = fixture();
    writeFileSync(join(context.profiles, 'work', 'CLAUDE.md'), '# my notes\n');
    const replies = [
      ['◆  Profiles', '\x1b[A\r'],
      ['◆  Settings', '\r'],
      ['◆  Sharing', ' \r'],
      ['◆  Settings', '\x1b'],
      ['◆  Profiles', '\x1b'],
    ];
    const output = await menuSession(context, replies);
    assert.equal(output.status, 0, output.stdout + output.stderr);
    assert.equal(output.step, replies.length, output.stdout);
    assert.match(output.stdout, /Sharing CLAUDE\.md through/);
    assert.deepEqual(JSON.parse(readFileSync(context.meta)).shared, ['CLAUDE.md']);
    assert.equal(readFileSync(join(context.profiles, '_shared', 'CLAUDE.md'), 'utf8'), '# my notes\n');
    assert.ok(lstatSync(join(context.profiles, 'work', 'CLAUDE.md')).isSymbolicLink());
  });
});

describe('rename and sign-in commands', () => {
  function twoProfiles() {
    const context = fixture();
    mkdirSync(join(context.profiles, 'side'));
    writeFileSync(context.meta, JSON.stringify({ version: 1, activeProfile: 'work', shareSettings: true, profiles: ['work', 'side'] }));
    return context;
  }

  it('refuses a taken name before warning and suggests another', () => {
    const context = twoProfiles();
    const before = snapshot(context.directory);
    const result = run(['rename', 'side', 'work'], context);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /Close Claude windows/);
    assert.match(result.stderr, /Profile "work" already exists\n +Profiles: work, side\n +Use another name: cpf rename side work-2/);
    assert.deepEqual(snapshot(context.directory), before);
  });

  it('warns once, renames, and says what comes next', () => {
    const context = twoProfiles();
    const result = run(['rename', 'side', 'studio'], context);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.split('Close Claude windows using side').length - 1, 1);
    assert.match(result.stdout, /Renamed profile: side → studio/);
    assert.match(result.stdout, /Sign-in, history, and settings are kept/);
    assert.match(result.stdout, /Next time, pick studio in the claude list/);
  });

  // The fake claude records how it was called and writes the account Claude Code would save.
  function withFakeClaude(context, exit = '') {
    const bin = join(context.directory, 'fake-bin');
    mkdirSync(bin);
    writeFileSync(join(bin, 'claude'), `#!/bin/sh
printf '%s\\n' "$*" > "$CLAUDE_CONFIG_DIR/../login-args"
printf '%s' "$CLAUDE_CONFIG_DIR" > "$CLAUDE_CONFIG_DIR/../login-dir"
${exit ? `exit ${exit}` : ''}
printf '{"oauthAccount":{"emailAddress":"new@studio.test","organizationType":"claude_pro"}}' > "$CLAUDE_CONFIG_DIR/.claude.json"
`, { mode: 0o755 });
    return { ...context, env: { ...context.env, PATH: [bin, context.env.PATH].join(delimiter) } };
  }

  it('signs only that profile in with claude auth login', { skip: process.platform === 'win32' }, () => {
    const context = withFakeClaude(twoProfiles());
    writeFileSync(join(context.profiles, 'side', '.claude.json'), JSON.stringify({ oauthAccount: { emailAddress: 'old@studio.test', organizationType: 'claude_max' } }));
    const result = run(['login', 'side'], context);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(join(context.profiles, 'login-args'), 'utf8'), 'auth login\n');
    assert.equal(readFileSync(join(context.profiles, 'login-dir'), 'utf8'), join(context.profiles, 'side'));
    assert.match(result.stdout, /Signed in now: old@studio\.test · Max/);
    assert.match(result.stdout, /side is now signed in as new@studio\.test · Pro/);
    assert.ok(!existsSync(join(context.profiles, 'work', '.claude.json')), 'other profiles are untouched');
  });

  it('reports a sign-in that did not finish', { skip: process.platform === 'win32' }, () => {
    const context = withFakeClaude(twoProfiles(), '3');
    const result = run(['manage', 'login', 'side'], context);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Sign-in did not finish \(exit code 3\)/);
    assert.ok(!existsSync(join(context.profiles, 'side', '.claude.json')));
  });

  it('rejects an unknown profile before starting Claude', () => {
    const context = withFakeClaude(twoProfiles());
    const result = run(['login', 'nope'], context);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /No profile named "nope"/);
    assert.ok(!existsSync(join(context.profiles, 'login-args')));
  });
});
