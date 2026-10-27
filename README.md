# ai-profile-switch

[![npm version](https://img.shields.io/npm/v/ai-profile-switch)](https://www.npmjs.com/package/ai-profile-switch)
[![license](https://img.shields.io/github/license/ftery0/ai-profile-switch)](./LICENSE)

Keep several Claude Code accounts on one machine, such as work and personal, and pick one each time you run `claude`. Each profile has its own sign-in, history, and settings. You share only what you choose. No runtime dependencies.

[한국어](./README.ko.md) · [Full guide](https://ftery0.github.io/ai-profile-switch/guide/)

![The profile list that opens when you run claude, with each profile's email and its 5-hour and weekly usage](https://raw.githubusercontent.com/ftery0/ai-profile-switch/main/website/public/screens/en/launch.svg)

Formerly `claude-account-switch`. See [existing users](#existing-users).

## Install

You need Node.js 18.19+ or 20.10+ and [Claude Code](https://code.claude.com/docs/en/setup).

```bash
npx ai-profile-switch@latest init
```

Type profile names such as `work, personal`, then open a new terminal.

## Everyday use

Run these at the terminal prompt. If you are in the Claude chat, enter `/exit` first.

| Command | What it does |
| --- | --- |
| `claude` | Pick an account and start Claude Code with it |
| `cpf` | The profile list. Pick a profile to see its usage and MCP connections, sign in, bring things over, rename, or delete |
| `cpf work` | Make `work` the default profile without starting Claude |
| `cpf --list` | Show profiles and the default one |
| `cpf add work2` | Create a profile. Then run `claude`, pick it, and sign in |
| `cpf rename wrok2 work2` | Rename a profile. Close its Claude sessions first |
| `cpf remove work2` | Delete a profile after confirmation |
| `cpf login work2` | Sign `work2` in to another Claude account. Other profiles keep theirs |
| `cpf language ko` | Show screens in Korean. `en` for English, `auto` to follow the system |

- The `claude` list shows each profile's email and its 5-hour and weekly usage. Saved values come first and are replaced with current values about a second later. Press a number to pick at once, → to open the profile screen, or Esc to cancel.
- A yellow `!` means an MCP server in that profile is waiting for a sign-in. Press → to open the profile screen and sign in there.
- Screens appear in Korean or English, following your terminal language (`LANG`) or system language.
- Switching applies to the next launch. Running sessions keep their account.
- In scripts, `claude` uses the active profile without asking.
- At a Bash or zsh prompt, `command claude` runs the original Claude without a profile.

## Share settings across profiles

Only `settings.json` and `commands` are shared at first.

```bash
cpf share                 # What is shared, and whether each profile is in sync
cpf share add CLAUDE.md   # Use one CLAUDE.md in every profile
cpf share add skills      # Share personal skills
cpf share remove skills   # Stop sharing. Each profile keeps a copy
```

- Shareable: `CLAUDE.md` `keybindings.json` `skills` `agents` `rules` `hooks` `output-styles` `workflows` `themes`
- Always per profile: sign-in, `.claude.json` (MCP servers, project trust), history, `projects`, plugins
- A profile file with different content is never overwritten. You get a warning instead.
- You can also turn items on and off with Space in `cpf` → Settings → Sharing.

## MCP sign-in and bringing things over

Pick a profile in `cpf` to open its screen, which shows its usage and MCP connections.

- When a server such as Figma or Notion needs a sign-in, an item like `Sign in to notion` appears. It runs `claude mcp login` for each server in turn, so you only need to allow it in the browser.
- `Bring over from another profile` lets you pick plugins and MCP servers that only another profile has, and installs them with `claude plugin install` and `claude mcp add-json`.
- claude.ai connectors such as Gmail or Drive belong to the account, so they can't be brought over. Turn them on at claude.ai for each account.

## Bring in your existing account

On first setup, `init` can copy your current `~/.claude` into a profile. To do it later, close your Claude sessions and run:

```bash
npx ai-profile-switch@latest migrate work --from ~/.claude
```

The original folder stays as it is. macOS Keychain sign-ins are not copied, so Claude may ask you to sign in once.

## Updates

The shell checks for updates once a day and uses the new version from the next launch. Running sessions are not affected.

```bash
npx ai-profile-switch@latest update          # Update now. Add --check to only check
npx ai-profile-switch@latest install-shell   # Repair or refresh the shell commands
```

Set `CLAUDE_SWITCH_DISABLE_AUTO_UPDATE=1` to turn automatic updates off.

## Existing users

Coming from `claude-account-switch` or 1.x? Run `npx ai-profile-switch@latest install-shell` once, then open a new terminal. Your profiles and sign-ins stay, and `claude-account-switch` remains an alias.

## More

- [Managing profiles and the full command list](https://ftery0.github.io/ai-profile-switch/guide/commands)
- Platform guides: [macOS](docs/setup-macos.md) · [Linux](docs/setup-linux.md) · [Windows](docs/setup-windows.md)
- To use this source checkout, run `node bin/cli.mjs install-shell` from the repository root.

[MIT](./LICENSE)
