// Export Dana's favicon frame from Figma into the files Next.js picks up automatically:
//   src/app/icon.png (512), src/app/apple-icon.png (180), src/app/favicon.ico (16+32, PNG-in-ICO)
// Usage: node scripts/figma-favicon.mjs <frameId>   (needs FIGMA_TOKEN / FIGMA_FILE_KEY)

import { writeFile } from "node:fs/promises";
import sharp from "sharp";

try {
  process.loadEnvFile(".env.local");
} catch {}
const { FIGMA_TOKEN, FIGMA_FILE_KEY } = process.env;
const [id] = process.argv.slice(2);
if (!FIGMA_TOKEN || !FIGMA_FILE_KEY || !id) {
  console.error("Usage: node scripts/figma-favicon.mjs <frameId>");
  process.exit(1);
}

// Vector export, rasterised here at each size (Figma caps PNG exports at 4×).
const res = await fetch(`https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(id)}&format=svg`, {
  headers: { "X-Figma-Token": FIGMA_TOKEN },
});
const { images, err } = await res.json();
if (err) throw new Error(err);
const svg = Buffer.from(await (await fetch(images[id])).arrayBuffer());
const png = (size) => sharp(svg, { density: Math.ceil((72 * size) / 100) }).resize(size, size).png().toBuffer();

await writeFile("src/app/icon.png", await png(512));
await writeFile("src/app/apple-icon.png", await png(180));

// Minimal ICO container holding PNG images (supported by every current browser).
const entries = await Promise.all([16, 32].map(async (s) => ({ s, data: await png(s) })));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = 6 + 16 * entries.length;
const dir = entries.map(({ s, data }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]));
console.log("favicon: icon.png 512, apple-icon.png 180, favicon.ico 16+32");
