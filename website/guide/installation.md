---
title: Installation — ai-profile-switch
description: Installing with init, and reconnecting the shell commands when they stop working.
---

# Installation

You need Node.js 18.19 or later on 18.x, or 20.10 or later, and npm. Claude Code stays as it is. If you don't have it yet, follow the [official setup guide](https://code.claude.com/docs/en/setup) first.

```bash
npx ai-profile-switch@latest init
```

`init` creates the profile folders, copies the program to `~/.claude-profiles/_runtime`, and adds one line to your shell's config file. [Getting started](/guide/) lists what it asks.

If it's already set up, running `init` again changes nothing. It only shows your profiles and the default one.

## When the shell commands don't work

If a new terminal says `claude` or `cpf` isn't found, reconnect the shell. Do the same after you install a new shell.

```bash
npx ai-profile-switch@latest install-shell
```

Then open a new terminal.

## Global install

You can install it globally instead of using npx.

```bash
npm install -g ai-profile-switch@latest
ai-profile-switch install-shell
```

After updating the global package, run `ai-profile-switch install-shell` once more. The shell commands run the copy in `_runtime`, not the global package.

## Check

```bash
npx ai-profile-switch@latest list
```

If it shows your profiles and the default one, you're set. `claude` and `cpf` still need Node.js to run.

For what differs by system, see [macOS](/guide/setup-macos), [Linux · WSL](/guide/setup-linux), and [Windows](/guide/setup-windows).
