# 다른 스크립트가 불러 쓰는 공통 값
KIT="$(cd "$(dirname "$0")/.." && pwd)"
ICLOUD_ROOT="$HOME/Library/Mobile Documents/com~apple~CloudDocs"
ICLOUD="${JARC_ICLOUD:-$ICLOUD_ROOT/JARC릴스}"  # 시험할 때만 JARC_ICLOUD 로 바꾼다
NODE_HOME="$HOME/.jarc-reels/node"
[ -x "$NODE_HOME/bin/node" ] && export PATH="$NODE_HOME/bin:$PATH"
ff() { "$KIT/node_modules/ffmpeg-static/ffmpeg" "$@"; }
ok() { printf '✅ %s\n' "$*"; }
bad() { printf '❌ %s\n' "$*"; }
