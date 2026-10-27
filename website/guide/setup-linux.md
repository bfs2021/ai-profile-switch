---
title: Linux · WSL — ai-profile-switch
description: What to know when installing on Linux and WSL.
---

# Linux · WSL

```bash
npx ai-profile-switch@latest init
```

When it's done, open a new terminal and type `claude`. The files it edits are `~/.bashrc`, `~/.zshrc`, and `~/.config/fish/config.fish`.

- The sign-in is kept in `.credentials.json` in the profile folder. When you import your existing settings, it's copied only into the profile you import into.
- WSL has its own home folder, separate from Windows. To use the tool in WSL, install it inside a WSL terminal. Installing on the Windows side doesn't set up WSL.
- If `claude` or `cpf` isn't found, run `npx ai-profile-switch@latest install-shell` and open a new terminal.
- If it can't find the Claude program, check that both are on your PATH with `which claude` and `which node`.

Next: [Shell integration](/guide/shell-integration) · [Managing profiles](/guide/commands)
