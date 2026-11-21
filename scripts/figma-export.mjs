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
//       → downloads those frames to public/work/<slug>/01.png, 02.png, ...

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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
  const { images, err } = await api(
    `/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(ids.join(","))}&format=${format}&scale=${scale}`,
  );
  if (err) throw new Error(err);

  const dir = path.join("public", "work", slug);
  await mkdir(dir, { recursive: true });
  for (const [i, id] of ids.entries()) {
    const url = images[id];
    if (!url) {
      console.warn(`  ! no image for ${id}`);
      continue;
    }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const name = `${String(i + 1).padStart(2, "0")}.${format}`;
    await writeFile(path.join(dir, name), buf);
    console.log(`  ✓ ${id} → /work/${slug}/${name} (${Math.round(buf.length / 1024)} KB)`);
  }
} else {
  console.log("Commands: list | export <slug> <nodeId...>");
}
