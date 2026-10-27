---
title: 프로필 관리 — ai-profile-switch
description: cpf 화면에서 프로필을 추가하고, MCP 로그인과 가져오기, 같이 쓰기를 하는 방법과 명령 목록.
---

# 프로필 관리

`cpf` 를 치면 프로필 목록이 열려요. `claude` 와 같은 목록인데, Enter 를 누르면 Claude 를 켜는 대신 그 프로필 화면으로 가요.

![cpf 첫 화면](/screens/ko/home.svg)

- 목록 아래에 "프로필 추가" 와 "설정" 이 있어요. 설정에는 같이 쓰기와 화면 언어가 들어 있어요.
- 커서를 올린 프로필에 대해 한 줄이 아래에 나와요. 로그인이 필요한 서버가 있다거나, 사용량이 언제 값인지 같은 것들이에요.
- Esc 를 누르면 나가요.

`cpf` 와 `claude` 는 터미널에서 치는 명령이에요. Claude 채팅 안이라면 먼저 `/exit` 로 나와요.

## 프로필 화면

![프로필 화면](/screens/ko/detail.svg)

위의 두 줄은 사용량과 연결이에요. 사용량은 언제 초기화되는지까지 보여 줘요. 연결 줄의 `✓` 는 로그인 문제가 없는 MCP 서버, 노란 `!` 는 로그인이 필요한 서버예요.

| 항목 | 하는 일 |
| --- | --- |
| 이 프로필로 바꾸기 | 기본 프로필로 정해요. 다음 `claude` 에서 커서가 여기서 시작해요. 이미 기본이면 안 보여요. |
| notion 로그인하기 | 로그인이 필요한 서버마다 `claude mcp login` 을 실행해요. 필요할 때만 보여요. |
| 다른 프로필에서 가져오기 | 다른 프로필에만 있는 플러그인과 MCP 서버를 골라서 가져와요. 옆에 무엇이 다른지 적혀 있어요. |
| 이름 바꾸기 | 로그인, 기록, 설정은 그대로예요. 그 프로필로 열린 Claude 창은 먼저 닫아요. |
| Claude 계정 바꾸기 | 이 프로필만 `claude auth login` 으로 다른 계정에 로그인해요. 다른 프로필은 그대로예요. |
| 지우기 | 한 번 더 확인하고 지워요. 로그인과 기록이 모두 지워지고 되돌릴 수 없어요. |

Esc 나 ← 를 누르면 목록으로 돌아가요. 커서는 보던 프로필에 그대로 있어요.

### MCP 로그인

Figma 나 Notion 처럼 로그인이 필요한 MCP 서버는 프로필마다 따로 로그인해요. "로그인하기" 를 고르면 브라우저가 서버마다 차례로 열리고, 허용만 누르면 돼요.

다른 프로필의 로그인을 복사해 오지 않는 건 일부러예요. 로그인 정보는 갱신될 때마다 바뀌어서, 복사해 두면 한쪽이 곧 끊겨요.

Claude Code 는 서버에 실제로 연결된 뒤에야 "로그인 필요" 표시를 지워요. 그래서 여기서 로그인하면 cpf 가 그걸 기억해 두고, 그 프로필로 Claude 를 다시 열 때까지 `!` 를 숨겨요.

### 다른 프로필에서 가져오기

![가져오기](/screens/ko/import.svg)

차이가 있는 프로필이 여럿이면 어느 프로필에서 가져올지 먼저 골라요. 그다음 Space 로 고르고 Enter 를 누르면 가져와요.

설치는 Claude Code 명령(`claude plugin install`, `claude mcp add-json -s user`)으로 해요. 손으로 설치한 것과 똑같이 기록돼요.

- 다른 프로필에서 꺼 둔 플러그인은 목록에 나오지 않아요.
- Gmail, Drive 같은 claude.ai 연결은 계정에 묶여 있어서 가져올 수 없어요. claude.ai 에서 계정마다 켜요.
- 특정 프로젝트에만 등록한 MCP 서버는 가져오지 않아요.

## 같이 쓰기 {#sharing}

![같이 쓰기](/screens/ko/share.svg)

설정 → 같이 쓰기에서 Space 로 켜고 끈 다음 Enter 를 눌러요. 켠 것은 `~/.claude-profiles/_shared` 에 하나만 두고, 모든 프로필이 링크로 같이 써요.

- `settings.json` 과 `commands` 는 늘 같이 써요. 설치할 때 같이 쓰지 않기로 했다면 여기 항목도 켤 수 없어요.
- 끄면 프로필마다 복사본이 남아요. 지워지는 건 없어요.
- 어떤 프로필에 내용이 다른 파일이 이미 있으면 덮어쓰지 않고 알려 줘요.
- MCP 서버, 로그인, 기록, 플러그인은 계정마다 따로라서 같이 쓸 수 없어요.

## 명령으로 하기

화면을 열지 않고 명령으로도 할 수 있어요. 스크립트에서는 이쪽을 써요.

| 명령 | 하는 일 |
| --- | --- |
| `cpf` | 프로필 목록 열기 |
| `cpf work` | `work` 를 기본 프로필로 정하기. Claude 는 켜지 않아요 |
| `cpf --list` | 프로필 목록과 기본 프로필 |
| `cpf add work2` | 프로필 만들기 |
| `cpf rename wrok2 work2` | 이름 바꾸기 |
| `cpf remove work2` | 확인한 뒤 지우기 |
| `cpf login work2` | `work2` 만 다른 Claude 계정으로 로그인 |
| `cpf share` | 같이 쓰는 것과 프로필마다 맞춰져 있는지 |
| `cpf share add skills` | 스킬 같이 쓰기. `remove` 로 그만 |
| `cpf language ko` | 화면 언어. `en` 은 영어, `auto` 는 시스템 설정 |

인자를 하나만 주면 항상 프로필 이름으로 읽어요. 그래서 `cpf add` 는 `add` 라는 프로필로 바꾸는 명령이고, 목록은 `cpf --list` 로 봐요.

셸 명령 없이 쓸 때는 `npx ai-profile-switch@latest` 뒤에 붙여요. 예를 들어 `npx ai-profile-switch@latest manage rename wrok2 work2` 는 `cpf rename wrok2 work2` 와 같아요. 어떤 명령이든 `--help` 를 붙이면 아무것도 바꾸지 않고 사용법만 보여 줘요.

프로필 이름은 영어 소문자, 숫자, `-` 로 30자까지예요. 처음과 끝은 글자나 숫자여야 하고, `_shared` 와 `default` 는 쓸 수 없어요.

## 원래 쓰던 설정 가져오기 {#bring-in-your-existing-settings}

`init` 에서 건너뛰었거나 나중에 가져오려면, 원래 설정과 그 프로필을 쓰는 Claude 창을 모두 닫고 실행해요.

```bash
npx ai-profile-switch@latest migrate work --from ~/.claude
```

- `~/.claude` 와 `~/.claude.json` 을 같이 가져와요. `CLAUDE_CONFIG_DIR` 를 따로 쓰고 있었다면 그 폴더를 `--from` 으로 주면 돼요. 원래 파일은 건드리지 않아요.
- 설정, 명령, 프로젝트, 플러그인, 스킬, 에이전트, 규칙, 훅, `CLAUDE.md`, 단축키, 출력 스타일 같은 것들을 복사해요. Claude 가 만드는 캐시와 임시 기록은 두고 와요.
- 프로필에 내용이 다른 데이터가 이미 있으면 아무것도 복사하지 않고, 어디가 겹치는지 알려 줘요. 덮어쓴 게 있으면 원래 데이터는 끝날 때 알려 주는 백업 경로에 남아요.
- macOS 키체인의 로그인은 옮기지 않아요. 처음 한 번 다시 로그인해요.

## 업데이트

셸 명령이 하루에 한 번 뒤에서 새 버전을 확인하고, 다음 실행부터 새 버전을 써요. 열려 있는 세션은 그대로예요.

```bash
npx ai-profile-switch@latest update           # 지금 업데이트
npx ai-profile-switch@latest update --check   # 확인만. 최신이면 0, 새 버전이 있으면 1, 확인 실패면 2
npx ai-profile-switch@latest install-shell    # 셸 명령 고치기
```

- 자동 업데이트를 끄려면 `CLAUDE_SWITCH_DISABLE_AUTO_UPDATE=1` 을 설정해요.
- 로그인, 기록, 셸 설정 파일은 업데이트 때 건드리지 않아요. 받기에 실패하면 지금 버전을 그대로 써요.
- Claude Code 자체 업데이트는 `claude update` 로 해요. 이 도구는 Claude Code 를 업데이트하지 않아요.
- 1.x 나 `claude-account-switch` 를 쓰다 왔다면 `install-shell` 을 한 번 실행하고 새 터미널을 열어요.

## 예전 MCP 설정

2 버전부터는 cpf 가 MCP 서버를 직접 고치지 않아요. 서버 추가는 `claude mcp add` 로, 로그인은 위의 프로필 화면에서 해요. `npx ai-profile-switch@latest mcp list` 는 예전에 저장한 서버 이름과 파일 위치만 보여 줘요. 주소, 토큰, 환경 변수 값은 출력하지 않아요. 자세한 건 [공식 MCP 안내](https://code.claude.com/docs/en/mcp)를 보세요.
