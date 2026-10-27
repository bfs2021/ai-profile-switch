---
title: 설치 — ai-profile-switch
description: init 으로 설치하는 방법과 셸 명령이 안 될 때 다시 연결하는 방법.
---

# 설치

Node.js 18.19 이상(18 계열) 또는 20.10 이상과 npm 이 필요해요. Claude Code 는 쓰던 것을 그대로 써요. 아직 없다면 [공식 설치 안내](https://code.claude.com/docs/en/setup)를 먼저 따라 하세요.

```bash
npx ai-profile-switch@latest init
```

`init` 은 프로필 폴더를 만들고, 실행 파일을 `~/.claude-profiles/_runtime` 에 복사하고, 쓰고 있는 셸의 설정 파일에 한 줄을 붙여요. 무엇을 묻는지는 [시작하기](/ko/guide/)에 있어요.

이미 설치했다면 `init` 을 다시 실행해도 아무것도 바꾸지 않아요. 지금 프로필과 기본 프로필만 보여 줘요.

## 셸 명령이 안 될 때

새 터미널에서 `claude` 나 `cpf` 가 없다고 나오면 셸 연결을 다시 해요. 셸을 새로 깔았을 때도 같아요.

```bash
npx ai-profile-switch@latest install-shell
```

끝나면 새 터미널을 열어요.

## 전역 설치

npx 대신 전역으로 설치해서 써도 돼요.

```bash
npm install -g ai-profile-switch@latest
ai-profile-switch install-shell
```

전역 패키지를 업데이트한 뒤에도 `ai-profile-switch install-shell` 을 한 번 실행해요. 셸 명령은 `_runtime` 에 복사해 둔 파일을 쓰기 때문이에요.

## 확인

```bash
npx ai-profile-switch@latest list
```

만든 프로필과 기본 프로필이 나오면 된 거예요. `claude` 와 `cpf` 를 쓸 때도 Node.js 는 계속 있어야 해요.

OS 마다 다른 점은 [macOS](/ko/guide/setup-macos), [Linux · WSL](/ko/guide/setup-linux), [Windows](/ko/guide/setup-windows) 에 있어요.
