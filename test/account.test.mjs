import './helpers/home.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILES_DIR } from '../src/lib/constants.mjs';
import { accountInfo } from '../src/lib/account.mjs';

function profile(name, config) {
  const dir = join(PROFILES_DIR, name);
  mkdirSync(dir, { recursive: true });
  if (config !== undefined) writeFileSync(join(dir, '.claude.json'), typeof config === 'string' ? config : JSON.stringify(config));
  return dir;
}

describe('account info', () => {
  it('reads the email, plan, usage and last use', () => {
    const dir = profile('full', {
      oauthAccount: { accountUuid: 'a', emailAddress: 'kim@company.test', organizationType: 'claude_max' },
      cachedUsageUtilization: {
        accountUuid: 'a', fetchedAtMs: 1000,
        utilization: { five_hour: { utilization: 28.4 }, seven_day: { utilization: 140 } },
      },
    });
    writeFileSync(join(dir, 'history.jsonl'), '{}\n');
    const info = accountInfo('full');
    assert.equal(info.email, 'kim@company.test');
    assert.equal(info.plan, 'Max');
    assert.deepEqual(info.usage, { fiveHour: 28, weekly: 100, fiveHourResetsAt: null, weeklyResetsAt: null, savedAt: 1000 });
    assert.equal(typeof info.lastUsed, 'number');
  });

  it('returns empty fields for a profile that never signed in', () => {
    profile('fresh');
    assert.deepEqual(accountInfo('fresh'), { email: null, plan: null, usage: null, lastUsed: null });
  });

  it('survives a broken or unexpected file', () => {
    for (const [name, config] of [['broken', '{not json'], ['array', []], ['number', 5], ['null', 'null']]) {
      profile(name, config);
      assert.deepEqual(accountInfo(name), { email: null, plan: null, usage: null, lastUsed: null }, name);
    }
  });

  it('hides fields whose shape changed', () => {
    profile('changed', {
      oauthAccount: { emailAddress: 42, organizationType: 'claude_future' },
      cachedUsageUtilization: { utilization: { five_hour: { utilization: '28' }, seven_day: null } },
    });
    assert.deepEqual(accountInfo('changed'), { email: null, plan: null, usage: null, lastUsed: null });
  });

  it('keeps one usage window when the other is missing', () => {
    profile('partial', { cachedUsageUtilization: { utilization: { seven_day: { utilization: 61 } } } });
    assert.deepEqual(accountInfo('partial').usage, { fiveHour: null, weekly: 61, fiveHourResetsAt: null, weeklyResetsAt: null, savedAt: null });
  });

  it('drops usage saved for a different account', () => {
    profile('switched', {
      oauthAccount: { accountUuid: 'new', emailAddress: 'me@mail.test' },
      cachedUsageUtilization: { accountUuid: 'old', utilization: { five_hour: { utilization: 90 } } },
    });
    assert.equal(accountInfo('switched').usage, null);
  });

  it('prefers live usage and falls back to the cache when it has no windows', () => {
    profile('live', {
      cachedUsageUtilization: { fetchedAtMs: 1000, utilization: { five_hour: { utilization: 10 } } },
    });
    assert.deepEqual(accountInfo('live', { five_hour: { utilization: 54.6 }, seven_day: { utilization: 12 } }).usage,
      { fiveHour: 55, weekly: 12, fiveHourResetsAt: null, weeklyResetsAt: null, savedAt: null, live: true });
    assert.deepEqual(accountInfo('live', { five_hour: null }).usage,
      { fiveHour: 10, weekly: null, fiveHourResetsAt: null, weeklyResetsAt: null, savedAt: 1000 });
  });

  it('reads when each window resets and drops a saved window that already reset', () => {
    const later = new Date(Date.now() + 3600000).toISOString();
    const earlier = new Date(Date.now() - 60000).toISOString();
    profile('resets', {
      cachedUsageUtilization: { fetchedAtMs: 1000, utilization: {
        five_hour: { utilization: 70, resets_at: earlier }, seven_day: { utilization: 20, resets_at: later },
      } },
    });
    assert.deepEqual(accountInfo('resets').usage,
      { fiveHour: null, weekly: 20, fiveHourResetsAt: null, weeklyResetsAt: Date.parse(later), savedAt: 1000 });
    assert.deepEqual(accountInfo('resets', { five_hour: { utilization: 3, resets_at: later }, seven_day: { utilization: 21, resets_at: 'soon' } }).usage,
      { fiveHour: 3, weekly: 21, fiveHourResetsAt: Date.parse(later), weeklyResetsAt: null, savedAt: null, live: true });
  });

  it('does not change the file it reads', () => {
    const dir = profile('untouched', { oauthAccount: { emailAddress: 'a@b.test' } });
    const before = readFileSync(join(dir, '.claude.json'), 'utf8');
    accountInfo('untouched');
    assert.equal(readFileSync(join(dir, '.claude.json'), 'utf8'), before);
  });
});
