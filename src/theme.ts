// 릴스 규격과 체육관 정보. 체육관 이름·계정이 바뀌면 GYM만 고친다.

export const REEL = { width: 1080, height: 1920, fps: 30 } as const;

/** 인스타 화면이 덮는 영역. 글씨를 두지 않는다 */
export const SAFE = {
  top: 260, // 위: 음악 표시
  bottom: Math.round(1920 * 0.2), // 아래 20%: 캡션·버튼
  right: 160, // 오른쪽: 좋아요·댓글 버튼
} as const;

export const GYM = {
  /** 화려한 버전 인트로의 큰 글자 */
  short: "JARC",
  name: "JARC PERFORMANCE",
  handle: "@jarc_performance",
} as const;

export const sec = (s: number) => Math.round(s * REEL.fps);
