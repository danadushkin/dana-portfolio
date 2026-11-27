import path from "node:path";
import sharp from "sharp";
import { HomeIndex, type IntroConfig } from "@/components/HomeIndex";
import { ContactBlock } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import media from "@/content/media.json";
import { asset } from "@/content/assets";
import { coverOf, homeCoverOf, projects, realProjects } from "@/content/projects";

// Average colour of a few pixel rows at the top / bottom edge of an image in /public.
// Runs at build time only (this page is static).
async function edgeColors(src: string) {
  const { data, info } = await sharp(path.join(process.cwd(), "public", src)).raw().toBuffer({ resolveWithObject: true });
  const avg = (y0: number, rows: number) => {
    const sum = [0, 0, 0];
    for (let y = y0; y < y0 + rows; y++)
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * info.channels;
        for (let c = 0; c < 3; c++) sum[c] += data[i + c];
      }
    const n = rows * info.width;
    return `rgb(${sum.map((s) => Math.round(s / n)).join(" ")})`;
  };
  return { top: avg(0, 4), bottom: avg(info.height - 4, 4) };
}

// Intro = Dana's "opening frames" (public/intro, from scripts/figma-opening.mjs).
// The LAST frame (Dana's "opening frame 11", was 8) is the Harmony cover in a narrow window: it is
// rebuilt from the real cover and grows into it; the other frames play before it, in order.
async function intro(): Promise<IntroConfig> {
  const others = Object.keys(media).filter((k) => k.startsWith("/intro/")).sort().slice(0, -1);
  const cover = coverOf(realProjects[0])!;
  // Dana 27/11: with a cover clip (Harmony), the intro ends on the clip's first frame (opening
  // frame 11), which the home preview then plays from.
  const still = homeCoverOf(realProjects[0])?.poster ?? cover.src;
  return { frames: others.map(asset), cover: still, coverRatio: cover.w / cover.h, coverEdges: await edgeColors(still) };
}

export default async function Home() {
  return (
    <Shell>
      <HomeIndex projects={projects} intro={await intro()} contact={<ContactBlock />} />
    </Shell>
  );
}
