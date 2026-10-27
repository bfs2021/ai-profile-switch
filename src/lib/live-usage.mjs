// Asks Anthropic for current usage with the sign-in Claude Code saved for each profile.
// The endpoint is undocumented, so any failure leaves the profile out and the cached value shows instead.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { PROFILES_DIR } from './constants.mjs';

const run = promisify(execFile);
const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';
const TIMEOUT_MS = 1500;
// Screens of one cpf session ask again and again; an answer, or no answer, stays good this long.
const REUSE_MS = 30000;
const answers = new Map();

// Claude Code names the Keychain item after a hash of the profile folder.
async function readCredentials(dir, signal) {
  if (process.platform !== 'darwin') return readFile(join(dir, '.credentials.json'), { encoding: 'utf8', signal });
  const service = `Claude Code-credentials-${createHash('sha256').update(dir).digest('hex').slice(0, 8)}`;
  const { stdout } = await run('security', ['find-generic-password', '-s', service, '-w'], { signal });
  return stdout;
}

// Refreshing here would rotate the token Claude Code holds, so an expired one is skipped.
async function readToken(dir, signal) {
  const oauth = JSON.parse(await readCredentials(dir, signal))?.claudeAiOauth;
  return typeof oauth?.accessToken === 'string' && oauth.expiresAt > Date.now() ? oauth.accessToken : null;
}

async function fetchUsage(name, signal) {
  try {
    const token = await readToken(join(PROFILES_DIR, name), signal);
    if (!token) return null;
    const response = await fetch(USAGE_URL, {
      headers: { Authorization: `Bearer ${token}`, 'anthropic-beta': 'oauth-2025-04-20' },
      signal,
    });
    const usage = response.ok ? await response.json() : null;
    return usage && typeof usage === 'object' ? usage : null;
  } catch {
    return null;
  }
}

// Returns { [profile]: raw usage } for the profiles that answered in time. CPF_LIVE_USAGE=0 turns it off.
// signal stops the requests early, such as when a profile was picked before they finished.
export async function liveUsage(names, { signal } = {}) {
  if (process.env.CPF_LIVE_USAGE === '0') return {};
  const asking = names.filter(name => !(Date.now() - (answers.get(name)?.at ?? -Infinity) < REUSE_MS));
  if (asking.length) {
    const controller = new AbortController();
    const stop = () => controller.abort();
    const timer = setTimeout(stop, TIMEOUT_MS);
    signal?.addEventListener('abort', stop, { once: true });
    const results = await Promise.all(asking.map(async name => [name, await fetchUsage(name, controller.signal)]));
    clearTimeout(timer);
    signal?.removeEventListener('abort', stop);
    if (!signal?.aborted) for (const [name, usage] of results) answers.set(name, { at: Date.now(), usage });
  }
  return Object.fromEntries(names.map(name => [name, answers.get(name)?.usage]).filter(([, usage]) => usage));
}
