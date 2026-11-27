// Last opening frame, built from the home cover's first frame (Dana 27/11): in the small
// intro window the cover sits at the scale of her composition (opening frame 11), with room
// above and below it. That room used to be two flat colours, which read as a lighting jump
// when the window grew into the cover. Instead the cover's own background is continued up
// and down (edge rows stretched, then softened), so the window shows the video's real light.
//
// Usage: node scripts/intro-cover.mjs <cover poster in /public> → public/intro/ext.jpg
//   (+ its pad fraction printed; Intro reads it from src/content/media.json)

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [src] = process.argv.slice(2);
if (!src) {
  console.error("Usage: node scripts/intro-cover.mjs /work/<slug>/00.poster.<hash>.jpg");
  process.exit(1);
}
// Window 443x603; the cover is 1.2865x the window's width there (Intro.tsx COVER_START).
const COVER_START = (1260 * (373.6 / 826)) / 443;
const img = sharp(path.join("public", src));
const { width: w, height: h } = await img.metadata();
const coverHInWindow = (443 * COVER_START * h) / w;
const pad = Math.ceil((((603 - coverHInWindow) / 2) * w) / (443 * COVER_START)) + 8; // + a little spare

const raw = await img.removeAlpha().raw().toBuffer();
// Each padding row = the cover's edge row, blurred horizontally more the further out it is.
const rowOf = (y) => raw.subarray(y * w * 3, (y + 1) * w * 3);
const blurRow = (row, r) => {
  if (r < 1) return Buffer.from(row);
  const out = Buffer.alloc(row.length);
  for (let x = 0; x < w; x++)
    for (let c = 0; c < 3; c++) {
      let s = 0, n = 0;
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k += 2) (s += row[k * 3 + c]), n++;
      out[x * 3 + c] = Math.round(s / n);
    }
  return out;
};
// average a few edge rows so single-row noise doesn't streak
const edge = (ys) => {
  const out = Buffer.alloc(w * 3);
  for (let i = 0; i < out.length; i++) out[i] = Math.round(ys.reduce((s, y) => s + rowOf(y)[i], 0) / ys.length);
  return out;
};
const top = edge([0, 1, 2, 3]);
const bottom = edge([h - 1, h - 2, h - 3, h - 4]);
const H = h + pad * 2;
const out = Buffer.alloc(w * H * 3);
for (let i = 0; i < pad; i++) {
  const r = Math.round(((pad - i) / pad) * 60); // softer far from the cover
  blurRow(top, r).copy(out, i * w * 3);
  blurRow(bottom, r).copy(out, (H - 1 - i) * w * 3);
}
raw.copy(out, pad * w * 3);
const file = path.join("public", "intro", "ext.jpg");
await sharp(out, { raw: { width: w, height: H, channels: 3 } }).jpeg({ quality: 88, mozjpeg: true }).toFile(file);

const manifestPath = path.join("src", "content", "media.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest["/intro/ext.jpg"] = { w, h: H, pad, from: src.replace(/\.[0-9a-f]{8}\./, ".") };
await writeFile(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
console.log(`  ✓ ${file} ${w}x${H} (pad ${pad}px above and below the ${w}x${h} cover)`);
