import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { error, color } from './lib/ui.mjs';
import { t } from './lib/i18n.mjs';

const pkg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8'));

const COMMANDS = {
  init: () => import('./commands/init.mjs').then(m => m.init()),
  add: args => import('./commands/add.mjs').then(m => m.add(args[0])),
  remove: args => import('./commands/remove.mjs').then(m => m.remove(args[0])),
  rename: args => import('./commands/rename.mjs').then(m => m.rename(...args)),
  login: args => import('./commands/login.mjs').then(m => m.login(args[0])),
  list: () => import('./commands/list.mjs').then(m => m.list()),
  use: args => import('./commands/use.mjs').then(m => m.use(args[0])),
  manage: args => import('./commands/manage.mjs').then(m => m.manage(args)),
  'install-shell': () => import('./commands/install-shell.mjs').then(m => m.installShell()),
  migrate: args => import('./commands/migrate.mjs').then(m => m.migrate(undefined, args)),
  share: args => import('./commands/share.mjs').then(m => m.share(args)),
  language: args => import('./commands/language.mjs').then(m => m.language(args)),
  mcp: args => import('./commands/mcp/index.mjs').then(m => m.mcp(args)),
  update: args => import('./commands/update.mjs').then(m => m.update(args)),
  shell: args => import('./commands/shell.mjs').then(m => m.shell(args)),
};

const USAGE = {
  init: 'init',
  add: 'add <name>',
  remove: 'remove <name>',
  rename: 'rename <old-name> <new-name>',
  login: 'login <name>',
  list: 'list',
  use: 'use <name>',
  manage: 'manage [profile | add <name> | rename <old-name> <new-name> | remove <name> | --list]',
  'install-shell': 'install-shell',
  migrate: 'migrate [profile] [--from <path>]',
  share: 'share [list | add <entry> | remove <entry> | sync]',
  language: 'language [auto | en | ko]',
  mcp: 'mcp [list]',
  update: 'update [--check] [--self] [--claude-code] [--yes]',
  shell: 'shell <launch|use|pick|detail|refresh>',
};
const POSITIONAL_COUNTS = { init: 0, add: 1, remove: 1, rename: 2, login: 1, list: 0, use: 1, 'install-shell': 0 };

const COMMAND_NOTES = { login: 'index.helpLogin', rename: 'index.helpRename', remove: 'index.helpRemove', add: 'index.helpAdd', use: 'index.helpUse' };

function showHelp(command) {
  if (command) {
    console.log(t('index.usage', { usage: USAGE[command] }));
    if (Object.hasOwn(COMMAND_NOTES, command)) console.log(t(COMMAND_NOTES[command]));
    return;
  }
  console.log(t('index.help', { title: color.bold('ai-profile-switch') }));
}

export async function run(argv) {
  const [command, ...args] = argv;
  if (!command || ['help', '--help', '-h'].includes(command)) {
    if (command === 'help' && args.length === 1 && Object.hasOwn(COMMANDS, args[0])) showHelp(args[0]);
    else showHelp();
    return;
  }
  if (['--version', '-v'].includes(command)) {
    console.log(pkg.version);
    return;
  }
  if (!Object.hasOwn(COMMANDS, command)) {
    error(t('index.unknown', { command }));
    showHelp();
    process.exitCode = 1;
    return;
  }
  try {
    // Claude's forwarded arguments must reach it unchanged.
    const wantsHelp = command === 'shell'
      ? ['--help', '-h'].includes(args[0])
      : command !== 'manage' && args.some(arg => ['--help', '-h'].includes(arg));
    if (wantsHelp) {
      showHelp(command);
      return;
    }
    if (Object.hasOwn(POSITIONAL_COUNTS, command)
      && (args.length !== POSITIONAL_COUNTS[command] || args.some(arg => arg.startsWith('-')))) {
      throw new Error(t('index.usage', { usage: USAGE[command] }));
    }
    await COMMANDS[command](args);
  } catch (err) {
    error(err.message, err.hints);
    process.exitCode = 1;
  }
}
