import * as prompt from '../lib/prompt.mjs';
import { differences } from '../lib/connections.mjs';
import { t } from '../lib/i18n.mjs';
import { cursorControl, color, info, outro, sym } from '../lib/ui.mjs';
import { requireClaude, runClaude } from './login.mjs';

// "3 plugins · 1 MCP server", from lists of plugins and servers.
export function countText({ plugins, servers }) {
  const count = (key, n) => (n ? [t(n === 1 ? `count.${key}One` : `count.${key}`, { count: n })] : []);
  return [...count('plugins', plugins.length), ...count('servers', servers.length)].join(' · ');
}

// One line for the profile screen: what other profiles have that this one does not.
export function importHint(diffs) {
  if (!diffs.length) return color.dim(t('detail.importNone'));
  const unique = list => [...new Set(list)];
  return color.dim(t('detail.importHint', {
    from: diffs.map(diff => diff.from).join('·'),
    what: countText({
      plugins: unique(diffs.flatMap(diff => diff.plugins.map(plugin => plugin.id))),
      servers: unique(diffs.flatMap(diff => diff.servers.map(server => server.name))),
    }),
  }));
}

// Installs with Claude Code's own commands, so the profile records them as it would by hand.
function command({ kind, item }) {
  if (kind === 'server') return ['mcp', 'add-json', '-s', 'user', item.name, JSON.stringify(item.definition)];
  if (item.known || !item.source) return ['plugin', 'install', item.id];
  return ['plugin', 'install', item.id.split('@')[0], '--marketplace', item.source];
}

// The last line Claude printed says best why something did not come over.
const lastLine = output => output.trim().split('\n').pop()?.trim() ?? '';

// Copies plugins and user MCP servers from another profile. Sign-ins and claude.ai
// connectors stay with each account, so they are only mentioned.
export async function importFrom(name) {
  const diffs = differences(name);
  if (!diffs.length) {
    info(t('import.nothing'));
    return;
  }
  const from = diffs.length === 1 ? diffs[0].from : await prompt.select(t('import.which'), diffs.map(diff => ({
    label: diff.from, value: diff.from, hint: color.dim(countText(diff)),
  })), { back: true, clear: true });
  if (!from) return;
  const diff = diffs.find(item => item.from === from);
  const items = [
    ...diff.plugins.map(item => ({ kind: 'plugin', item, label: item.id.split('@')[0] })),
    ...diff.servers.map(item => ({ kind: 'server', item, label: item.name })),
  ];
  const kindHint = kind => color.dim(t(kind === 'plugin' ? 'import.plugin' : 'import.server'));
  const chosen = await prompt.multiselect(
    `${color.bold(t('import.title', { from }))}  ${color.dim(t('import.missing', { name, what: countText(diff) }))}`,
    items.map((entry, index) => ({ label: entry.label, value: index, hint: kindHint(entry.kind) })),
    {
      checked: items.map((_, index) => index),
      notes: diff.claudeAi.length ? [t('import.claudeAi')] : [],
      keys: t('import.keys'),
      clear: true,
    },
  );
  if (!chosen?.length) return;
  const bin = requireClaude();
  const cursor = cursorControl();
  const rail = color.dim(sym.rail);
  console.log(`${color.cyan(sym.step)}  ${color.bold(t('import.title', { from }))}  ${color.dim(name)}`);
  let added = 0;
  for (const index of chosen) {
    const entry = items[index];
    if (cursor.enabled) process.stdout.write(`${rail}  ${color.dim(sym.dots)} ${entry.label}`);
    const { code, output } = await runClaude(bin, name, command(entry), { capture: true });
    const line = code === 0
      ? `${color.green(sym.check)} ${entry.label}`
      : `${color.red(sym.cross)} ${entry.label}  ${color.dim(lastLine(output) || t('import.failed', { code }))}`;
    process.stdout.write(`${cursor.enabled ? `\r${cursor.clearLine}` : ''}${rail}  ${line}\n`);
    if (code === 0) added += 1;
  }
  outro(added ? t('import.done', { count: added }) : color.dim(t('import.none')));
}
