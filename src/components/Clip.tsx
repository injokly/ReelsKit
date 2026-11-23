import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { REEL } from "../theme";

type Props = {
  /** public/ 기준 경로 */
  src: string;
  /** 원본에서 시작할 위치(초) */
  startAt?: number;
  /** 확대 배율. 1이면 전체 화면 */
  zoom?: number;
  /** 원본에서 화면 가운데에 둘 지점 (0~1) */
  centerX?: number;
  centerY?: number;
};

const clampOffset = (center: number, zoom: number, size: number) => {
  const limit = ((zoom - 1) * size) / 2;
  return Math.max(-limit, Math.min(limit, (0.5 - center) * size * zoom));
};

/** 영상 컷. 9:16에 꽉 차게 자르고 소리는 뺀다 */
export const Clip: React.FC<Props> = ({
  src,
  startAt = 0,
  zoom = 1,
  centerX = 0.5,
  centerY = 0.5,
}) => {
  const x = clampOffset(centerX, zoom, REEL.width);
  const y = clampOffset(centerY, zoom, REEL.height);
  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}
      >
        <Video
          src={staticFile(src)}
          trimBefore={Math.round(startAt * REEL.fps)}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
