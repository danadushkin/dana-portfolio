// Give every image / video / poster in public/work and public/intro a content-hashed
// file name (10.webp → 10.a1b2c3d4.webp) and record canonical → hashed paths in
// src/content/assets.json. When a picture changes, its URL changes too, so no browser
// or CDN cache can keep showing the old one (that happened with Montora 10.webp, whose
// content changed when Dana reordered the project).
//
// Idempotent: already-hashed files whose hash still matches are left alone.
// Runs automatically before `npm run build` and at the end of the Figma export scripts.

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["public/work", "public/intro"];
// "10.webp", "03.poster.jpg", "02.mp4" — optionally already carrying a hash
// "ext.jpg" = the intro's last frame built from the home cover (scripts/intro-cover.mjs)
const NAME = /^(\d\d(?:\.poster)?|ext)(?:\.([0-9a-f]{8}))?\.(webp|jpg|png|mp4)$/;

const out = {};
let renamed = 0;

async function dirs(root) {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const subs = entries.filter((e) => e.isDirectory()).map((e) => path.join(root, e.name));
  return [root, ...subs];
}

for (const root of ROOTS) {
  for (const dir of await dirs(root)) {
    const files = (await readdir(dir)).filter((f) => NAME.test(f));
    // newest content wins if both "10.webp" and an old "10.<hash>.webp" exist
    files.sort((a, b) => Number(Boolean(NAME.exec(a)[2])) - Number(Boolean(NAME.exec(b)[2])));
    const seen = new Set();
    for (const f of files) {
      const [, base, oldHash, ext] = NAME.exec(f);
      const key = `${base}.${ext}`;
      const full = path.join(dir, f);
      if (seen.has(key)) {
        await rm(full); // stale hashed copy superseded by a fresh export
        continue;
      }
      seen.add(key);
      const hash = createHash("sha1").update(await readFile(full)).digest("hex").slice(0, 8);
      const target = `${base}.${hash}.${ext}`;
      if (oldHash !== hash) {
        await rename(full, path.join(dir, target));
        renamed++;
      }
      const url = (p) => "/" + path.relative("public", path.join(dir, p)).split(path.sep).join("/");
      out[url(key)] = url(target);
    }
  }
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
await writeFile("src/content/assets.json", JSON.stringify(sorted, null, 2) + "\n");
console.log(`hash-assets: ${Object.keys(sorted).length} files, ${renamed} renamed`);
