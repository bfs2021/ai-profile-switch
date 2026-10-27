---
title: macOS — ai-profile-switch
description: What to know when installing on macOS, including Keychain sign-in and shell config files.
---

# macOS

```bash
npx ai-profile-switch@latest init
```

When it's done, open a new terminal and type `claude`. zsh, bash, and fish work, and the files it edits are `~/.zshrc`, `~/.bashrc`, and `~/.config/fish/config.fish`.

- On macOS the sign-in is kept in the Keychain, so importing your existing settings doesn't bring it along. Sign in once the first time you start that profile.
- Current usage in the list is also fetched with that profile's sign-in from the Keychain. See [How it works](/guide/how-it-works#usage).
- If `claude` or `cpf` isn't found, run `npx ai-profile-switch@latest install-shell` and open a new terminal.
- If it can't find the Claude program, check that both are on your PATH with `which claude` and `which node`.

Next: [Shell integration](/guide/shell-integration) · [Managing profiles](/guide/commands)
