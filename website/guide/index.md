---
title: Getting started — ai-profile-switch
description: Install, create profiles, and start Claude Code with the one you pick.
---

# Getting started

You need Node.js 18.19 or later on 18.x, or 20.10 or later, and Claude Code. If you don't have Claude Code yet, follow the [official setup guide](https://code.claude.com/docs/en/setup) first.

## Install

```bash
npx ai-profile-switch@latest init
```

It asks a few things in order.

1. The profiles to create. Separate the names with commas, like `work, personal`.
2. Which profile to start with. Only asked when you enter more than one name.
3. Whether all profiles share `settings.json` and `commands`.
4. Which profile gets a copy of your current Claude settings (`~/.claude`). You can skip this.

When it's done, open a new terminal. You now have the `claude` and `cpf` commands.

## Pick a profile and start

![The claude profile list](/screens/en/launch.svg)

Run `claude` and this list appears. Move with ↑↓ and press Enter, or press the number. Esc cancels.

- The green `●` marks the default profile. It's the one you picked last, and the cursor starts there next time.
- The bars are 5-hour and weekly usage. The list shows saved values first and switches to current values about a second later. A profile whose current values couldn't be fetched stays dim.
- A yellow `!` means an MCP server in that profile is waiting for a sign-in. Press → to open the profile screen and sign in from there.

The first time you use a profile, Claude asks you to sign in. Sign in with the account you want for that profile and you're done.

## Add another account

```bash
cpf add work2
claude
```

Pick `work2` in the list and sign in with the new account when Claude asks. "Add a profile" in `cpf` does the same thing.

## Common questions

**What happens to my existing `~/.claude`?**
It stays where it is. If you chose to import it during `init`, a copy goes into the profile. To import it later, see [Managing profiles](/guide/commands#bring-in-your-existing-settings).

**Is my sign-in copied too?**
Not on macOS, where the sign-in lives in the Keychain. Sign in once the first time you start that profile. On other systems, a sign-in stored in a file is copied only into the profile you imported into.

**I typed `cpf` in a Claude chat and nothing happened.**
`cpf` and `claude` are terminal commands. Leave the chat with `/exit` and type them in the terminal.

**Can I clear the npx cache?**
Yes. Setup copies the program to `~/.claude-profiles/_runtime`.

Next: [Managing profiles](/guide/commands) · [Shell integration](/guide/shell-integration)
