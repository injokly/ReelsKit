# 자르크 릴스 키트

자르크(JARC PERFORMANCE) 수업 영상을 인스타 릴스로 만드는 도구. Remotion(React로 영상 만드는 도구) 기반.
- 처음 설치: `SETUP.md`
- 매일 영상 만들기: `.claude/skills/jarc-reels/SKILL.md` ("오늘 영상 만들어줘", "<날짜> 영상" 요청이면 반드시 먼저 읽는다)

## 사용자
- 체육관 운영자. **개발자가 아니다.** 쉬운 한국어로 짧게 말하고, 명령어·코드·오류 원문을 보여 주지 않는다
- 사용자가 할 일은 "무엇을 누르면 되는지"로만 말한다
- 비밀번호·로그인·권한 창은 사용자가 직접 한다

## 영상 두 가지
| 이름 | 내용 |
|---|---|
| `plain` (담백) | 앞 컷들 위에 오늘의 와드(날짜, 제목, 요약, 종목 순서) → 글씨 없이 영상 → 체육관 이름 카드 |
| `flashy` (화려) | "JARC" 큰 글자 인트로 → 컷마다 번쩍임·사선·당김·검정 끊기 → 네모 창 → 이름 카드 |

## 지켜야 할 것
- **샘플 먼저.** `render.sh <id> sample`로 보여 주고, 사용자가 "좋아", "최종", "올릴게"라고 할 때만 `final`
- **글씨는 흰색 한 가지.** 형광색, 종목 이름 라벨(SKI, WALL BALL 등), 기울인 굵은 글씨, 검정 외곽선을 넣지 않는다 (AI가 만든 티가 난다는 피드백)
- 영상에 **음악을 넣지 않는다.** 인스타에서 붙인다
- 화면 위 260px, 아래 20%, 오른쪽 160px에는 글씨를 두지 않는다 (인스타 화면이 덮음)
- iCloud의 원본 파일은 **수정·이동·삭제하지 않는다.** 결과는 그날 폴더 안 `output/`에만 넣는다
- 체육관 이름·계정이 바뀌면 `src/theme.ts`의 `GYM`만 고친다

## 폴더
```
sessions/<id>.json        영상 한 편의 설정 (와드, 컷 목록). 형식 예: sessions/sample.json
public/sessions/<id>/     정리된 원본 클립 c01.mp4… (prepare.sh가 만든다)
work/<id>/                확인용 장면 시트, clips.tsv, 사진
out/                      렌더 결과
src/Plain.tsx, Flashy.tsx 두 가지 영상
src/session.ts            세션 파일 형식
scripts/                  setup.sh, prepare.sh, render.sh
notes/notion.md           Notion 운동기록 위치·읽는 법 (처음 연결할 때 채움)
```

## 명령
| 목적 | 명령 |
|---|---|
| 설치·점검 | `zsh scripts/setup.sh` / `zsh scripts/setup.sh --check` |
| 원본 정리 | `zsh scripts/prepare.sh <id>` |
| 샘플 / 최종 | `zsh scripts/render.sh <id> sample` / `zsh scripts/render.sh <id> final` |
| 정지 화면 | `npx remotion still plain work/<id>/check.jpg --props=sessions/<id>.json --frame=60 --scale=0.3` |
| 코드 검사 | `npm run check` |
| 미리보기 화면 | `npm run dev` (Studio, sample 세션이 기본) |
