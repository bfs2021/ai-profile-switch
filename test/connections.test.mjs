import './helpers/home.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { PROFILES_DIR } from '../src/lib/constants.mjs';
import { recordMcpLogin } from '../src/lib/config.mjs';
import { connections, differences } from '../src/lib/connections.mjs';

const loginURL = new URL('../src/commands/login.mjs', import.meta.url).href;
const importURL = new URL('../src/commands/import-from.mjs', import.meta.url).href;

function writeJson(path, value) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify(value));
}

function setProfiles(names) {
  writeJson(join(PROFILES_DIR, 'meta.json'), { version: 1, activeProfile: names[0], shareSettings: true, profiles: names });
}

// A profile folder as Claude Code leaves it: account file, plugins and marketplaces.
function profile(name, { config = {}, plugins = {}, marketplaces = {}, settings } = {}) {
  const dir = join(PROFILES_DIR, name);
  writeJson(join(dir, '.claude.json'), config);
  writeJson(join(dir, 'plugins', 'installed_plugins.json'), { version: 2, plugins });
  writeJson(join(dir, 'plugins', 'known_marketplaces.json'), marketplaces);
  if (settings) writeJson(join(dir, 'settings.json'), settings);
  return dir;
}

const official = { 'claude-plugins-official': { source: { source: 'github', repo: 'anthropics/claude-plugins-official' } } };

describe('profile connections', () => {
  it('lists user and project MCP servers, marks the ones waiting for a sign-in, and reads plugins', () => {
    setProfiles(['main']);
    profile('main', {
      config: {
        mcpServers: { figma: { type: 'http', url: 'https://example.test/mcp' }, files: { type: 'stdio', command: 'files-mcp' } },
        projects: { '/code/app': { mcpServers: { notion: { type: 'http' } } }, '/code/site': {} },
        mcpNeedsAuthNoticed: ['figma', 'notion', 'claude.ai Gmail', 42],
        claudeAiMcpEverConnected: ['claude.ai Gmail'],
      },
      plugins: { 'lint@claude-plugins-official': [{ scope: 'user' }], 'local@claude-plugins-official': [{ scope: 'project' }] },
      marketplaces: official,
    });
    const found = connections('main');
    assert.deepEqual(found.servers, [
      { name: 'figma', needsLogin: true }, { name: 'files', needsLogin: false },
      { name: 'notion', needsLogin: true }, { name: 'claude.ai Gmail', needsLogin: true },
    ]);
    assert.deepEqual(found.needsLogin, ['figma', 'notion', 'claude.ai Gmail']);
    assert.deepEqual(found.plugins, [{ id: 'lint@claude-plugins-official', marketplace: 'claude-plugins-official' }]);
    assert.deepEqual(found.marketplaces, { 'claude-plugins-official': 'anthropics/claude-plugins-official' });
    assert.deepEqual(found.claudeAi, ['claude.ai Gmail']);
  });

  it('survives a profile with no files or broken ones', () => {
    setProfiles(['empty', 'broken']);
    mkdirSync(join(PROFILES_DIR, 'empty'), { recursive: true });
    const dir = profile('broken');
    writeFileSync(join(dir, '.claude.json'), '{not json');
    writeFileSync(join(dir, 'plugins', 'installed_plugins.json'), '[');
    for (const name of ['empty', 'broken']) {
      assert.deepEqual(connections(name), {
        servers: [], needsLogin: [], userServers: {}, plugins: [], marketplaces: {}, claudeAi: [],
      });
    }
  });

  it('hides a sign-in cpf ran until Claude Code writes the profile again', () => {
    setProfiles(['signed']);
    const dir = profile('signed', { config: { mcpServers: { figma: { type: 'http' } }, mcpNeedsAuthNoticed: ['figma'] } });
    const file = join(dir, '.claude.json');
    recordMcpLogin('signed', 'figma', statSync(file).mtimeMs + 1000);
    assert.deepEqual(connections('signed').needsLogin, []);
    const later = new Date(Date.now() + 60000);
    utimesSync(file, later, later);
    assert.deepEqual(connections('signed').needsLogin, ['figma']);
  });

  it('drops the sign-ins of profiles that no longer exist', () => {
    setProfiles(['kept']);
    writeJson(join(PROFILES_DIR, 'meta.json'), {
      version: 1, activeProfile: 'kept', shareSettings: true, profiles: ['kept'], mcpLogins: { gone: { figma: 1 } },
    });
    recordMcpLogin('kept', 'notion', 5);
    assert.deepEqual(JSON.parse(readFileSync(join(PROFILES_DIR, 'meta.json'), 'utf8')).mcpLogins, { kept: { notion: 5 } });
  });
});

describe('differences between profiles', () => {
  it('lists the plugins and user servers another profile has, leaving out turned-off plugins', () => {
    setProfiles(['mine', 'theirs', 'twin']);
    profile('mine', { marketplaces: official, config: { claudeAiMcpEverConnected: ['claude.ai Gmail'] } });
    profile('twin', { marketplaces: official });
    profile('theirs', {
      config: {
        mcpServers: { figma: { type: 'http', url: 'https://example.test/mcp' } },
        projects: { '/code/app': { mcpServers: { notion: { type: 'http' } } } },
        claudeAiMcpEverConnected: ['claude.ai Gmail', 'claude.ai Drive'],
      },
      plugins: {
        'lint@claude-plugins-official': [{ scope: 'user' }],
        'off@claude-plugins-official': [{ scope: 'user' }],
        'warp@warp-market': [{ scope: 'user' }],
      },
      marketplaces: { ...official, 'warp-market': { source: { source: 'github', repo: 'example/warp' } } },
      settings: { enabledPlugins: { 'off@claude-plugins-official': false } },
    });
    assert.deepEqual(differences('mine'), [{
      from: 'theirs',
      plugins: [
        { id: 'lint@claude-plugins-official', marketplace: 'claude-plugins-official', known: true, source: 'anthropics/claude-plugins-official' },
        { id: 'warp@warp-market', marketplace: 'warp-market', known: false, source: 'example/warp' },
      ],
      servers: [{ name: 'figma', definition: { type: 'http', url: 'https://example.test/mcp' } }],
      claudeAi: ['claude.ai Drive'],
    }]);
  });
});

// A fake claude that writes each call's arguments, one line per call.
function fakeClaude(fail = '') {
  const bin = join(process.env.TMPDIR, `fake-claude-${Math.random().toString(36).slice(2)}`);
  mkdirSync(bin);
  writeFileSync(join(bin, 'claude'), `#!/bin/sh
printf '%s\\n' "$*" >> "$CLAUDE_CONFIG_DIR/../claude-calls"
${fail ? `case "$*" in *${fail}*) echo "could not reach ${fail}" >&2; exit 4;; esac` : ''}
exit 0
`, { mode: 0o755 });
  return { ...process.env, PATH: [bin, process.env.PATH].join(delimiter) };
}

function runModule(url, call, env) {
  const script = `const m = await import(${JSON.stringify(url)}); await m.${call};`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env, encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

const calls = () => readFileSync(join(PROFILES_DIR, 'claude-calls'), 'utf8').trim().split('\n');

describe('signing in and bringing things over', { skip: process.platform === 'win32' }, () => {
  it('signs in to each MCP server with claude mcp login and remembers the ones that worked', () => {
    setProfiles(['main']);
    profile('main', { config: { mcpNeedsAuthNoticed: ['figma', 'notion'] } });
    writeFileSync(join(PROFILES_DIR, 'claude-calls'), '');
    const output = runModule(loginURL, "mcpLogin('main', ['figma', 'notion'])", fakeClaude('notion'));
    assert.deepEqual(calls(), ['mcp login figma', 'mcp login notion']);
    assert.match(output, /Signed in to figma/);
    assert.match(output, /Could not sign in to notion/);
    const logins = JSON.parse(readFileSync(join(PROFILES_DIR, 'meta.json'), 'utf8')).mcpLogins;
    assert.deepEqual(Object.keys(logins.main), ['figma']);
    assert.deepEqual(connections('main').needsLogin, ['notion']);
  });

  it('brings plugins and user servers over with Claude Code commands', () => {
    setProfiles(['mine', 'theirs']);
    profile('mine', { marketplaces: official });
    profile('theirs', {
      config: { mcpServers: { figma: { type: 'http', url: 'https://example.test/mcp' } } },
      plugins: { 'lint@claude-plugins-official': [{ scope: 'user' }], 'warp@warp-market': [{ scope: 'user' }] },
      marketplaces: { ...official, 'warp-market': { source: { source: 'github', repo: 'example/warp' } } },
    });
    writeFileSync(join(PROFILES_DIR, 'claude-calls'), '');
    const output = runModule(importURL, "importFrom('mine')", fakeClaude('warp'));
    assert.deepEqual(calls(), [
      'plugin install lint@claude-plugins-official',
      'plugin install warp --marketplace example/warp',
      'mcp add-json -s user figma {"type":"http","url":"https://example.test/mcp"}',
    ]);
    assert.match(output, /✓ lint|v lint/);
    assert.match(output, /(✗|x) warp {2}could not reach warp/);
    assert.match(output, /Brought over 2\./);
  });

  it('says so when there is nothing to bring over', () => {
    setProfiles(['mine', 'twin']);
    profile('mine', { marketplaces: official });
    profile('twin', { marketplaces: official });
    assert.match(runModule(importURL, "importFrom('mine')", fakeClaude()), /no plugins or MCP servers that this one lacks/);
  });
});
