// Export Dana's "opening frames" (intro) from Figma: each frame is a 1920x1080 artboard
// with the visible window at the same spot, so we render the frame and crop that window.
//
// Usage: node scripts/figma-opening.mjs <frameId> [<frameId> ...]
//   → public/intro/01.jpg, 02.jpg, ... and their sizes in src/content/media.json

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

try {
  process.loadEnvFile(".env.local");
} catch {}
const { FIGMA_TOKEN, FIGMA_FILE_KEY } = process.env;
const ids = process.argv.slice(2);
if (!FIGMA_TOKEN || !FIGMA_FILE_KEY || ids.length === 0) {
  console.error("Usage: node scripts/figma-opening.mjs <frameId...>  (needs FIGMA_TOKEN / FIGMA_FILE_KEY)");
  process.exit(1);
}

const SCALE = 3;
const WINDOW = { left: 739, top: 238, width: 443, height: 603 }; // in frame px, from the Figma file

const res = await fetch(
  `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(ids.join(","))}&format=png&scale=${SCALE}`,
  { headers: { "X-Figma-Token": FIGMA_TOKEN } },
);
const { images, err } = await res.json();
if (err) throw new Error(err);

const dir = path.join("public", "intro");
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });
const manifestPath = path.join("src", "content", "media.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
for (const k of Object.keys(manifest)) if (k.startsWith("/intro/")) delete manifest[k];

for (const [i, id] of ids.entries()) {
  const raw = Buffer.from(await (await fetch(images[id])).arrayBuffer());
  const crop = Object.fromEntries(Object.entries(WINDOW).map(([k, v]) => [k, Math.round(v * SCALE)]));
  const { data, info } = await sharp(raw).extract(crop).flatten({ background: "#ffffff" }).jpeg({ quality: 88, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const name = `${String(i + 1).padStart(2, "0")}.jpg`;
  await writeFile(path.join(dir, name), data);
  manifest[`/intro/${name}`] = { w: info.width, h: info.height, figma: id };
  console.log(`  ✓ ${id} → /intro/${name} ${info.width}x${info.height} (${Math.round(data.length / 1024)} KB)`);
}
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(manifestPath, JSON.stringify(sorted, null, 2) + "\n");

// Publish under content-hashed names so changed pictures never come back from a cache.
await import("./hash-assets.mjs");
