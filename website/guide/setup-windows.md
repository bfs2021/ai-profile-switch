---
title: Windows — ai-profile-switch
description: What to know when installing in Windows PowerShell, including profile files, execution policy, and links.
---

# Windows

Run it in PowerShell.

```powershell
npx ai-profile-switch@latest init
```

When it's done, open a new PowerShell window and type `claude`.

- The line goes into both the PowerShell 5.1 and the PowerShell 7 profile files. A Documents folder moved to OneDrive is found too, and the existing file keeps its content and encoding.
- If the profile file doesn't load because of the execution policy, check the policy on your PC or at your company. `$PROFILE` shows which file it is.
- Shared folders are connected with junctions. File links can't be created while Developer Mode is off, so those files are copied and you're told. A copied file doesn't follow changes made to the other copy.
- To use the tool in WSL, follow [Linux · WSL](/guide/setup-linux) and install it inside WSL.
- If `claude` or `cpf` isn't found, run `npx ai-profile-switch@latest install-shell` and open a new window.

Next: [Shell integration](/guide/shell-integration) · [Managing profiles](/guide/commands)
