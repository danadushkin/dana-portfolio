// Export frames from Figma into public/work/<slug>/.
//
// Setup: create .env.local with
//   FIGMA_TOKEN=figd_...        (Figma → Settings → Security → Personal access tokens, "File content: read-only")
//   FIGMA_FILE_KEY=xxxxxxxx     (the part after /design/ in the file URL)
//
// Usage:
//   node scripts/figma-export.mjs list
//       → prints every page and its top-level frames with their node ids
//   node scripts/figma-export.mjs export <slug> <nodeId> [<nodeId> ...] [--scale=2] [--format=png|jpg]
//       → replaces public/work/<slug>/ with those frames as 01.jpg, 02.jpg, ... (in the order given)
//         --clip renders exactly the frame bounds (for frames whose content spills outside)
//         JPEG on purpose: when a screen asks for more pixels than the source has, the image
//         optimiser serves the source file untouched — it must be a format every browser reads
//         (WebP sources broke on older Macs).
//         and records each one's pixel size in src/content/media.json

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* fall back to real env vars */
}

const { FIGMA_TOKEN, FIGMA_FILE_KEY } = process.env;
if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error("Missing FIGMA_TOKEN or FIGMA_FILE_KEY (put them in .env.local).");
  process.exit(1);
}

const api = async (url) => {
  const res = await fetch(`https://api.figma.com/v1${url}`, {
    headers: { "X-Figma-Token": FIGMA_TOKEN },
  });
  if (!res.ok) throw new Error(`Figma ${res.status}: ${await res.text()}`);
  return res.json();
};

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "list") {
  const file = await api(`/files/${FIGMA_FILE_KEY}?depth=2`);
  console.log(`File: ${file.name}\n`);
  for (const page of file.document.children) {
    console.log(`# ${page.name}`);
    for (const node of page.children ?? []) {
      console.log(`  ${node.id.padEnd(12)} ${node.type.padEnd(10)} ${node.name}`);
    }
    console.log();
  }
} else if (cmd === "export") {
  const flags = Object.fromEntries(
    rest.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")),
  );
  const [slug, ...ids] = rest.filter((a) => !a.startsWith("--"));
  if (!slug || ids.length === 0) {
    console.error("Usage: export <slug> <nodeId> [<nodeId> ...]");
    process.exit(1);
  }
  const format = flags.format ?? "png";
  const scale = flags.scale ?? "2";
  // One render request per node: heavy frames can take 1-2 minutes each at Figma, and a
  // single batched request then outlives fetch's 5-minute header timeout.
  const images = {};
  for (const id of ids) {
    const r = await api(
      `/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(id)}&format=${format}&scale=${scale}${flags.clip ? "&use_absolute_bounds=true" : ""}`,
    );
    if (r.err) throw new Error(r.err);
    images[id] = r.images[id];
  }

  const dir = path.join("public", "work", slug);
  await mkdir(dir, { recursive: true });
  // Replace the old images only (NN.webp / NN.jpg, hashed or not); posters (NN.poster.*)
  // and videos (.mp4) in the same folder are kept.
  for (const f of await readdir(dir)) if (/^\d\d(\.[0-9a-f]{8})?\.(webp|jpg)$/.test(f)) await rm(path.join(dir, f));

  // Every image is re-encoded to WebP; its size goes into src/content/media.json
  // so the page can lay images out at the right aspect ratio before they load.
  const manifestPath = path.join("src", "content", "media.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
  for (const key of Object.keys(manifest)) {
    if (key.startsWith(`/work/${slug}/`)) delete manifest[key];
  }

  for (const [i, id] of ids.entries()) {
    const url = images[id];
    if (!url) {
      console.warn(`  ! no image for ${id}`);
      continue;
    }
    const raw = Buffer.from(await (await fetch(url)).arrayBuffer());
    const name = `${String(i + 1).padStart(2, "0")}.jpg`;
    const { data, info } = await sharp(raw).flatten({ background: "#ffffff" }).jpeg({ quality: 88, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    await writeFile(path.join(dir, name), data);
    manifest[`/work/${slug}/${name}`] = { w: info.width, h: info.height, figma: id };
    console.log(`  ✓ ${id} → /work/${slug}/${name} ${info.width}x${info.height} (${Math.round(data.length / 1024)} KB)`);
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, JSON.stringify(sorted, null, 2) + "\n");
} else {
  console.log("Commands: list | export <slug> <nodeId...>");
}

// Publish under content-hashed names so changed pictures never come back from a cache.
await import("./hash-assets.mjs");
