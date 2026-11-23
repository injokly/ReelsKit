#!/bin/zsh
# 원본 정리: iCloud Drive/JARC릴스/<id>/ 의 영상을 세로 1080×1920 클립으로 바꾸고,
# 확인용 장면 시트와 "움직임이 가장 큰 1.5초" 추천을 만든다.
#   zsh scripts/prepare.sh 261123
# 결과: public/sessions/<id>/cNN.mp4, work/<id>/cNN_sheet.jpg (0.5초 간격, 8칸씩 줄바꿈),
#       work/<id>/clips.tsv, work/<id>/photos/*.jpg
source "$(dirname "$0")/lib.sh"
ID="$1"; [ -z "$ID" ] && { echo "사용법: zsh scripts/prepare.sh <YYMMDD>"; exit 1; }
IN="$ICLOUD/$ID"
[ -d "$IN" ] || { bad "폴더가 없어요: iCloud Drive/JARC릴스/$ID"; exit 1; }
OUT="$KIT/public/sessions/$ID"; WORK="$KIT/work/$ID"
mkdir -p "$OUT" "$WORK/photos"

# 아이폰 저장 공간 최적화로 내려받지 않은 파일(.xxx.icloud)이 있으면 받는다
if ls -a "$IN" | grep -q '\.icloud$'; then
  echo "iCloud에서 원본 내려받는 중…"
  brctl download "$IN" 2>/dev/null
  for i in {1..120}; do ls -a "$IN" | grep -q '\.icloud$' || break; sleep 5; done
  ls -a "$IN" | grep -q '\.icloud$' && { bad "아직 다 못 받았어요. 잠시 뒤 다시 실행해 주세요"; exit 1; }
fi

# 촬영 시각 순으로 정렬
LIST=$(for f in "$IN"/*(.N); do
  case "${f:l}" in *.mov|*.mp4|*.m4v) ;; *) continue ;; esac
  t=$(ff -i "$f" 2>&1 | grep -m1 -E "com.apple.quicktime.creationdate|creation_time" | sed 's/.*: //')
  printf '%s\t%s\n' "${t:-${f:t}}" "$f"
done | sort)

printf "file\tsource\tcreated\tseconds\tbest_start\tmotion\n" > "$WORK/clips.tsv"
n=0
print -r -- "$LIST" | while IFS=$'\t' read -r created f; do
  [ -z "$f" ] && continue
  n=$((n+1)); name=$(printf 'c%02d' $n)
  info=$(ff -i "$f" 2>&1)
  if print -r -- "$info" | grep -qE "arib-std-b67|smpte2084"; then
    tone="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,"
  else tone=""; fi
  ff -nostdin -v error -y -i "$f" -an \
    -vf "${tone}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p" \
    -c:v libx264 -crf 18 -preset veryfast -g 30 -movflags +faststart "$OUT/$name.mp4" ||
    { bad "$f 변환 실패"; continue; }
  dur=$(ff -i "$OUT/$name.mp4" 2>&1 | grep -m1 Duration | sed -E 's/.*Duration: ([0-9:.]+).*/\1/' |
    awk -F: '{printf "%.2f", $1*3600+$2*60+$3}')
  frames=$(awk -v d="$dur" 'BEGIN{n=int(d*2); if(n<1)n=1; print n}')
  rows=$(( (frames + 7) / 8 ))
  ff -nostdin -v error -y -i "$OUT/$name.mp4" -vf "fps=2,scale=180:-1,tile=8x$rows" -frames:v 1 "$WORK/${name}_sheet.jpg"
  # 움직임: 앞뒤 프레임 차이의 밝기 평균을 0.1초마다 재고, 1.5초 창의 합이 가장 큰 곳
  best=$(ff -nostdin -v error -i "$OUT/$name.mp4" \
    -vf "fps=10,scale=160:-1,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - |
    awk -F'[= :]+' '/pts_time/{for(i=1;i<=NF;i++) if($i=="pts_time") t=$(i+1)} /YAVG/{n++; T[n]=t; V[n]=$NF}
      END{W=15; b=0; bs=0; for(i=1;i+W-1<=n;i++){s=0; for(j=i;j<i+W;j++) s+=V[j]; if(s>bs){bs=s; b=T[i]}}
          if(n<W){b=0; for(j=1;j<=n;j++) bs+=V[j]} printf "%.1f\t%.1f", b, bs/W}')
  printf "%s\t%s\t%s\t%s\t%s\n" "$name.mp4" "${f:t}" "$created" "$dur" "$best" >> "$WORK/clips.tsv"
  echo "$name ← ${f:t} (${dur}초)"
done

# 사진은 와드 확인용으로 jpg로 바꿔 둔다
for f in "$IN"/*(.N); do
  case "${f:l}" in *.heic|*.jpg|*.jpeg|*.png)
    sips -s format jpeg -Z 1600 "$f" --out "$WORK/photos/${${f:t}%.*}.jpg" >/dev/null 2>&1 ;;
  esac
done
ok "정리 끝: $(($(wc -l < "$WORK/clips.tsv") - 1))개 영상, 사진 $(ls "$WORK/photos" | wc -l | tr -d ' ')장"
column -t -s $'\t' "$WORK/clips.tsv"
