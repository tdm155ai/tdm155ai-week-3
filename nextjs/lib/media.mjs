import { readdir, stat } from "node:fs/promises";
import path from "node:path";

// The live gallery reads from `_media/` at the repo root (gitignored). Anyone can run the app with an
// empty or different folder; the page just shows whatever is there right now.
export const mediaRoot = path.resolve(process.cwd(), "..", "_media");

export const imageTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif", ".svg": "image/svg+xml" };
export const videoTypes = { ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".m4v": "video/x-m4v" };
// Shot on an iPhone by default; browsers cannot show these, so the gallery counts them and asks for a conversion.
export const unsupportedTypes = new Set([".heic", ".heif", ".hevc", ".dng", ".raw", ".cr2", ".arw"]);

export function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return imageTypes[ext] || videoTypes[ext] || null;
}

// Resolve a URL path inside _media/, refusing anything that escapes it.
export function resolveMedia(segments) {
  const target = path.resolve(mediaRoot, ...segments.map(decodeURIComponent));
  if (target !== mediaRoot && !target.startsWith(mediaRoot + path.sep)) return null;
  return target;
}

// Every image and video under _media/, any depth, newest first.
export async function listMedia() {
  const items = [];
  let skipped = 0;
  async function visit(directory, segments) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === "ENOENT") return; throw error; }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) { await visit(full, [...segments, entry.name]); continue; }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (unsupportedTypes.has(ext)) { skipped += 1; continue; }
      const type = imageTypes[ext] ? "image" : videoTypes[ext] ? "video" : null;
      if (!type) continue;
      const info = await stat(full);
      items.push({
        name: entry.name,
        folder: segments.join("/"),
        type,
        src: "/media/" + [...segments, entry.name].map(encodeURIComponent).join("/"),
        bytes: info.size,
        modified: info.mtimeMs,
      });
    }
  }
  await visit(mediaRoot, []);
  items.sort((a, b) => b.modified - a.modified);
  return { items, skipped };
}
