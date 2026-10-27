---
title: Managing profiles — ai-profile-switch
description: Adding profiles, MCP sign-in, bringing over plugins and servers, and sharing in the cpf screen, plus the command list.
---

# Managing profiles

Run `cpf` to open the profile list. It's the same list as `claude`, but Enter opens the profile screen instead of starting Claude.

![The cpf home screen](/screens/en/home.svg)

- Under the list are "Add a profile" and "Settings". Settings holds sharing and the screen language.
- The line under the list is about the highlighted profile, such as a server that needs a sign-in or how old the usage numbers are.
- Esc quits.

`cpf` and `claude` are terminal commands. If you're in a Claude chat, leave it with `/exit` first.

## The profile screen

![The profile screen](/screens/en/detail.svg)

The two lines at the top are usage and connections. Usage also shows when each limit resets. In the connections line, `✓` is an MCP server with no sign-in problem and a yellow `!` is one that needs a sign-in.

| Item | What it does |
| --- | --- |
| Use this profile | Makes it the default. The next `claude` starts with the cursor here. Hidden when it's already the default. |
| Sign in to notion | Runs `claude mcp login` for each server that needs a sign-in. Only shown when needed. |
| Bring over from another profile | Adds plugins and MCP servers that only another profile has. The hint says what differs. |
| Rename | Sign-in, history, and settings stay. Close Claude windows using that profile first. |
| Change Claude account | Signs only this profile in to another account with `claude auth login`. Other profiles stay as they are. |
| Delete | Asks once more, then deletes. Sign-in and history go with it and can't be restored. |

Esc or ← goes back to the list, with the cursor still on the profile you were looking at.

### MCP sign-in

MCP servers that need a sign-in, like Figma or Notion, are signed in separately for each profile. Choose "Sign in to …" and a browser opens for each server in turn. Just allow it.

Sign-ins aren't copied from other profiles, on purpose. A sign-in changes every time it refreshes, so a copy would soon log one side out.

Claude Code clears its "needs sign-in" mark only after it actually connects to the server. So when you sign in here, cpf remembers it and hides the `!` until you open Claude with that profile again.

### Bring over from another profile

![Bringing over plugins and MCP servers](/screens/en/import.svg)

When more than one profile has something this one lacks, you first choose which profile to bring over from. Then pick items with Space and press Enter.

Installing goes through Claude Code's own commands (`claude plugin install`, `claude mcp add-json -s user`), so it's recorded the same as if you had installed it yourself.

- Plugins that are turned off in the other profile aren't listed.
- claude.ai connectors such as Gmail or Drive belong to the account, so they can't be brought over. Turn them on at claude.ai for each account.
- MCP servers added for a single project aren't brought over.

## Sharing

![Sharing](/screens/en/share.svg)

In Settings → Sharing, turn items on or off with Space, then press Enter. What you turn on is kept once in `~/.claude-profiles/_shared`, and every profile uses it through a link.

- `settings.json` and `commands` are always shared. If you chose not to share them during setup, these items can't be turned on either.
- Turning an item off leaves a copy in each profile. Nothing is deleted.
- If a profile already has a different file there, it isn't overwritten. You're told about it instead.
- MCP servers, sign-ins, history, and plugins belong to each account and can't be shared.

## From the command line

Everything also works as a command, without opening the screen. Use these in scripts.

| Command | What it does |
| --- | --- |
| `cpf` | Open the profile list |
| `cpf work` | Make `work` the default profile. Doesn't start Claude |
| `cpf --list` | List profiles and the default |
| `cpf add work2` | Create a profile |
| `cpf rename wrok2 work2` | Rename |
| `cpf remove work2` | Delete after confirming |
| `cpf login work2` | Sign only `work2` in to another Claude account |
| `cpf share` | What's shared, and whether each profile matches |
| `cpf share add skills` | Share skills. `remove` stops sharing |
| `cpf language en` | Screen language. `ko` for Korean, `auto` follows the system |

A single argument is always read as a profile name. So `cpf add` switches to a profile named `add`, and the list is `cpf --list`.

Without the shell commands, put the command after `npx ai-profile-switch@latest`. For example, `npx ai-profile-switch@latest manage rename wrok2 work2` does the same as `cpf rename wrok2 work2`. Add `--help` to any command to see its usage without changing anything.

Profile names use lowercase letters, digits, and `-`, up to 30 characters. They start and end with a letter or digit, and `_shared` and `default` are taken.

## Bring in your existing settings

If you skipped it during `init`, or want to do it later, close every Claude window using the original settings or the target profile, then run:

```bash
npx ai-profile-switch@latest migrate work --from ~/.claude
```

- `~/.claude` and `~/.claude.json` come over together. If you were using your own `CLAUDE_CONFIG_DIR`, pass that folder to `--from`. The originals aren't touched.
- Settings, commands, projects, plugins, skills, agents, rules, hooks, `CLAUDE.md`, key bindings, output styles, and the like are copied. Caches and temporary records Claude creates are left behind.
- If the profile already has different data, nothing is copied and you're told where they overlap. If anything gets overwritten, the original data stays at the backup path shown at the end.
- A sign-in in the macOS Keychain doesn't move. Sign in once more the first time.

## Updates

The shell commands check for a new version in the background once a day and use it from the next run. Sessions that are already open stay as they are.

```bash
npx ai-profile-switch@latest update           # update now
npx ai-profile-switch@latest update --check   # check only: 0 up to date, 1 newer version, 2 check failed
npx ai-profile-switch@latest install-shell    # repair the shell commands
```

- To turn off automatic updates, set `CLAUDE_SWITCH_DISABLE_AUTO_UPDATE=1`.
- Updates don't touch sign-ins, history, or shell config files. If a download fails, the current version keeps working.
- Update Claude Code itself with `claude update`. This tool doesn't update Claude Code.
- Coming from 1.x or `claude-account-switch`, run `install-shell` once and open a new terminal.

## Old MCP settings

Since version 2, cpf doesn't edit MCP servers. Add servers with `claude mcp add`, and sign in from the profile screen above. `npx ai-profile-switch@latest mcp list` only shows the server names and file locations saved by older versions. It never prints addresses, tokens, or environment values. See the [official MCP guide](https://code.claude.com/docs/en/mcp) for more.
