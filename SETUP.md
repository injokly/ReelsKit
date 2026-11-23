# 자르크 릴스 키트 — 처음 설치

> **사람이 할 일**
> 1. Claude 데스크톱 앱 → **Code** 탭 → 폴더 선택에서 `문서` 폴더를 고른다
>    (터미널에서 `claude`를 쓰는 분은 아무 폴더에서 실행)
> 2. 이렇게 입력한다: **https://github.com/injokly/ReelsKit 받아서 SETUP.md 읽고 진행해줘**
>    (이 파일만 따로 받았다면 파일을 Claude에 올리고 **SETUP.md 읽고 진행해줘**)
>
> 중간에 Claude가 "이건 직접 눌러 주세요"라고 하는 곳(로그인, 권한 허용)만 눌러 주면 된다.

---

아래는 Claude Code가 읽고 따라 하는 순서다.

## Claude에게: 먼저 알아 둘 것
- 사용자는 **개발자가 아니다.** 명령어·파일 이름·오류 원문을 그대로 보여 주지 말고, 무엇이 됐고 사용자가 무엇을 눌러야 하는지만 쉬운 한국어로 말한다
- 명령은 Claude가 실행한다. 사용자에게 터미널 명령을 치라고 하지 않는다
- **비밀번호, 로그인, macOS 권한 창은 사용자가 직접 한다.** Claude는 비밀번호를 묻거나 입력하지 않는다
- 이 키트는 맥 전용이다. Homebrew나 관리자 비밀번호 없이 설치되게 만들어 두었다
- 각 단계가 끝날 때마다 한 줄로 알려 준다 (예: "1/5 프로그램 설치 끝")

## 0. 저장소 받기
- 저장소 주소: **https://github.com/injokly/ReelsKit**
- 지금 폴더에 `SETUP.md`와 `scripts/`가 이미 있으면 건너뛴다
- 없으면 `~/Documents`에서 `git clone https://github.com/injokly/ReelsKit.git jarc-reels-kit`을 하고 그 폴더로 들어간다. 이미 `~/Documents/jarc-reels-kit`이 있으면 그 폴더에서 `git pull`만 한다. 이후 명령은 모두 그 폴더 안에서 실행한다
- 폴더를 옮겼으니, 다 끝난 뒤 사용자에게 "앞으로는 Claude 앱에서 `문서/jarc-reels-kit` 폴더를 열고 쓰면 돼요"라고 알려 준다
- git이 없다고 나오면 macOS가 "개발자 도구 설치" 창을 띄운다. 사용자에게 **설치**를 눌러 달라고 하고 끝나면 다시 시도한다
- 비공개 저장소라 로그인을 요구하면, 사용자에게 저장소 주인에게 초대를 받았는지 확인하고 GitHub 로그인을 해 달라고 한다
- 나중에 키트가 바뀌었다는 말을 들으면 `git pull`로 받는다

## 1. 프로그램 설치
```bash
zsh scripts/setup.sh
```
- Node가 없으면 `~/.jarc-reels/node`에 내려받고, 패키지(Remotion, ffmpeg 포함)와 렌더용 브라우저를 설치한다. 2~5분 걸린다
- 끝에 ✅/❌ 목록이 나온다. ❌가 있으면 아래 표대로 처리하고 `zsh scripts/setup.sh --check`로 다시 확인한다

| ❌ 항목 | 할 일 |
|---|---|
| Node | 인터넷 연결 확인 후 다시 실행. 그래도 안 되면 사용자에게 https://nodejs.org 에서 LTS 설치 파일을 받아 설치해 달라고 한다 (이때만 맥 비밀번호가 필요) |
| 패키지 / ffmpeg | `npm install`을 직접 실행해 오류를 보고 고친다 |
| iCloud Drive가 꺼져 있음 | 사용자에게: 시스템 설정 → 맨 위 내 이름 → iCloud → iCloud Drive 켜기 |
| iCloud 폴더에 접근할 수 없음 | 사용자에게: 시스템 설정 → 개인정보 보호 및 보안 → 전체 디스크 접근 권한 → **Claude**(터미널에서 쓰면 **터미널**) 켜기. 켠 뒤 앱을 완전히 껐다 켜야 할 수 있다 |

## 2. 시험 렌더
```bash
zsh scripts/render.sh sample sample
```
- 들어 있는 샘플 영상으로 두 가지 버전을 만든다: `out/sample-plain_sample.mp4`(담백), `out/sample-flashy_sample.mp4`(화려)
- `open out/sample-plain_sample.mp4`로 열어 사용자에게 보여 준다. 결과는 iCloud Drive/JARC릴스/sample/output/ 에도 들어간다

## 3. Notion 연결 (운동기록)
운동기록은 자르크 Notion에 있다. 와드(오늘의 운동)를 여기서 읽는다.

1. 지금 세션에 Notion 도구(이름에 `notion`이 들어간 도구)가 있는지 본다. 있으면 4로
2. 없으면 사용자에게 이렇게 안내한다:
   - **claude.ai** → 설정 → **커넥터** → Notion → 연결 → 자르크 Notion 계정으로 로그인 → 허용
   - 끝나면 Claude 앱에서 **새 세션**을 열고 다시 "SETUP.md 읽고 진행해줘"라고 하면 이어서 한다
   - 터미널 Claude Code를 쓰는 경우: 이 폴더의 `.mcp.json`에 Notion이 들어 있다. `/mcp` → notion → Authenticate
3. 연결이 안 되면 Notion 없이도 쓸 수 있다고 알려 준다 (와드는 사진이나 말로 받는다). 다음 단계로 넘어간다
4. 연결되면 Notion에서 "와드", "WOD", "운동기록", 최근 날짜로 검색해 운동기록이 있는 곳을 찾는다
5. 찾은 구조를 `notes/notion.md`에 적는다: 데이터베이스/페이지 이름과 링크, 날짜를 찾는 방법, 와드 제목·요약·종목 순서가 어디에 있는지, 실제 예시 하루치
6. 사용자에게 "이 페이지에서 와드를 읽으면 되나요?"라고 확인받는다

## 4. 아이폰 사용법 안내
사용자에게 이렇게 알려 준다 (그대로 보여 줘도 된다):

> **영상 올리는 법**
> 1. 아이폰 **파일** 앱 → iCloud Drive → **JARC릴스** 폴더
> 2. 그날 날짜로 폴더를 만든다. 예: 11월 23일이면 `261123`
> 3. 사진 앱에서 그날 영상을 골라 공유 → "파일에 저장" → 그 폴더
> 4. 맥의 Claude에게: **"261123 영상 만들어줘"**

## 5. 끝
`zsh scripts/setup.sh --check`가 모두 ✅인지 확인하고, 사용자에게 한 줄로 알린다:
"준비 끝났어요. 이제 아이폰으로 영상을 올리고 '<날짜> 영상 만들어줘'라고 하면 돼요."

매일 영상 만드는 순서는 `.claude/skills/jarc-reels/SKILL.md`에 있다.
