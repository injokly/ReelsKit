#!/bin/zsh
# 처음 한 번: 필요한 프로그램을 설치하고 확인한다. 비밀번호가 필요 없는 방법만 쓴다.
#   zsh scripts/setup.sh          설치 + 확인
#   zsh scripts/setup.sh --check  확인만
source "$(dirname "$0")/lib.sh"
CHECK_ONLY=0; [ "$1" = "--check" ] && CHECK_ONLY=1
FAIL=0
cd "$KIT"

[ "$(uname)" = "Darwin" ] && ok "macOS" || { bad "macOS가 아니에요 (이 키트는 맥 전용)"; exit 1; }

# 1. Node (20.19 이상). 없으면 ~/.jarc-reels/node 에 내려받는다
node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=19)?0:1)'
}
if ! node_ok && [ $CHECK_ONLY = 0 ]; then
  ARCH=$([ "$(uname -m)" = "arm64" ] && echo arm64 || echo x64)
  NAME=$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | grep -o "node-v[0-9.]*-darwin-$ARCH.tar.gz" | head -1)
  if [ -n "$NAME" ]; then
    echo "Node 설치 중: $NAME"
    TMP=$(mktemp -d)
    curl -fsSL "https://nodejs.org/dist/latest-v22.x/$NAME" -o "$TMP/node.tgz" &&
      mkdir -p "$NODE_HOME" && tar -xzf "$TMP/node.tgz" -C "$NODE_HOME" --strip-components=1
    rm -rf "$TMP"
    export PATH="$NODE_HOME/bin:$PATH"
    grep -q ".jarc-reels/node" "$HOME/.zprofile" 2>/dev/null ||
      echo 'export PATH="$HOME/.jarc-reels/node/bin:$PATH"' >> "$HOME/.zprofile"
  fi
fi
node_ok && ok "Node $(node -v)" || { bad "Node 20.19 이상이 필요해요"; FAIL=1; }

# 2. 패키지 (Remotion, ffmpeg 포함)
if [ $CHECK_ONLY = 0 ] && node_ok; then
  echo "패키지 설치 중 (1~2분)…"
  npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null 2>&1
  npx remotion browser ensure >/dev/null 2>&1
fi
[ -d node_modules/remotion ] && ok "Remotion" || { bad "패키지가 없어요 (npm install 실패)"; FAIL=1; }
ff -version >/dev/null 2>&1 && ok "ffmpeg" || { bad "ffmpeg가 실행되지 않아요"; FAIL=1; }

# 3. iCloud Drive
if [ ! -d "$ICLOUD_ROOT" ]; then
  bad "iCloud Drive가 꺼져 있어요: 시스템 설정 → Apple 계정 → iCloud → iCloud Drive 켜기"; FAIL=1
else
  [ $CHECK_ONLY = 0 ] && mkdir -p "$ICLOUD" 2>/dev/null
  T="$ICLOUD"; [ -d "$T" ] || T="$ICLOUD_ROOT"
  if touch "$T/.write-test" 2>/dev/null; then
    rm -f "$T/.write-test"; ok "iCloud 폴더: iCloud Drive/JARC릴스"
  else
    bad "iCloud 폴더에 접근할 수 없어요: 시스템 설정 → 개인정보 보호 및 보안 → 전체 디스크 접근 권한에서 Claude(또는 터미널) 켜기"; FAIL=1
  fi
fi

# 4. 글꼴
[ -f public/fonts/Pretendard-Bold.woff2 ] && ok "글꼴" || { bad "public/fonts 의 Pretendard가 없어요"; FAIL=1; }

[ $FAIL = 0 ] && echo "모두 준비됐어요." || echo "❌ 항목을 먼저 해결해야 해요."
exit $FAIL
