// Reads what Claude Code saved in a profile, for display only. Nothing is written,
// and any field with an unexpected shape is left out instead of failing.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILES_DIR } from './constants.mjs';

const PLANS = { claude_max: 'Max', claude_pro: 'Pro', claude_team: 'Team', claude_enterprise: 'Enterprise' };

export function readConfig(dir) {
  try {
    const config = JSON.parse(readFileSync(join(dir, '.claude.json'), 'utf8'));
    return config && typeof config === 'object' ? config : {};
  } catch {
    return {};
  }
}

function percent(window) {
  const value = window?.utilization;
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : null;
}

function resetsAt(window) {
  const time = typeof window?.resets_at === 'string' ? Date.parse(window.resets_at) : NaN;
  return Number.isFinite(time) ? time : null;
}

// A saved window that has already reset no longer tells the current usage.
function windows(utilization, saved) {
  const read = (window) => {
    const reset = resetsAt(window);
    return saved && reset !== null && reset <= Date.now() ? [null, null] : [percent(window), reset];
  };
  const [fiveHour, fiveHourResetsAt] = read(utilization?.five_hour);
  const [weekly, weeklyResetsAt] = read(utilization?.seven_day);
  return fiveHour === null && weekly === null ? null : { fiveHour, weekly, fiveHourResetsAt, weeklyResetsAt };
}

// Claude Code keeps usage in an undocumented cache; it may change or disappear.
function savedUsage(cached, account) {
  if (!cached || typeof cached !== 'object') return null;
  if (typeof cached.accountUuid === 'string' && typeof account.accountUuid === 'string'
    && cached.accountUuid !== account.accountUuid) return null;
  const usage = windows(cached.utilization, true);
  return usage && { ...usage, savedAt: Number.isFinite(cached.fetchedAtMs) ? cached.fetchedAtMs : null };
}

function liveUsage(live) {
  const usage = windows(live, false);
  return usage && { ...usage, savedAt: null, live: true };
}

// `live` is what live-usage.mjs fetched for this profile; it wins over the cache when present.
export function accountInfo(name, live) {
  const dir = join(PROFILES_DIR, name);
  const config = readConfig(dir);
  const account = config.oauthAccount && typeof config.oauthAccount === 'object' ? config.oauthAccount : {};
  let lastUsed = null;
  try { lastUsed = statSync(join(dir, 'history.jsonl')).mtimeMs; } catch { /* never used */ }
  return {
    email: typeof account.emailAddress === 'string' && account.emailAddress ? account.emailAddress : null,
    plan: Object.hasOwn(PLANS, account.organizationType) ? PLANS[account.organizationType] : null,
    usage: liveUsage(live) ?? savedUsage(config.cachedUsageUtilization, account),
    lastUsed,
  };
}
