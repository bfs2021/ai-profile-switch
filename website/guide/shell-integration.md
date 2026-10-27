---
title: Shell integration — ai-profile-switch
description: What the claude, cpf, and claude-pick shell commands do, and pre-launch hooks.
---

# Shell integration

Setup adds three commands to your shell. They're terminal commands, so typing them in a Claude chat just sends them as a message. Leave the chat with `/exit` first.

| Command | What it does |
| --- | --- |
| `claude [args]` | Pick a profile and start Claude Code with it. Arguments are passed through. |
| `cpf` | Open the profile list to manage profiles. See [Managing profiles](/guide/commands). |
| `claude-pick` | Change the default profile only. Doesn't start Claude. |

## When you run claude

With two or more profiles, a list appears.

![The claude profile list](/screens/en/launch.svg)

| Key | What it does |
| --- | --- |
| ↑ ↓, numbers | Move; a number picks directly |
| Enter | Start with this profile |
| → | Open the profile screen. Esc closes it and returns to the list |
| Esc, Ctrl+C | Cancel, with exit code 130 |

- With only one profile, or when input comes from a pipe, it starts with the default profile without asking.
- The list and messages are drawn on stderr. Claude's output and exit code pass through unchanged.
- `CLAUDE_CONFIG_DIR` is set only for the Claude it starts, not in your shell.
- Claude sessions that are already open don't change when you pick another profile.

## Pre-launch hooks

If a profile folder has a hook file, it runs right before Claude starts. Only the file for your current shell runs.

| Shell | File |
| --- | --- |
| bash, zsh | `~/.claude-profiles/<profile>/pre-launch.sh` |
| fish | `~/.claude-profiles/<profile>/pre-launch.fish` |
| PowerShell | `~/.claude-profiles/<profile>/pre-launch.ps1` |

Use it when a profile needs its own environment variables. For example, to use a proxy only with your work profile:

```bash
# ~/.claude-profiles/work/pre-launch.sh
HTTPS_PROXY=http://proxy.example.com:8080
```

Values set in the hook go only to that Claude. If the hook fails, Claude doesn't start.

If you override `__claude_switch_launch` yourself in bash or zsh, it keeps working. Put it below the line in your shell config that loads this tool.

## Shell config files

`init` and `install-shell` look at your current shell and the config files you already have, then add one line to these files. If the line is already there, it isn't added again.

| Shell | File |
| --- | --- |
| zsh | `$ZDOTDIR/.zshrc`, or `~/.zshrc` |
| bash | `~/.bashrc` |
| fish | `$XDG_CONFIG_HOME/fish/config.fish`, or `~/.config/fish/config.fish` |
| PowerShell | `Documents/PowerShell/Microsoft.PowerShell_profile.ps1` and the older Windows PowerShell profile |

The shell commands run the copy in `~/.claude-profiles/_runtime`. If that copy or Node.js is missing, they print the command that fixes it and stop.

```bash
npx ai-profile-switch@latest install-shell
```

To try changes from a clone of this repository, run `node bin/cli.mjs install-shell` in the repository folder. `@latest` installs the version published on npm.
