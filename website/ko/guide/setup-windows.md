---
title: Windows — ai-profile-switch
description: Windows PowerShell 에서 설치할 때 알아 둘 것. 프로필 파일, 실행 정책, 링크.
---

# Windows

PowerShell 에서 실행해요.

```powershell
npx ai-profile-switch@latest init
```

끝나면 새 PowerShell 창을 열고 `claude` 를 쳐요.

- PowerShell 5.1 과 PowerShell 7 의 프로필 파일에 둘 다 붙여요. OneDrive 로 옮긴 문서 폴더도 찾아가고, 원래 파일의 내용과 인코딩은 그대로 둬요.
- 실행 정책 때문에 프로필 파일이 안 불러와지면 PC 나 회사의 실행 정책을 확인해요. `$PROFILE` 로 어느 파일인지 볼 수 있어요.
- 같이 쓰는 폴더는 junction 으로 연결해요. 파일 링크는 개발자 모드가 꺼져 있으면 만들 수 없어서, 그때는 복사하고 알려 줘요. 복사한 파일은 한쪽을 고쳐도 다른 쪽이 바뀌지 않아요.
- WSL 에서 쓰려면 [Linux · WSL](/ko/guide/setup-linux)을 따라 WSL 안에서 따로 설치해요.
- `claude` 나 `cpf` 가 없다고 나오면 `npx ai-profile-switch@latest install-shell` 을 실행하고 새 창을 열어요.

다음: [셸 통합](/ko/guide/shell-integration) · [프로필 관리](/ko/guide/commands)
