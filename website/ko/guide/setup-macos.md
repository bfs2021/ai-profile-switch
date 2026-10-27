---
title: macOS — ai-profile-switch
description: macOS 에서 설치할 때 알아 둘 것. 키체인 로그인과 셸 설정 파일.
---

# macOS

```bash
npx ai-profile-switch@latest init
```

끝나면 새 터미널을 열고 `claude` 를 쳐요. zsh, bash, fish 를 지원하고, 붙이는 파일은 `~/.zshrc`, `~/.bashrc`, `~/.config/fish/config.fish` 예요.

- macOS 에서는 로그인이 키체인에 저장돼요. 그래서 원래 쓰던 설정을 가져와도 로그인은 따라오지 않아요. 그 프로필로 처음 시작할 때 한 번 로그인해요.
- 목록의 지금 사용량도 키체인에 있는 그 프로필의 로그인으로 물어봐요. 자세한 건 [작동 방식](/ko/guide/how-it-works#usage)에 있어요.
- `claude` 나 `cpf` 가 없다고 나오면 `npx ai-profile-switch@latest install-shell` 을 실행하고 새 터미널을 열어요.
- Claude 실행 파일을 못 찾는다고 나오면 `which claude` 와 `which node` 로 둘 다 PATH 에 있는지 봐요.

다음: [셸 통합](/ko/guide/shell-integration) · [프로필 관리](/ko/guide/commands)
