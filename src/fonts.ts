import { loadFont as loadLocalFont } from "@remotion/fonts";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { staticFile } from "remotion";

// 본문: Pretendard (public/fonts). 화려한 버전 큰 글자: Anton.
loadLocalFont({
  family: "Pretendard",
  url: staticFile("fonts/Pretendard-SemiBold.woff2"),
  weight: "600",
});
loadLocalFont({
  family: "Pretendard",
  url: staticFile("fonts/Pretendard-Bold.woff2"),
  weight: "700",
});
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });

export const FONT = {
  body: `Pretendard, "Apple SD Gothic Neo", sans-serif`,
  title: anton.fontFamily,
} as const;
