import { z } from "zod";
import { REEL } from "./theme";

// 영상 한 편 = 세션 파일 하나 (sessions/<YYMMDD>.json).
// 원본 영상은 public/sessions/<id>/ 에 있고, 컷의 src 는 그 폴더 안의 파일 이름이다.

export const cutSchema = z.object({
  /** public/sessions/<id>/ 안의 파일 이름. 예: "c01.mp4" */
  src: z.string(),
  /** 원본에서 시작할 위치(초) */
  start: z.number().min(0),
  /** 이 컷의 길이(초) */
  seconds: z.number().positive(),
  zoom: z.number().min(1).optional(),
  centerX: z.number().min(0).max(1).optional(),
  centerY: z.number().min(0).max(1).optional(),
  /** 어두운 컷을 밝힐 때. 1이 그대로 */
  brightness: z.number().optional(),
  /** 화려한 버전에서 이 컷으로 들어올 때의 전환. 비우면 자동 */
  enter: z.enum(["none", "black", "glow", "punch", "slash", "box"]).optional(),
});

export const sessionSchema = z.object({
  id: z.string(),
  /** 화면에 쓰는 날짜. 예: "11.23" */
  date: z.string(),
  wod: z.object({
    /** 예: "Run & Station Interval" */
    title: z.string(),
    /** 예: "3분 RUN + 2분 STATION × 6 SETS" */
    summary: z.string(),
    /** 종목 순서. 예: ["SkiErg", "Sled Push"] */
    sets: z.array(z.string()),
  }),
  /** 담백한 버전에서 와드를 띄워 둘 앞쪽 컷 수 */
  wodCuts: z.number().int().min(1),
  cuts: z.array(cutSchema).min(4),
});

export type Cut = z.infer<typeof cutSchema>;
export type Session = z.infer<typeof sessionSchema>;

export const frames = (s: number) => Math.max(1, Math.round(s * REEL.fps));
export const mediaPath = (session: Session, cut: Cut) =>
  `sessions/${session.id}/${cut.src}`;
