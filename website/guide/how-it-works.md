---
title: How it works — ai-profile-switch
description: The profile folder layout, what's shared, and where sign-ins and usage come from.
---

# How it works

When you type `claude`, a shell function asks which profile to use, then starts Claude Code with that profile's folder as `CLAUDE_CONFIG_DIR`. That's Claude Code's own support for [separate config folders](https://code.claude.com/docs/en/iam#log-in-with-multiple-accounts), so nothing in Claude Code is changed.

```text
~/.claude-profiles/
├── meta.json                 profile list, default profile, what's shared
├── _runtime/                 this tool, run by the shell commands
├── _shared/                  shared files
│   ├── settings.json
│   ├── commands/
│   └── CLAUDE.md             when you share it
└── work/                     one profile
    ├── .claude.json          account, MCP servers, project trust
    ├── .credentials.json     only where sign-in is kept in a file
    ├── settings.json         → _shared/settings.json
    ├── commands/             → _shared/commands/
    ├── CLAUDE.md
    ├── skills/
    ├── plugins/
    ├── projects/
    └── …
```

## What's shared

At first only `settings.json` and `commands` are shared. `CLAUDE.md`, skills, agents, rules, hooks, key bindings, output styles, workflows, and themes are shared only when you turn them on in [Sharing](/guide/commands#sharing).

Sign-in, `.claude.json` (MCP servers and project trust), history, `projects`, and plugins always stay with each profile.

macOS and Linux use symbolic links. Windows uses junctions for folders. If Windows doesn't allow a file link, the file is copied and you're told. Then editing one copy doesn't change the other. To keep them in sync, turn on Windows Developer Mode.

## Sign-in

`.claude.json` holds account details and state, not the sign-in itself. macOS keeps the sign-in in the Keychain, and other systems keep it in `.credentials.json`. Claude Code decides whether you're signed in when it starts.

If your shell has an auth variable such as `ANTHROPIC_API_KEY`, every profile uses it. A Claude Console sign-in without an API key isn't separated by config folders alone.

## Usage

The usage in the list comes from two places.

1. The values Claude Code saved in `.claude.json`. They're there right away, but they're from the last time you used that profile. Values whose reset time has passed aren't shown.
2. Current values. The tool asks Anthropic for usage with the sign-in Claude Code stored for that profile (in the Keychain on macOS). If there's no answer within 1.5 seconds, the saved values stay.

Current values come from an undocumented endpoint, so this could stop working at any time. An expired sign-in is skipped rather than refreshed, because refreshing would change the sign-in Claude Code is holding. To turn these requests off, set `CPF_LIVE_USAGE=0`.

## MCP sign-in marks

Claude Code lists MCP servers that need a sign-in in `.claude.json`, and removes a server once an interactive session connects to it. The yellow `!` comes from that list.

When you sign in through cpf, Claude Code hasn't cleared the list yet, so cpf writes the time you signed in to `meta.json`. Once Claude Code writes `.claude.json` again, its own list takes over.

## What it won't do

- Your original `~/.claude` is only read, when importing.
- Importing doesn't start if any file differs. Broken JSON isn't replaced with empty settings either.
- Sharing doesn't overwrite a profile file whose content differs.
- Shell config files are changed only by `init`, `install-shell`, and `shell refresh`.
