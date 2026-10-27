import { spawn } from 'node:child_process';
import { accountInfo } from '../lib/account.mjs';
import { recordMcpLogin } from '../lib/config.mjs';
import { t } from '../lib/i18n.mjs';
import { assertRegisteredProfile, profileDir } from '../lib/profile.mjs';
import { color, info, outro, success, sym, userError, warn } from '../lib/ui.mjs';
import { accountSummary, resolveClaudeBinary } from './shell.mjs';

export function requireClaude() {
  const bin = resolveClaudeBinary();
  if (!bin) throw userError(t('launch.notFound'), [{ label: t('launch.install'), text: 'https://code.claude.com/docs/en/setup' }]);
  return bin;
}

// Runs Claude Code for one profile. capture keeps its output for a short result line and
// gives up after two minutes; otherwise it has the terminal, for sign-ins that open a
// browser, and Ctrl+C stops only it.
export function runClaude(bin, name, args, { capture = false } = {}) {
  const cmd = bin.endsWith('.js') ? process.execPath : bin;
  return new Promise(resolve => {
    const child = spawn(cmd, bin.endsWith('.js') ? [bin, ...args] : args, {
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', shell: false,
      env: { ...process.env, CLAUDE_CONFIG_DIR: profileDir(name) },
      ...(capture ? { timeout: 120000 } : {}),
    });
    let output = '';
    for (const stream of [child.stdout, child.stderr]) stream?.on('data', chunk => { output += chunk; });
    const ignore = () => {};
    if (!capture) process.on('SIGINT', ignore);
    const done = result => {
      process.removeListener('SIGINT', ignore);
      resolve(result);
    };
    child.once('error', err => done({ code: 1, output: err.message }));
    child.once('close', (code, signal) => done({ code: code ?? 1, signal, output }));
  });
}

// Signs one profile in again with Claude Code's own login; other profiles keep theirs.
// explained: the menu already showed the current sign-in and what will happen.
export async function login(name, { explained = false } = {}) {
  if (!name) throw new Error(t('login.usage'));
  assertRegisteredProfile(name);
  const bin = requireClaude();
  const before = accountSummary(accountInfo(name));
  if (!explained) {
    console.log(`  ${color.dim(t('login.current'))} ${before || color.dim(t('account.notSignedIn'))}`);
    warn(t('login.closeSessions', { name }));
  }
  console.log(`  ${color.dim(t('login.opening'))}`);
  const { code } = await runClaude(bin, name, ['auth', 'login']);
  if (code !== 0) throw new Error(t('login.failed', { code }));
  const after = accountSummary(accountInfo(name));
  if (!after) warn(t('login.notSaved', { name }));
  else if (after === before) info(t('login.same', { name, account: after }));
  else {
    success(t('login.done', { name, account: color.bold(after) }));
    console.log(`    ${color.dim(t('login.usageLater'))}`);
  }
}

// Signs the profile in to MCP servers one by one with `claude mcp login`. Sign-ins are
// never copied from another profile: they are renewed often, and a copy soon stops working.
export async function mcpLogin(name, servers) {
  assertRegisteredProfile(name);
  const bin = requireClaude();
  const rail = color.dim(sym.rail);
  console.log(`${color.cyan(sym.step)}  ${color.bold(t('detail.signInTo', { names: servers.join('·') }))}  ${color.dim(name)}`);
  console.log(`${rail}  ${t('mcpLogin.browser')}`);
  const done = [];
  for (const server of servers) {
    console.log(rail);
    const { code, signal } = await runClaude(bin, name, ['mcp', 'login', server]);
    if (code === 0) {
      recordMcpLogin(name, server);
      done.push(server);
      console.log(`${rail}  ${color.green(sym.check)} ${t('mcpLogin.done', { server })}`);
    } else {
      console.log(`${rail}  ${color.red(sym.cross)} ${t('mcpLogin.failed', { server })}`);
      if (signal || code === 130) break;
    }
  }
  outro(done.length ? t('mcpLogin.next') : color.dim(t('mcpLogin.none')));
}
