import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Clip } from "./components/Clip";
import { FONT } from "./fonts";
import { frames, mediaPath, type Session } from "./session";
import { GYM } from "./theme";

// 담백한 버전: 앞쪽 몇 컷 위에 오늘의 와드 → 글씨 없이 영상 → 체육관 이름 카드.
// 글씨는 흰색 한 가지, 종목 이름·형광색·움직이는 효과를 쓰지 않는다 (만든 티가 난다는 피드백).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SHADOW = "0 2px 12px rgba(0,0,0,0.6)";
export const PLAIN_END = 75;

export const plainFrames = (s: Session) =>
  s.cuts.reduce((n, c) => n + frames(c.seconds), 0) + PLAIN_END;

const Wod: React.FC<{ session: Session; length: number }> = ({
  session,
  length,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5, length - 8, length], [0, 1, 1, 0], clamp);
  const { wod } = session;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.38)" }} />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 180,
          top: 560,
          fontFamily: FONT.body,
          color: "#fff",
          textShadow: SHADOW,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 34, letterSpacing: 5 }}>
          {session.date} TODAY&apos;S WOD
        </div>
        <div style={{ fontWeight: 700, fontSize: 68, marginTop: 14 }}>
          {wod.title}
        </div>
        <div style={{ fontWeight: 600, fontSize: 40, marginTop: 10 }}>
          {wod.summary}
        </div>
        {wod.sets.length > 0 ? (
          <div
            style={{
              marginTop: 40,
              paddingTop: 30,
              borderTop: "2px solid rgba(255,255,255,0.6)",
              width: 620,
            }}
          >
            {wod.sets.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  fontWeight: 600,
                  fontSize: wod.sets.length > 8 ? 38 : 46,
                  lineHeight: 1.55,
                }}
              >
                <span style={{ width: 70, opacity: 0.7 }}>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const Plain: React.FC<{ session: Session }> = ({ session }) => {
  const { cuts } = session;
  const at = (i: number) =>
    cuts.slice(0, i).reduce((n, c) => n + frames(c.seconds), 0);
  const wodLength = at(Math.min(session.wodCuts, cuts.length));
  const total = at(cuts.length);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {cuts.map((c, i) => (
        <Sequence
          key={i}
          from={at(i)}
          durationInFrames={frames(c.seconds)}
          premountFor={30}
        >
          <AbsoluteFill style={{ filter: `brightness(${c.brightness ?? 1})` }}>
            <Clip
              src={mediaPath(session, c)}
              startAt={c.start}
              zoom={c.zoom}
              centerX={c.centerX}
              centerY={c.centerY}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence durationInFrames={wodLength}>
        <Wod session={session} length={wodLength} />
      </Sequence>
      <Sequence from={wodLength} durationInFrames={total - wodLength}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1470,
            textAlign: "center",
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.8)",
            textShadow: SHADOW,
          }}
        >
          {GYM.handle}
        </div>
      </Sequence>
      <Sequence from={total} durationInFrames={PLAIN_END}>
        <AbsoluteFill
          style={{
            backgroundColor: "#0b0b0b",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: FONT.body,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 50, letterSpacing: 8 }}>
            {GYM.name}
          </div>
          <div
            style={{
              marginTop: 18,
              fontWeight: 600,
              fontSize: 36,
              opacity: 0.75,
            }}
          >
            {GYM.handle}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
