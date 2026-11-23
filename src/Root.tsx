import { Composition } from "remotion";
import sample from "../sessions/sample.json";
import { Flashy, flashyFrames } from "./Flashy";
import { Plain, plainFrames } from "./Plain";
import { sessionSchema, type Session } from "./session";
import { REEL } from "./theme";

// 영상 두 가지. 어떤 세션을 쓸지는 렌더할 때 --props=sessions/<id>.json 으로 넘긴다.
// Studio(npm run dev)에서는 sessions/sample.json 이 기본으로 보인다.

type Props = { session: Session };
const read = (props: Props) => {
  const parsed = sessionSchema.safeParse(props.session);
  if (!parsed.success)
    throw new Error(`세션 파일 형식이 틀렸어요: ${parsed.error.message}`);
  return parsed.data;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="plain"
      component={Plain}
      defaultProps={sample as Props}
      calculateMetadata={({ props }) => ({
        durationInFrames: plainFrames(read(props)),
      })}
      durationInFrames={300}
      fps={REEL.fps}
      width={REEL.width}
      height={REEL.height}
    />
    <Composition
      id="flashy"
      component={Flashy}
      defaultProps={sample as Props}
      calculateMetadata={({ props }) => ({
        durationInFrames: flashyFrames(read(props)),
      })}
      durationInFrames={300}
      fps={REEL.fps}
      width={REEL.width}
      height={REEL.height}
    />
  </>
);
