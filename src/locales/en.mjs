// English messages. Every key here must also exist in ko.mjs.
export default {
  'time.justNow': 'just now',

  'prompt.keys': 'Enter select · Esc cancel',
  'prompt.keysBack': 'Enter select · Esc back',
  'prompt.keysMulti': 'Space choose · Enter confirm · Esc back',
  'prompt.cancelled': 'cancelled',
  'prompt.yes': 'Yes',
  'prompt.no': 'No',
  'common.cancelled': 'Cancelled.',
  'common.none': 'none',

  'picker.question': 'Which profile do you want to use?',
  'picker.starting': 'Starting with {profile}',
  'picker.switched': 'Now using {profile}',
  'picker.keys': 'Enter start · → details · Esc cancel',
  'picker.keysSwitch': 'Enter switch · → details · Esc cancel',
  'picker.needsLogin': 'Sign-in needed: {names}',
  'picker.fixHere': '→ to do it here',
  'picker.signInOnStart': 'Claude asks you to sign in when it starts',
  'picker.usageAt': 'Usage as of {time}',
  'launch.notFound': 'Claude Code was not found on this computer.',
  'launch.install': 'Install it:',
  'launch.startFailed': 'Could not start Claude Code: {message}',
  'launch.sharedFailed': 'Shared settings were not linked: {message}',

  'account.fiveHour': '5-hour',
  'account.weekly': 'Weekly',
  'account.savedAt': 'as of {time}',
  'account.notSignedIn': 'Not signed in yet',
  'account.signedOut': 'not signed in',

  'profile.empty': 'Profile name cannot be empty',
  'profile.tooLong': 'Profile name must be {max} characters or fewer',
  'profile.reserved': '"{name}" is a reserved name',
  'profile.reservedWindows': '"{name}" is a reserved Windows device name',
  'profile.invalidName': 'Only lowercase letters, numbers, and hyphens (-) are allowed, starting and ending with a letter or number',
  'profile.notFound': 'No profile named "{name}"',
  'profile.exists': 'Profile "{name}" already exists',
  'profile.missingDir': 'Profile "{name}" directory is missing',
  'profile.notDirectory': 'Profile "{name}" must be a directory, not a symbolic link or file',
  'profile.copiedInstead': 'Links are not allowed here, so the shared file was copied instead ({link}).',
  'profile.devMode': 'Turn on Windows Developer Mode to keep shared settings in sync.',
  'profiles.none': 'No profiles yet.',
  'hint.profiles': 'Profiles:',
  'hint.create': 'To create it:',
  'hint.add': 'Add one:',
  'hint.setup': 'First setup:',
  'hint.try': 'Try:',

  'use.switched': 'Switched to profile: {profile}',
  'use.already': '"{profile}" is already the active profile',
  'use.note': 'New Claude launches use it. Running sessions keep their profile.',

  'add.created': 'Created profile: {name}',
  'add.next': 'Next',
  'add.step1': 'Run {command}',
  'add.step2': 'Pick {name} from the list',
  'add.step3': 'Sign in with the Claude account you want to use',

  'remove.activeWarn': '"{name}" is the active profile',
  'remove.confirm': 'Delete profile "{name}"? Its sign-in and history are deleted and cannot be restored',
  'remove.done': 'Removed profile: {name}',
  'remove.newActive': 'Active profile is now {name}',
  'remove.none': 'No profiles left.',

  'rename.closeSessions': 'Close Claude windows using {name} first. Open windows keep using the old folder.',
  'rename.macSignIn': 'macOS may ask you to sign in once more.',
  'rename.done': 'Renamed profile: {old} → {new}',
  'rename.same': '"{name}" already has that name',

  'share.keptOwn': '{name}: kept its own {entry} because it differs from the shared copy. Move or delete it, then run cpf share sync.',
  'share.missing': '{name}: shared {entry} is missing from _shared.',
  'share.title': 'Shared by every profile:',
  'share.canAlso': 'Can also share: {list}',
  'share.nothingLeft': 'nothing left',
  'share.own': 'own {entry}',
  'share.notLinked': '{entry} not linked yet',
  'share.missingShort': '{entry} missing',
  'share.inSync': 'in sync',
  'share.nothingExtra': 'Nothing extra is shared yet. Example: cpf share add CLAUDE.md',
  'share.usage': 'Usage: cpf share [list | add <entry> | remove <entry> | sync]',
  'share.linked': 'Linked {count} entries.',
  'share.added': 'Sharing {entry} through ~/.claude-profiles/_shared/{entry}',
  'share.removed': 'Stopped sharing {entry}. Each profile kept its own copy.',
  'share.cannot': '"{entry}" cannot be shared. Choose one of: {list}',
  'share.needsSettings': 'Sharing needs shared settings. This setup keeps each profile separate.',
  'share.already': '"{entry}" is already shared',
  'share.notShared': '"{entry}" is not shared',
  'share.menu': 'Sharing',
  'share.menuNote': 'every profile uses what is on',
  'share.menuAlways': 'Settings and commands are always shared. MCP servers stay with each account.',
  'share.menuKeys': 'Space on or off · Enter apply · Esc cancel',
  'entry.CLAUDE.md': 'CLAUDE.md',
  'entry.skills': 'Skills',
  'entry.output-styles': 'Output styles',
  'entry.agents': 'Agents',
  'entry.rules': 'Rules',
  'entry.hooks': 'Hooks',
  'entry.keybindings.json': 'Key bindings',
  'entry.workflows': 'Workflows',
  'entry.themes': 'Themes',

  'list.title': 'Profiles:',
  'list.active': 'Active: {name}',

  'install.done': 'Installed the claude and cpf commands.',
  'install.shells': 'Ready in {shells}',
  'install.next': 'Open a new terminal, then run claude to start or cpf to manage profiles.',
  'shell.refreshed': 'Refreshed the shell commands.',

  'update.claudeManaged': 'Claude Code manages its own updates. Run claude update (or your package manager).',
  'update.seeSetup': 'See https://code.claude.com/docs/en/setup',
  'update.notChecked': 'Claude Code update status was not checked.',
  'update.package': 'Package',
  'update.installed': 'Installed',
  'update.latest': 'Latest',
  'update.upToDate': 'ai-profile-switch is up to date.',
  'update.runToInstall': 'Run npx ai-profile-switch@latest update to install.',
  'update.updated': 'Updated to {version}. New launches use it; running sessions are not affected.',
  'update.notInstalled': 'The shell commands are not installed, so no installation was run. Run: npx ai-profile-switch@latest install-shell',
  'update.busy': 'An update is already running.',
  'update.failed': 'Update failed; the current version is kept: {error}',

  'migrate.noProfiles': 'No profiles yet. Run npx ai-profile-switch@latest init first.',
  'migrate.target': 'Copy into which profile?',
  'migrate.which': 'Which configuration do you want to copy?',
  'migrate.customPath': 'Enter a custom path',
  'migrate.enterPath': 'Enter the full path to the directory:',
  'migrate.emptySource': 'Source path cannot be empty.',
  'migrate.source': 'From:',
  'migrate.profile': 'Into:',
  'migrate.conflictNote': 'If the profile already has conflicting data, nothing is copied. The source is left as it is.',
  'migrate.closeSessions': 'Close Claude sessions using the source or destination before continuing. Keep them closed until migration finishes.',
  'migrate.confirm': 'Copy configuration into "{name}"?',
  'migrate.copied': 'Copied {source} → profile: {name}',
  'migrate.backup': 'Previous destination data backup: {path}',
  'migrate.preserved': 'The original folder was kept. macOS Keychain sign-ins are not copied.',
  'migrate.signIn': 'Claude will check your sign-in when you start this profile.',

  'init.already': 'ai-profile-switch is already initialized.',
  'init.profiles': 'Profiles:',
  'init.active': 'Active:',
  'init.addHint': 'Add a profile:',
  'init.repairHint': 'Repair the shell commands:',
  'init.title': 'Get started with ai-profile-switch',
  'init.tagline': 'Keep several Claude accounts on one computer as profiles',
  'init.closeSessions': 'Keep Claude windows closed while your current settings are copied.',
  'init.names': 'Profile names, separated by commas',
  'init.duplicate': '"{name}" is listed twice',
  'init.used': '"{name}" is already used — choose a different name',
  'init.activeQuestion': 'Which profile should be active by default?',
  'init.shareQuestion': 'Share settings.json and commands across profiles?',
  'init.copyQuestion': 'Copy an existing Claude configuration?',
  'init.skip': 'Skip',
  'init.dirExists': 'Profile directory "{name}" already exists. Choose another name.',
  'init.ready': 'Profile ready: {name}',
  'init.shells': 'Shell commands installed ({shells})',
  'init.activeDone': 'Active profile: {name}',
  'init.openTerminal': 'Open a new terminal and run {command}. Claude will ask you to sign in if needed.',
  'init.otherProfile': 'To use another profile:',

  'home.question': 'Profiles',
  'home.add': 'Add a profile',
  'home.addName': 'New profile name (empty to cancel):',
  'home.settings': 'Settings',
  'home.settingsHint': 'sharing · language',
  'home.keys': 'Enter details · Esc quit',
  'settings.title': 'Settings',
  'settings.share': 'Sharing',
  'settings.shareNone': 'settings and commands only',
  'settings.language': 'Language',
  'detail.usage': 'Usage',
  'detail.noUsage': 'none saved yet',
  'detail.resetsAt': 'resets {time}',
  'detail.connections': 'Connected',
  'detail.use': 'Use this profile',
  'detail.signInTo': 'Sign in to {names}',
  'detail.signInToHint': 'just allow it in the browser',
  'detail.import': 'Bring over from another profile',
  'detail.importHint': '{what} in {from}',
  'detail.importNone': 'same as the others',
  'detail.rename': 'Rename',
  'detail.login': 'Change Claude account',
  'detail.remove': 'Delete',
  'import.nothing': 'Other profiles have no plugins or MCP servers that this one lacks.',
  'import.which': 'Bring over from which profile?',
  'import.title': 'Bring over from {from}',
  'import.missing': '{what} that {name} does not have',
  'import.plugin': 'plugin',
  'import.server': 'MCP server',
  'import.claudeAi': 'claude.ai connectors such as Gmail or Drive are turned on for each account at claude.ai.',
  'import.keys': 'Space choose · Enter bring over · Esc back',
  'import.failed': 'exit code {code}',
  'import.done': 'Brought over {count}. They are ready the next time you open Claude with this profile.',
  'import.none': 'Nothing was brought over.',
  'count.plugins': '{count} plugins',
  'count.pluginsOne': '{count} plugin',
  'count.servers': '{count} MCP servers',
  'count.serversOne': '{count} MCP server',
  'rename.newName': 'New name',
  'rename.newNameHint': 'now: {name} · empty to cancel',
  'rename.confirm': 'Rename {old} to {new}?',
  'rename.kept': 'Sign-in, history, and settings are kept.',
  'rename.next': 'Next time, pick {name} in the {command} list.',
  'hint.otherName': 'Use another name:',
  'login.current': 'Signed in now:',
  'login.onlyThis': 'Only this profile changes; other profiles stay signed in.',
  'login.browser': 'When the browser opens, sign in with the Claude account you want.',
  'login.closeSessions': 'Close Claude windows using {name} first.',
  'login.confirm': 'Change the sign-in for {name}?',
  'login.opening': 'Opening Claude Code sign-in… (claude auth login)',
  'login.done': '{name} is now signed in as {account}',
  'login.same': '{name} is still signed in as {account}',
  'login.notSaved': 'Could not read the new sign-in. Start {name} with claude to check.',
  'login.failed': 'Sign-in did not finish (exit code {code}).',
  'login.usageLater': 'Usage shows again after you use Claude with this profile.',
  'login.usage': 'Usage: cpf login <name>',
  'mcpLogin.browser': 'A browser opens for each one. Just allow it.',
  'mcpLogin.done': 'Signed in to {server}',
  'mcpLogin.failed': 'Could not sign in to {server}',
  'mcpLogin.next': 'It connects the next time you open Claude with this profile.',
  'mcpLogin.none': 'Nothing was signed in.',
  'index.helpLogin': 'Runs claude auth login for that profile only. Other profiles stay signed in.',
  'manage.invalid': 'Invalid arguments. Run cpf --help for usage.',
  'manage.help': `Usage:
  cpf                         Open the profile list
  cpf <name>                  Switch to a profile
  cpf --list                  List profiles and the active one
  cpf add <name>              Create a profile
  cpf rename <old> <new>      Rename a profile, keeping its data
  cpf remove <name>           Delete a profile after confirmation
  cpf login <name>            Sign a profile in to another Claude account
  cpf share                   Show what every profile shares
  cpf share add <entry>       Share CLAUDE.md, skills, agents, … across profiles
  cpf share remove <entry>    Stop sharing; each profile keeps a copy
  cpf language [auto|en|ko]   Choose the screen language
  cpf --help                  Show this help

Run these at the terminal prompt, not inside the Claude chat. Use /exit to leave the chat.
Run claude to choose a profile and start Claude Code.
Before renaming, close sessions using that profile; macOS may ask you to sign in again.
Without the shell commands, use: npx ai-profile-switch@latest manage [arguments]`,

  'language.title': 'Screen language',
  'language.auto': 'Automatic',
  'language.autoHint': 'follows the system (now: {name})',
  'language.saved': 'Language set to {name}.',
  'language.savedAuto': 'Language follows the system ({name}).',
  'language.current': 'Language: {name}',
  'language.sourceSaved': 'chosen with cpf language',
  'language.sourceAuto': 'automatic',
  'language.usage': 'Usage: cpf language [auto | en | ko]',

  'mcp.noWrites': 'MCP writes are no longer supported here. Use claude mcp add/remove and /mcp.',
  'mcp.preserved': 'Old MCP data is kept. Add servers with claude mcp in the profile you use.',
  'mcp.noServers': '(no servers)',
  'mcp.disabled': 'Turned off before: {list}',
  'mcp.where': 'User servers go in the profile .claude.json; project servers go in .mcp.json.',
  'mcp.see': 'See https://code.claude.com/docs/en/mcp',

  'index.unknown': 'Unknown command: {command}',
  'index.usage': 'Usage: npx ai-profile-switch@latest {usage}',
  'index.helpRename': 'Close running sessions for this profile first. Its history and settings are kept; macOS may ask you to sign in again.',
  'index.helpRemove': 'Deletes a profile after confirmation. This cannot be undone.',
  'index.helpAdd': 'Creates a profile. Run claude, choose it, and sign in to the account you want.',
  'index.helpUse': 'Changes the active profile for future launches; running sessions keep their profile.',
  'index.help': `
  {title} — Use several Claude Code accounts on one computer

  Everyday commands (in your terminal, after setup):
    claude                     Pick a profile and start Claude Code
    cpf                        Open the profile list
    cpf work                   Switch to an existing profile
    cpf --help                 Show the short commands

  Usage: npx ai-profile-switch@latest <command> [options]

  Commands:
    init                       First setup; shows the current setup if already done
    add <name>                 Create a profile
    remove <name>              Remove a profile after confirmation
    rename <old> <new>         Rename a profile, keeping its data
    login <name>               Sign a profile in to another Claude account
    list                       List profiles
    use <name>                 Change the active profile
    manage                     Open the same profile list as cpf
    language [auto|en|ko]      Choose the screen language
    install-shell              Install or repair the claude and cpf commands
    migrate [name]             Copy existing Claude settings (--from <path>)
    update [--check]           Update this tool; --check only checks
    share [add|remove]         Share CLAUDE.md, skills, agents, … across profiles
    mcp [list]                 Show where old MCP settings went

  Run any command with --help for its usage.
`,
};
