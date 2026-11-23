import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { Clip } from "./components/Clip";
import { FONT } from "./fonts";
import { frames, mediaPath, type Cut, type Session } from "./session";
import { GYM, REEL } from "./theme";

// 화려한 버전: 큰 글자 인트로(선 → 띠 → 화면 가득) → 컷마다 번쩍임·사선·당김·검정 끊기
//   → 마지막 컷은 네모 창 → 체육관 이름 카드.
// 종목 이름·형광색은 쓰지 않는다. 글씨는 흰색, 인트로와 끝에만.
// 컷은 1.2초(마지막 1.5초)를 넘으면 잘라 쓴다.

const GRADE = "saturate(0.85) contrast(1.14) brightness(0.92)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };

type Enter = NonNullable<Cut["enter"]>;
type Shot = Cut & { src: string; frames: number; echo: boolean };

const INTRO = 96;
const END = 50;
const GLOW = 6;
const SLASH = 6;
const BAND = 7;
const MAX_CUT = 36;
const MAX_LAST = 45;
const BOX_STEPS: readonly (readonly [number, number])[] = [
  [38, 40],
  [28, 30],
  [16, 18],
  [0, 0],
];
const AUTO: readonly Enter[] = ["black", "glow", "punch", "slash", "none"];

const shotsOf = (s: Session): Shot[] =>
  s.cuts.map((c, i) => {
    const last = i === s.cuts.length - 1;
    const enter: Enter =
      c.enter ??
      (i === 0 ? "none" : last ? "box" : AUTO[(i - 1) % AUTO.length]);
    return {
      ...c,
      src: mediaPath(s, c),
      frames: Math.min(frames(c.seconds), last ? MAX_LAST : MAX_CUT),
      enter,
      echo: !last && i % 5 === 2,
    };
  });

export const flashyFrames = (s: Session) =>
  INTRO + shotsOf(s).reduce((n, x) => n + x.frames, 0) + END;

const ShotClip: React.FC<{ shot: Shot; delay?: number }> = ({
  shot,
  delay = 0,
}) => (
  <AbsoluteFill
    style={{ filter: `${GRADE} brightness(${shot.brightness ?? 1})` }}
  >
    <Clip
      src={shot.src}
      startAt={Math.max(0, shot.start - delay / REEL.fps)}
      zoom={shot.zoom}
      centerX={shot.centerX}
      centerY={shot.centerY}
    />
  </AbsoluteFill>
);

const Body: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const punch = shot.enter === "punch";
  const s = punch ? interpolate(frame, [0, 9], [1.28, 1], out) : 1;
  const blur = punch ? interpolate(frame, [0, 7], [14, 0], clamp) : 0;
  const step = BOX_STEPS[Math.min(BOX_STEPS.length - 1, Math.floor(frame / 4))];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${s})`,
          filter: blur ? `blur(${blur}px)` : undefined,
          clipPath:
            shot.enter === "box"
              ? `inset(${step[0]}% ${step[1]}% ${step[0]}% ${step[1]}%)`
              : undefined,
        }}
      >
        <ShotClip shot={shot} />
        {shot.echo ? (
          <AbsoluteFill style={{ opacity: 0.38, mixBlendMode: "lighten" }}>
            <ShotClip shot={shot} delay={5} />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
      {shot.enter === "black" && frame < 2 ? (
        <AbsoluteFill style={{ backgroundColor: "#000" }} />
      ) : null}
    </AbsoluteFill>
  );
};

const Glow: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, GLOW, GLOW * 2], [0, 0.8, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        mixBlendMode: "screen",
        background:
          "radial-gradient(circle at 50% 45%, #fff 0%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0.35) 100%)",
      }}
    />
  );
};

const Slash: React.FC<{ next: Shot }> = ({ next }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, SLASH], [0.04, 1], out) * 70;
  return (
    <AbsoluteFill
      style={{
        clipPath: `polygon(${50 - w}% 100%, ${50 + w - 20}% 100%, ${50 + w + 20}% 0%, ${50 - w + 40}% 0%)`,
      }}
    >
      <ShotClip shot={next} />
    </AbsoluteFill>
  );
};

const Intro: React.FC<{ session: Session; shots: Shot[] }> = ({
  session,
  shots,
}) => {
  const frame = useCurrentFrame();
  const lineW = interpolate(frame, [4, 14], [0, 100], out);
  const open1 = interpolate(frame, [14, 30], [6, 560], out);
  const open2 = interpolate(frame, [78, INTRO], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const h = open1 + open2 * (REEL.height - open1);
  const inset = (REEL.height - h) / 2;
  const side = (100 - lineW) / 2;
  const textO = interpolate(frame, [14, 20], [0, 1], clamp) * (1 - open2);
  const stretch = interpolate(frame, [14, 30], [0.2, 1.5], out);
  const subO =
    interpolate(frame, [30, 38], [0, 1], clamp) *
    interpolate(frame, [74, 80], [1, 0], clamp);
  // 띠 안에서 7프레임마다 다른 컷을 보여 준다. 마지막은 첫 컷으로 이어진다
  const count = Math.floor((INTRO - 4) / BAND);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{ clipPath: `inset(${inset}px ${side}% ${inset}px ${side}%)` }}
      >
        {Array.from({ length: count }, (_, i) => {
          const last = i === count - 1;
          const shot = last ? shots[0] : shots[(i * 7 + 3) % shots.length];
          const at = 4 + i * BAND;
          return (
            <Sequence
              key={i}
              from={at}
              durationInFrames={last ? INTRO - at : BAND}
            >
              <ShotClip
                shot={{ ...shot, start: shot.start + (last ? 0 : 0.3) }}
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          mixBlendMode: "difference",
          opacity: textO,
        }}
      >
        <div
          style={{
            fontFamily: FONT.title,
            fontSize: 400,
            lineHeight: 1,
            letterSpacing: 6,
            color: "#fff",
            transform: `scale(${1 + open2 * 2.2}, ${stretch + open2 * 3})`,
          }}
        >
          {GYM.short}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1290,
          textAlign: "center",
          color: "#fff",
          opacity: subO,
        }}
      >
        <div
          style={{
            fontFamily: FONT.title,
            fontSize: 56,
            letterSpacing: 9,
            textTransform: "uppercase",
          }}
        >
          {session.wod.title}
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 34,
            opacity: 0.85,
          }}
        >
          {session.date} · {session.wod.summary}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [2, 14], [0, 760], out);
  const o = interpolate(frame, [8, 16], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          fontFamily: FONT.title,
          fontSize: 104,
          letterSpacing: 6,
          opacity: o,
          transform: `translateY(${(1 - o) * 20}px)`,
        }}
      >
        {GYM.name}
      </div>
      <div
        style={{
          width: w,
          height: 5,
          backgroundColor: "#fff",
          margin: "18px 0",
        }}
      />
      <div
        style={{
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 38,
          opacity: o * 0.8,
        }}
      >
        {GYM.handle}
      </div>
    </AbsoluteFill>
  );
};

export const Flashy: React.FC<{ session: Session }> = ({ session }) => {
  const shots = shotsOf(session);
  const at = (i: number) =>
    INTRO + shots.slice(0, i).reduce((n, x) => n + x.frames, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={INTRO}>
        <Intro session={session} shots={shots} />
      </Sequence>
      {shots.map((s, i) => (
        <Sequence
          key={i}
          from={at(i)}
          durationInFrames={s.frames}
          premountFor={30}
        >
          <Body shot={s} />
        </Sequence>
      ))}
      {shots.map((s, i) =>
        s.enter === "glow" ? (
          <Sequence key={i} from={at(i) - GLOW} durationInFrames={GLOW * 2}>
            <Glow />
          </Sequence>
        ) : s.enter === "slash" ? (
          <Sequence key={i} from={at(i) - SLASH} durationInFrames={SLASH}>
            <Slash next={s} />
          </Sequence>
        ) : null,
      )}
      <Sequence from={at(shots.length)} durationInFrames={END}>
        <End />
      </Sequence>
    </AbsoluteFill>
  );
};
