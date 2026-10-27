---
title: Linux · WSL — ai-profile-switch
description: Linux 와 WSL 에서 설치할 때 알아 둘 것.
---

# Linux · WSL

```bash
npx ai-profile-switch@latest init
```

끝나면 새 터미널을 열고 `claude` 를 쳐요. 붙이는 파일은 `~/.bashrc`, `~/.zshrc`, `~/.config/fish/config.fish` 예요.

- 로그인은 프로필 폴더의 `.credentials.json` 에 저장돼요. 원래 쓰던 설정을 가져오면 로그인은 가져오기로 고른 프로필 하나에만 복사해요.
- WSL 은 Windows 와 홈 폴더가 따로예요. WSL 에서 쓰려면 WSL 터미널 안에서 따로 설치해요. Windows 쪽에 설치해도 WSL 에는 생기지 않아요.
- `claude` 나 `cpf` 가 없다고 나오면 `npx ai-profile-switch@latest install-shell` 을 실행하고 새 터미널을 열어요.
- Claude 실행 파일을 못 찾는다고 나오면 `which claude` 와 `which node` 로 둘 다 PATH 에 있는지 봐요.

다음: [셸 통합](/ko/guide/shell-integration) · [프로필 관리](/ko/guide/commands)
