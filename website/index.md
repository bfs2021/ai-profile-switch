---
layout: home
title: ai-profile-switch — several Claude Code accounts on one computer
description: Keep a work account and a personal account on one computer, and pick one each time you run claude.
jsonLd:
  "@context": "https://schema.org"
  "@type": "SoftwareApplication"
  name: "ai-profile-switch"
  applicationCategory: "DeveloperApplication"
  operatingSystem: "macOS, Linux, Windows"
  offers:
    "@type": "Offer"
    price: "0"
    priceCurrency: "USD"
  description: "Keeps several Claude Code accounts on one computer as separate profiles."
  url: "https://ftery0.github.io/ai-profile-switch/"
  downloadUrl: "https://www.npmjs.com/package/ai-profile-switch"
  author:
    "@type": "Person"
    name: "haejun"
  license: "https://opensource.org/licenses/MIT"

hero:
  name: ai-profile-switch
  text: Several Claude Code accounts on one computer
  tagline: Run claude and pick the account to start with. Sign-in, history, and settings stay separate for each profile.
  actions:
    - theme: brand
      text: Get started
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/ftery0/ai-profile-switch
---

![The profile list that opens when you run claude, with each profile's email and its 5-hour and weekly usage](/screens/en/launch.svg)

Claude Code keeps accounts apart if you give each one its own folder with `CLAUDE_CONFIG_DIR`. Typing that every time gets old, so this tool does it for you.

- Run `claude` and you get the list above. Check the email and the 5-hour and weekly usage, pick one, and Claude Code starts with that account.
- `cpf` opens the same list for managing profiles. Add one, rename it, sign in again, or bring over plugins and MCP servers from another profile.
- Each profile is one folder under `~/.claude-profiles`. You choose what they share, such as `CLAUDE.md` or skills.

```bash
npx ai-profile-switch@latest init
```

You need Node.js 18.19 or later (or 20.10 or later) and Claude Code. It works on macOS, Linux, and Windows.
