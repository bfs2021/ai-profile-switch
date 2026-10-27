---
title: 셸 통합 — ai-profile-switch
description: claude, cpf, claude-pick 셸 명령이 하는 일과 실행 전 훅.
---

# 셸 통합

설치하면 셸에 명령 세 개가 생겨요. 모두 터미널에서 치는 명령이라, Claude 채팅 안에서 치면 그냥 메시지로 보내져요. 채팅 중이라면 먼저 `/exit` 로 나와요.

| 명령 | 하는 일 |
| --- | --- |
| `claude [인자]` | 프로필을 고르고 그 프로필로 Claude Code 를 실행해요. 인자는 그대로 넘겨요. |
| `cpf` | 프로필 목록을 열어 관리해요. [프로필 관리](/ko/guide/commands)를 보세요. |
| `claude-pick` | 기본 프로필만 바꿔요. Claude 는 켜지 않아요. |

## claude 를 실행하면

프로필이 둘 이상이면 목록이 나와요.

![claude 프로필 목록](/screens/ko/launch.svg)

| 키 | 하는 일 |
| --- | --- |
| ↑ ↓, 숫자 | 옮기기, 숫자는 바로 고르기 |
| Enter | 이 프로필로 시작 |
| → | 프로필 화면 열기. Esc 로 닫으면 목록으로 돌아와요 |
| Esc, Ctrl+C | 취소. 종료 코드는 130 이에요 |

- 프로필이 하나뿐이거나 입력이 파이프로 들어오면 묻지 않고 기본 프로필로 바로 시작해요.
- 목록과 안내는 stderr 에 그려요. Claude 의 출력과 종료 코드는 그대로 전달돼요.
- `CLAUDE_CONFIG_DIR` 는 실행되는 Claude 에만 들어가고 지금 셸에는 남지 않아요.
- 이미 열려 있는 Claude 세션은 다른 프로필을 골라도 바뀌지 않아요.

## 실행 전 훅

프로필 폴더에 훅 파일이 있으면 Claude 를 켜기 직전에 실행해요. 지금 셸에 맞는 파일 하나만 실행해요.

| 셸 | 파일 |
| --- | --- |
| bash, zsh | `~/.claude-profiles/<프로필>/pre-launch.sh` |
| fish | `~/.claude-profiles/<프로필>/pre-launch.fish` |
| PowerShell | `~/.claude-profiles/<프로필>/pre-launch.ps1` |

프로필마다 다른 환경 변수가 필요할 때 써요. 예를 들어 회사 프로필에서만 프록시를 쓴다면 이렇게 적어요.

```bash
# ~/.claude-profiles/work/pre-launch.sh
HTTPS_PROXY=http://proxy.example.com:8080
```

훅에서 정한 값은 그 Claude 에만 들어가요. 훅이 실패하면 Claude 를 켜지 않아요.

bash 나 zsh 에서 `__claude_switch_launch` 를 직접 바꿔 쓰고 있었다면 그대로 쓸 수 있어요. 셸 설정 파일에서 이 도구를 불러오는 줄보다 아래에 두면 돼요.

## 셸 설정 파일

`init` 과 `install-shell` 은 지금 쓰는 셸과 이미 있는 설정 파일을 보고 아래 파일에 한 줄을 붙여요. 이미 붙어 있으면 또 붙이지 않아요.

| 셸 | 파일 |
| --- | --- |
| zsh | `$ZDOTDIR/.zshrc`, 없으면 `~/.zshrc` |
| bash | `~/.bashrc` |
| fish | `$XDG_CONFIG_HOME/fish/config.fish`, 없으면 `~/.config/fish/config.fish` |
| PowerShell | `Documents/PowerShell/Microsoft.PowerShell_profile.ps1` 과 예전 Windows PowerShell 프로필 |

셸 명령은 `~/.claude-profiles/_runtime` 에 복사해 둔 실행 파일을 불러요. 이 파일이나 Node.js 가 없으면 고치는 명령을 알려 주고 멈춰요.

```bash
npx ai-profile-switch@latest install-shell
```

이 저장소를 받아서 고친 코드를 써 보려면 저장소 폴더에서 `node bin/cli.mjs install-shell` 을 실행해요. `@latest` 는 npm 에 올라간 버전을 설치해요.
