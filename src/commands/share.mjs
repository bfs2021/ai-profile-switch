import * as prompt from '../lib/prompt.mjs';
import { color, info, success, warn } from '../lib/ui.mjs';
import { SHAREABLE_ENTRIES, SHARED_FILES, SHARED_DIRS } from '../lib/constants.mjs';
import { readMeta } from '../lib/config.mjs';
import { shareEntry, syncShared, unshareEntry } from '../lib/shared.mjs';
import { t } from '../lib/i18n.mjs';

export function reportConflicts(results) {
  for (const { name, conflicts, missing } of results) {
    for (const entry of conflicts) {
      warn(t('share.keptOwn', { name, entry }));
    }
    for (const entry of missing) warn(t('share.missing', { name, entry }));
  }
}

function status() {
  const meta = readMeta();
  const shared = meta.shared ?? [];
  console.log();
  console.log(`  ${color.bold(t('share.title'))} ${[...SHARED_FILES, ...SHARED_DIRS, ...shared].join(', ')}`);
  const more = SHAREABLE_ENTRIES.filter(entry => !shared.includes(entry)).join(', ') || t('share.nothingLeft');
  console.log(`  ${color.dim(t('share.canAlso', { list: more }))}`);
  console.log();
  for (const result of syncShared(meta.profiles, { dryRun: true })) {
    const problems = [
      ...result.conflicts.map(entry => color.yellow(t('share.own', { entry }))),
      ...result.linked.map(entry => t('share.notLinked', { entry })),
      ...result.missing.map(entry => color.red(t('share.missingShort', { entry }))),
    ];
    console.log(`  ${result.name.padEnd(12)} ${problems.length ? problems.join(', ') : color.green(t('share.inSync'))}`);
  }
  if (!shared.length) info(t('share.nothingExtra'));
  console.log();
}

export async function share(args = []) {
  const [command, entry, ...rest] = args;
  if (rest.length || (['add', 'remove'].includes(command) ? !entry : entry !== undefined)) {
    throw new Error(t('share.usage'));
  }
  if (!command || command === 'list') return status();
  if (command === 'sync') {
    const results = syncShared();
    reportConflicts(results);
    success(t('share.linked', { count: results.reduce((count, result) => count + result.linked.length, 0) }));
    return;
  }
  if (command === 'add') {
    const results = shareEntry(entry);
    reportConflicts(results);
    success(t('share.added', { entry }));
    return;
  }
  if (command === 'remove') {
    unshareEntry(entry);
    success(t('share.removed', { entry }));
    return;
  }
  throw new Error(t('share.usage'));
}

// The settings screen order: what people share most comes first.
const MENU_ENTRIES = [
  'CLAUDE.md', 'skills', 'output-styles', 'agents', 'rules', 'hooks', 'keybindings.json', 'workflows', 'themes',
];

// Turns sharing on and off with Space; only what changed is applied.
export async function shareMenu() {
  const shared = readMeta().shared ?? [];
  const chosen = await prompt.multiselect(`${color.bold(t('share.menu'))}  ${color.dim(t('share.menuNote'))}`,
    MENU_ENTRIES.map(entry => ({ label: t(`entry.${entry}`), value: entry })),
    { checked: shared, notes: [t('share.menuAlways')], keys: t('share.menuKeys'), clear: true });
  if (!chosen) return;
  for (const entry of MENU_ENTRIES) {
    if (chosen.includes(entry) && !shared.includes(entry)) {
      reportConflicts(shareEntry(entry));
      success(t('share.added', { entry }));
    } else if (!chosen.includes(entry) && shared.includes(entry)) {
      unshareEntry(entry);
      success(t('share.removed', { entry }));
    }
  }
}
