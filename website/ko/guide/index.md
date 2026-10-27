---
title: 시작하기 — ai-profile-switch
description: 설치하고 프로필을 만든 뒤, claude 로 골라서 시작하기까지.
---

# 시작하기

Node.js 18.19 이상(18 계열) 또는 20.10 이상과 Claude Code 가 있으면 돼요. Claude Code 가 아직 없다면 [공식 설치 안내](https://code.claude.com/docs/en/setup)부터 따라 하세요.

## 설치

```bash
npx ai-profile-switch@latest init
```

몇 가지를 차례로 물어봐요.

1. 만들 프로필 이름. `work, personal` 처럼 쉼표로 적어요.
2. 처음에 쓸 프로필. 이름을 두 개 이상 적었을 때만 물어요.
3. 모든 프로필이 `settings.json` 과 `commands` 를 같이 쓸지.
4. 지금 쓰는 Claude 설정(`~/.claude`)을 어느 프로필로 가져올지. 건너뛰어도 돼요.

끝나면 새 터미널을 열어요. `claude` 와 `cpf` 명령이 생겨 있어요.

## 골라서 시작하기

![claude 프로필 목록](/screens/ko/launch.svg)

`claude` 를 치면 이 목록이 나와요. ↑↓ 로 옮겨 Enter 를 누르거나, 숫자를 바로 눌러요. Esc 는 취소예요.

- 초록 `●` 는 기본 프로필이에요. 마지막으로 고른 프로필이고, 다음에도 커서가 여기서 시작해요.
- 막대는 5시간·주간 사용량이에요. 저장된 값으로 먼저 그리고, 1초쯤 뒤 지금 값으로 바꿔요. 지금 값을 받지 못한 프로필은 흐리게 남아요.
- 노란 `!` 는 그 프로필의 MCP 서버가 로그인을 기다린다는 뜻이에요. → 를 누르면 프로필 화면이 열리고, 거기서 바로 로그인할 수 있어요.

처음 쓰는 프로필이면 Claude 가 로그인을 물어봐요. 그 프로필에 쓸 계정으로 로그인하면 끝이에요.

## 계정 하나 더 추가하기

```bash
cpf add work2
claude
```

목록에서 `work2` 를 고르고, Claude 가 물으면 새 계정으로 로그인해요. `cpf` 화면의 "프로필 추가" 로 해도 같아요.

## 자주 묻는 것

**원래 쓰던 `~/.claude` 는 어떻게 되나요?**
그대로 남아요. `init` 에서 가져오기를 고르면 복사본이 프로필로 들어가요. 나중에 가져오는 방법은 [프로필 관리](/ko/guide/commands#bring-in-your-existing-settings)에 있어요.

**로그인도 같이 복사되나요?**
macOS 는 로그인 정보가 키체인에 있어서 복사되지 않아요. 그 프로필로 처음 시작할 때 한 번 다시 로그인하면 돼요. 다른 OS 에서 파일로 된 로그인 정보는, 가져오기로 고른 프로필 하나에만 복사해요.

**Claude 채팅 안에서 `cpf` 를 쳤는데 아무 일도 없어요.**
`cpf` 와 `claude` 는 터미널 명령이에요. 채팅 안이라면 `/exit` 로 나온 뒤 터미널에서 쳐요.

**npx 캐시를 지워도 되나요?**
돼요. 설치할 때 실행 파일을 `~/.claude-profiles/_runtime` 에 복사해 둬요.

다음: [프로필 관리](/ko/guide/commands) · [셸 통합](/ko/guide/shell-integration)
