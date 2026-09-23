import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { contentType, resolveMedia } from "../../../lib/media.mjs";

export const dynamic = "force-dynamic";

// Serves files out of _media/ at the repo root, with Range support so video scrubs and plays in Safari.
export async function GET(request, { params }) {
  const { path: segments = [] } = await params;
  const file = resolveMedia(segments);
  const type = file && contentType(file);
  if (!file || !type) return new Response("Not found", { status: 404 });

  let info;
  try { info = await stat(file); } catch { return new Response("Not found", { status: 404 }); }
  if (!info.isFile()) return new Response("Not found", { status: 404 });

  const headers = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" };
  const range = request.headers.get("range");
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (match) {
    const start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
    if (start >= info.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
    headers["Content-Length"] = String(end - start + 1);
    return new Response(Readable.toWeb(createReadStream(file, { start, end })), { status: 206, headers });
  }
  headers["Content-Length"] = String(info.size);
  return new Response(Readable.toWeb(createReadStream(file)), { status: 200, headers });
}
