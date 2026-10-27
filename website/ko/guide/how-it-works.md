---
title: 작동 방식 — ai-profile-switch
description: 프로필 폴더 구조, 같이 쓰는 범위, 로그인과 사용량을 어디서 읽는지.
---

# 작동 방식

`claude` 를 치면 셸 함수가 프로필을 고르게 하고, 고른 프로필 폴더를 `CLAUDE_CONFIG_DIR` 로 넘겨 Claude Code 를 실행해요. Claude Code 가 원래 지원하는 [설정 폴더 나누기](https://code.claude.com/docs/en/iam#log-in-with-multiple-accounts)를 그대로 쓰는 거라, Claude Code 자체는 아무것도 바꾸지 않아요.

```text
~/.claude-profiles/
├── meta.json                 프로필 목록, 기본 프로필, 같이 쓰는 것
├── _runtime/                 셸 명령이 실행하는 이 도구
├── _shared/                  같이 쓰는 파일
│   ├── settings.json
│   ├── commands/
│   └── CLAUDE.md             같이 쓰기를 켰을 때
└── work/                     프로필 하나
    ├── .claude.json          계정, MCP 서버, 프로젝트 신뢰
    ├── .credentials.json     파일로 로그인하는 환경에서만
    ├── settings.json         → _shared/settings.json
    ├── commands/             → _shared/commands/
    ├── CLAUDE.md
    ├── skills/
    ├── plugins/
    ├── projects/
    └── …
```

## 같이 쓰는 범위

처음에는 `settings.json` 과 `commands` 만 같이 써요. `CLAUDE.md`, 스킬, 에이전트, 규칙, 훅, 단축키, 출력 스타일, 워크플로, 테마는 [같이 쓰기](/ko/guide/commands#sharing)에서 켠 것만 나눠요.

로그인, `.claude.json`(MCP 서버와 프로젝트 신뢰), 기록, `projects`, 플러그인은 늘 프로필마다 따로예요.

macOS 와 Linux 는 심볼릭 링크를, Windows 는 폴더에 junction 을 써요. Windows 에서 파일 링크를 만들 권한이 없으면 파일을 복사하고 알려 줘요. 그때는 한쪽을 고쳐도 다른 쪽이 따라 바뀌지 않아요. 계속 맞추려면 Windows 개발자 모드를 켜요.

## 로그인

`.claude.json` 은 계정 정보와 상태를 담은 파일이지 로그인 자체는 아니에요. macOS 는 로그인을 키체인에 두고, 다른 OS 는 `.credentials.json` 에 둬요. 로그인했는지는 실행할 때 Claude Code 가 판단해요.

`ANTHROPIC_API_KEY` 같은 인증 환경 변수가 셸에 있으면 어느 프로필이든 그 값이 쓰여요. API 키 없이 쓰는 Claude Console 로그인은 설정 폴더만으로는 나뉘지 않아요.

## 사용량 {#usage}

목록의 사용량은 두 곳에서 와요.

1. Claude Code 가 `.claude.json` 에 저장해 둔 값. 바로 읽을 수 있지만 그 프로필을 마지막으로 쓴 때의 값이에요. 이미 초기화 시각이 지난 값은 보여 주지 않아요.
2. 지금 값. Claude Code 가 저장한 그 프로필의 로그인(macOS 는 키체인)으로 Anthropic 에 사용량을 물어봐요. 1.5초 안에 답이 없으면 저장된 값을 그대로 둬요.

지금 값은 문서에 없는 경로라 언제든 바뀔 수 있어요. 만료된 로그인은 갱신하지 않고 건너뛰어요. 갱신하면 Claude Code 가 들고 있는 로그인이 바뀌기 때문이에요. 이 요청을 끄려면 `CPF_LIVE_USAGE=0` 을 설정해요.

## MCP 로그인 표시

Claude Code 는 로그인이 필요한 MCP 서버를 `.claude.json` 의 목록에 적어 두고, 대화형 세션에서 그 서버에 연결되면 지워요. 노란 `!` 는 이 목록을 읽은 거예요.

cpf 에서 로그인하면 Claude Code 가 아직 목록을 지우지 않았으니, cpf 가 로그인한 시각을 `meta.json` 에 적어 둬요. 그 뒤로 Claude Code 가 `.claude.json` 을 다시 쓰면 그때부터는 Claude Code 의 목록을 그대로 따라요.

## 지키는 것

- 원래 쓰던 `~/.claude` 는 가져올 때 읽기만 해요.
- 가져오기는 내용이 다른 파일이 하나라도 있으면 시작하지 않아요. 깨진 JSON 도 빈 설정으로 덮어쓰지 않아요.
- 같이 쓰기는 내용이 다른 프로필 파일을 덮어쓰지 않아요.
- 셸 설정 파일은 `init`, `install-shell`, `shell refresh` 때만 고쳐요.
