import { captureConfig, captureFilename, postSlack, publicConfig, saveLocal, saveNas, slackToken, stations, withTimeout } from "../../../lib/capture.mjs";

export const dynamic = "force-dynamic";

const maxBytes = 25 * 1024 * 1024;

// The capture page asks which targets are configured on this machine.
export async function GET() {
  return Response.json(publicConfig());
}

// Body: multipart form with `image` (a JPEG from the page's canvas), `station`, and `slack` / `nas` ("1" to send there).
export async function POST(request) {
  let form;
  try { form = await request.formData(); } catch { return Response.json({ error: "Expected a multipart form." }, { status: 400 }); }

  const image = form.get("image");
  const station = String(form.get("station") || "other");
  if (!Object.hasOwn(stations, station)) return Response.json({ error: `Unknown station "${station}".` }, { status: 400 });
  if (!image || typeof image.arrayBuffer !== "function") return Response.json({ error: "No image in the request." }, { status: 400 });
  if (image.size > maxBytes) return Response.json({ error: "Image is too large." }, { status: 413 });

  const bytes = Buffer.from(await image.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return Response.json({ error: "Only JPEG captures are accepted." }, { status: 415 });

  const config = captureConfig();
  const filename = captureFilename(station, config.machine);

  let src;
  try { src = await saveLocal(bytes, station, filename); } catch (error) { return Response.json({ error: `Could not save locally: ${error.message}` }, { status: 500 }); }

  const result = { filename, src, local: "saved" };
  const tasks = [];
  if (form.get("nas") === "1" && config.nasDir) {
    tasks.push(withTimeout(saveNas(bytes, station, filename, config.nasDir), 8000, "NAS").then(() => { result.nas = "saved"; }, (error) => { result.nas = `failed: ${error.code === "ENOENT" ? "NAS folder not found (is the share mounted?)" : error.message}`; }));
  }
  if (form.get("slack") === "1" && slackToken(config) && config.slackChannel) {
    const comment = `${stations[station]} · ${config.machine}`;
    const post = postSlack(bytes, filename, { token: slackToken(config), channel: config.slackChannel, comment, publicLink: Boolean(config.slackUserToken) });
    tasks.push(withTimeout(post, 30000, "Slack").then(({ url, markdown }) => { result.slack = "posted"; if (url) Object.assign(result, { url, markdown }); }, (error) => { result.slack = `failed: ${error.message}`; }));
  }
  await Promise.all(tasks);
  return Response.json(result);
}
