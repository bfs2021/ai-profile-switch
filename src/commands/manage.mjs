import * as prompt from '../lib/prompt.mjs';
import { readMeta } from '../lib/config.mjs';
import { color, displayWidth, error, pad, sym, warn } from '../lib/ui.mjs';
import { accountInfo } from '../lib/account.mjs';
import { connections, differences } from '../lib/connections.mjs';
import { liveUsage } from '../lib/live-usage.mjs';
import { LANGUAGE_NAMES, language as currentLanguage, relativeTime, t } from '../lib/i18n.mjs';
import { assertRegisteredProfile, checkRename } from '../lib/profile.mjs';
import { add } from './add.mjs';
import { importFrom, importHint } from './import-from.mjs';
import { list } from './list.mjs';
import { login, mcpLogin } from './login.mjs';
import { accountSummary, profileFooter, profileRows } from './shell.mjs';
import { use } from './use.mjs';
import { remove } from './remove.mjs';
import { rename } from './rename.mjs';
import { share, shareMenu } from './share.mjs';
import { language } from './language.mjs';

function help() {
  console.log(t('manage.help'));
}

export async function manage(args = []) {
  if (args.some(arg => ['--help', '-h'].includes(arg))) {
    help();
    return;
  }
  if (args.length === 1 && args[0] === '--list') return list();
  if (args[0] === 'share') return share(args.slice(1));
  if (args[0] === 'language') return language(args.slice(1));
  if (args.length === 1 && !args[0].startsWith('-')) return use(args[0]);
  if (args.length > 0) {
    const [command, ...names] = args;
    const operations = { add: [1, add], remove: [1, remove], rename: [2, rename], login: [1, login] };
    const operation = Object.hasOwn(operations, command) ? operations[command] : undefined;
    if (!operation || names.length !== operation[0] || names.some(name => name.startsWith('-'))) {
      throw new Error(t('manage.invalid'));
    }
    return operation[1](...names);
  }
  if (!process.stdin.isTTY) {
    help();
    return;
  }
  await home();
}

const ADD = ':add';
const SETTINGS = ':settings';

// The same profile list as claude, with "add" and "settings" under it. Enter opens a profile.
async function home() {
  let cursor = readMeta().activeProfile;
  while (true) {
    const meta = readMeta();
    const { choices, columns } = profileRows(meta.profiles, meta.activeProfile);
    const extra = [
      { label: t('home.add'), value: ADD, mark: '+', gap: true },
      { label: t('home.settings'), value: SETTINGS, mark: ' ', hint: color.dim(t('home.settingsHint')) },
    ];
    const values = [...choices, ...extra].map(item => item.value);
    const choice = await prompt.select(t('home.question'), [...choices, ...extra], {
      numbered: true, columns, clear: true, initial: Math.max(0, values.indexOf(cursor)),
      refresh: columns && liveUsage(meta.profiles)
        .then(live => ({ choices: [...profileRows(meta.profiles, meta.activeProfile, live).choices, ...extra] })),
      footer: (item, loading) => profileFooter(item, { loading }),
      keys: t('home.keys'),
      onRight: value => value,
    });
    if (!choice) return;
    cursor = choice;
    try {
      if (choice === ADD) {
        const name = await prompt.text(t('home.addName'));
        if (name) {
          await add(name);
          cursor = name;
        }
      } else if (choice === SETTINGS) {
        await settings();
      } else {
        cursor = await showProfile(choice);
      }
    } catch (err) {
      error(err.message, err.hints);
    }
  }
}

// Shows one profile until Esc and returns the name it ends with, which a rename changes.
export async function showProfile(name) {
  assertRegisteredProfile(name);
  let current = name;
  while (true) {
    let next;
    try {
      next = await profileScreen(current);
    } catch (err) {
      error(err.message, err.hints);
      next = current;
    }
    if (!next) return current;
    current = next;
  }
}

// "5-hour 5% · resets 18:29    Weekly 16% · resets October 30", and when the values
// are the ones Claude saved, how old they are.
function usageText(usage) {
  if (!usage) return color.dim(t('detail.noUsage'));
  const hour = new Intl.DateTimeFormat(currentLanguage(), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const day = new Intl.DateTimeFormat(currentLanguage(), { month: 'long', day: 'numeric' });
  const part = (label, percent, resetsAt, format) => (percent === null ? [] : [
    `${label} ${percent}%${resetsAt ? color.dim(` · ${t('detail.resetsAt', { time: format.format(resetsAt) })}`) : ''}`,
  ]);
  const parts = [
    ...part(t('account.fiveHour'), usage.fiveHour, usage.fiveHourResetsAt, hour),
    ...part(t('account.weekly'), usage.weekly, usage.weeklyResetsAt, day),
  ];
  const saved = !usage.live && usage.savedAt ? color.dim(`    ${t('account.savedAt', { time: relativeTime(usage.savedAt) })}`) : '';
  return `${parts.join('    ')}${saved}`;
}

function profileBody(account, servers) {
  const rows = [
    ...(account.email ? [[t('detail.usage'), usageText(account.usage)]] : []),
    [t('detail.connections'), servers.length
      ? servers.map(server => `${server.needsLogin ? color.yellow('!') : color.green(sym.check)} ${server.name}`).join('   ')
      : color.dim(t('common.none'))],
  ];
  const width = Math.max(...rows.map(([label]) => displayWidth(label)));
  return [...rows.map(([label, value]) => `${color.dim(pad(label, width))}  ${value}`), ''];
}

// Returns the profile to show again, or null to go back to the list.
async function profileScreen(name) {
  const meta = readMeta();
  const account = accountInfo(name);
  const { servers, needsLogin } = connections(name);
  const diffs = meta.profiles.length > 1 ? differences(name, meta.profiles) : null;
  const active = meta.activeProfile === name ? ` ${color.green(sym.bulletOn)}` : '';
  const action = await prompt.select(`${color.bold(name)}${active}  ${color.dim(accountSummary(account) || t('account.signedOut'))}`, [
    ...(meta.activeProfile === name ? [] : [{ label: t('detail.use'), value: 'use' }]),
    ...(needsLogin.length ? [{
      label: t('detail.signInTo', { names: needsLogin.join('·') }), value: 'mcpLogin', hint: color.dim(t('detail.signInToHint')),
    }] : []),
    ...(diffs ? [{ label: t('detail.import'), value: 'import', hint: importHint(diffs) }] : []),
    { label: t('detail.rename'), value: 'rename' },
    { label: t('detail.login'), value: 'login' },
    { label: t('detail.remove'), value: 'remove' },
  ], {
    body: profileBody(account, servers),
    refresh: account.email ? liveUsage([name]).then(live => ({ body: profileBody(accountInfo(name, live[name]), servers) })) : undefined,
    back: true, clear: true,
  });
  if (!action) return null;
  if (action === 'use') {
    await use(name);
    return name;
  }
  if (action === 'mcpLogin') {
    await mcpLogin(name, needsLogin);
    return name;
  }
  if (action === 'import') {
    await importFrom(name);
    return name;
  }
  if (action === 'remove') {
    await remove(name);
    return readMeta().profiles.includes(name) ? name : null;
  }
  if (action === 'rename') {
    warn(t('rename.closeSessions', { name }));
    const newName = await prompt.text(t('rename.newName'), undefined, t('rename.newNameHint', { name }));
    if (!newName || newName === name) return name;
    checkRename(name, newName);
    if (!await prompt.confirm(t('rename.confirm', { old: name, new: newName }), false)) return name;
    await rename(name, newName, { warned: true });
    return newName;
  }
  const summary = accountSummary(account);
  console.log(`${color.dim(sym.rail)}  ${color.dim(t('login.current'))} ${summary || color.dim(t('account.notSignedIn'))}`);
  console.log(`${color.dim(sym.rail)}  ${color.dim(t('login.onlyThis'))}`);
  console.log(`${color.dim(sym.rail)}  ${color.dim(t('login.browser'))}`);
  console.log(`${color.dim(sym.rail)}  ${color.dim(t('login.closeSessions', { name }))}`);
  if (await prompt.confirm(t('login.confirm', { name }), false)) await login(name, { explained: true });
  return name;
}

// Things set once for all profiles: what they share, and the screen language.
async function settings() {
  let cursor = 0;
  while (true) {
    const shared = readMeta().shared ?? [];
    const choice = await prompt.select(t('settings.title'), [
      {
        label: t('settings.share'), value: 'share',
        hint: color.dim(shared.length ? shared.map(entry => t(`entry.${entry}`)).join(' · ') : t('settings.shareNone')),
      },
      { label: t('settings.language'), value: 'language', hint: color.dim(LANGUAGE_NAMES[currentLanguage()]) },
    ], { back: true, clear: true, initial: cursor });
    if (!choice) return;
    cursor = choice === 'share' ? 0 : 1;
    try {
      if (choice === 'share') await shareMenu();
      else await language();
    } catch (err) {
      error(err.message, err.hints);
    }
  }
}
