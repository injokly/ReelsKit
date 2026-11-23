#!/bin/zsh
# 렌더: sessions/<id>.json 으로 담백한 버전(plain)과 화려한 버전(flashy)을 만든다.
#   zsh scripts/render.sh 261123 sample        미리보기 (절반 화질, 빠름)
#   zsh scripts/render.sh 261123 final         올릴 파일 + 커버 이미지
#   zsh scripts/render.sh 261123 final plain   한 가지만
# 결과는 out/ 과 iCloud Drive/JARC릴스/<id>/output/ 에 둘 다 놓는다.
source "$(dirname "$0")/lib.sh"
ID="$1"; MODE="${2:-sample}"; WHICH="${3:-both}"
PROPS="sessions/$ID.json"
cd "$KIT"
[ -f "$PROPS" ] || { bad "$PROPS 가 없어요"; exit 1; }
[ "$WHICH" = both ] && LOOKS=(plain flashy) || LOOKS=("$WHICH")
DEST="$ICLOUD/$ID/output"; mkdir -p out "$DEST" 2>/dev/null

for look in $LOOKS; do
  if [ "$MODE" = final ]; then
    file="out/$ID-$look.mp4"; opts=(--crf=18)
  else
    file="out/$ID-${look}_sample.mp4"; opts=(--scale=0.5 --crf=30)
  fi
  echo "렌더 중: $file"
  for try in 1 2 3; do
    npx remotion render "$look" "$file" --props="$PROPS" --codec=h264 --concurrency=2 $opts >/dev/null 2>"work/render-$look.log" && break
    echo "  다시 시도 ($try)"
  done
  [ -f "$file" ] || { bad "$look 렌더 실패. work/render-$look.log 를 보세요"; continue; }
  cp "$file" "$DEST/" 2>/dev/null
  if [ "$MODE" = final ]; then
    frame=$([ "$look" = plain ] && echo 45 || echo 60)
    npx remotion still "$look" "out/$ID-${look}_cover.jpg" --props="$PROPS" --frame=$frame --image-format=jpeg >/dev/null 2>&1 &&
      cp "out/$ID-${look}_cover.jpg" "$DEST/" 2>/dev/null
  fi
  ok "$file"
done
echo "iCloud Drive/JARC릴스/$ID/output/ 에도 넣었어요."
