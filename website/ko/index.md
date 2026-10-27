---
layout: home
title: ai-profile-switch — 한 컴퓨터에서 Claude Code 계정 여러 개 쓰기
description: 회사 계정과 개인 계정을 한 컴퓨터에 두고, claude 를 실행할 때마다 골라서 시작해요.
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
  description: "한 컴퓨터에서 Claude Code 계정 여러 개를 프로필로 나눠 쓰는 도구."
  url: "https://ftery0.github.io/ai-profile-switch/ko/"
  downloadUrl: "https://www.npmjs.com/package/ai-profile-switch"
  author:
    "@type": "Person"
    name: "haejun"
  license: "https://opensource.org/licenses/MIT"

hero:
  name: ai-profile-switch
  text: Claude Code 계정 여러 개를 한 컴퓨터에서
  tagline: claude 를 치면 어느 계정으로 시작할지 물어봐요. 로그인, 기록, 설정은 프로필마다 따로예요.
  actions:
    - theme: brand
      text: 시작하기
      link: /ko/guide/
    - theme: alt
      text: GitHub
      link: https://github.com/ftery0/ai-profile-switch
---

![claude 를 실행하면 나오는 프로필 목록. 프로필마다 이메일과 5시간·주간 사용량이 보여요](/screens/ko/launch.svg)

Claude Code 는 `CLAUDE_CONFIG_DIR` 로 설정 폴더를 따로 주면 계정을 나눠 쓸 수 있어요. 그런데 매번 그걸 붙여 치기는 번거로워서, 이 도구가 대신해 줘요.

- `claude` 를 치면 위 목록이 나와요. 계정 이메일과 5시간·주간 사용량을 보고 고르면 그 계정으로 Claude Code 가 시작돼요.
- `cpf` 는 같은 목록에서 프로필을 관리해요. 추가하기, 이름 바꾸기, 다시 로그인하기, 다른 프로필의 플러그인과 MCP 서버 가져오기를 여기서 해요.
- 프로필은 `~/.claude-profiles` 아래 폴더 하나예요. `CLAUDE.md` 나 스킬처럼 같이 쓸 것만 골라서 나눠요.

```bash
npx ai-profile-switch@latest init
```

Node.js 18.19 이상(또는 20.10 이상)과 Claude Code 가 필요해요. macOS, Linux, Windows 에서 돼요.
