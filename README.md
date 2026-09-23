# tdm155ai-week-3

TDM 155AI, week 3 (class of 2026-09-23): tools of the AV trade. Cameras, lenses, light, sound, recording formats, and a live wall of what the room makes.

**Start with the [checklist](_context/docs/00-checklist.md).** Four stations, each with a thing to do, a thing to notice, and a thing to share. The [glossary](_context/glossary/README.md) has one short entry per term the checklist uses.

The Next.js app in [`nextjs/`](nextjs/) renders both, and a `/live` gallery of everything in `_media/`:

| URL | What |
| --- | --- |
| `/docs` | The checklist, the recording-formats reference, the desk video kit handout, how to share to the wall |
| `/glossary` | The glossary, one page per term |
| `/capture` | A camera feed (the Web Presenter's USB-C webcam output, or any camera the browser sees) and a Capture button. Saves stills to `_media/<station>/`, and to a NAS folder and a Slack channel when `nextjs/.env.local` sets them up (see `nextjs/.env.example`). Open it as `/capture?station=lights` or `?station=obscura`. |
| `/live` | Stills and clips from `_media/`, newest first, re-checked every ten seconds |
| `/live/nas` | **Experimental.** The same wall read from the NAS folder, so it shows every studio machine's captures. Says "not connected" if the share isn't mounted. |

## Run it

```sh
cd nextjs
pnpm install
pnpm dev
```

Open the localhost address it prints. Markdown under `_context/` is read on each request, so edits show on refresh; nothing needs registering.

## Studio capture setup

Each studio machine runs its own copy of the app, with a Blackmagic Web Presenter plugged in by USB-C. The Web Presenter's USB output is a standard webcam, so Chrome sees it with no driver, and `/capture` picks it automatically (it names itself "Blackmagic Design").

1. In `nextjs/`: `pnpm install`, then `cp .env.example .env.local` and fill in what this machine uses (below). Everything in it is optional.
2. `pnpm dev`, then open `http://localhost:<port>/capture?station=lights` (or `?station=obscura`) in Chrome and allow the camera. It has to be `localhost` on the machine with the Web Presenter: browsers only open cameras on a secure origin, and another machine's IP over plain http isn't one.
3. Press **Capture** or the space bar. Each still is saved to `_media/<station>/` on this machine first, then copied to the NAS and posted to Slack if those are set up. Uploads run in the background, so presses never wait on the network.

**Nothing here depends on the NAS or Slack.** The local save always happens first. If the share isn't mounted, or Slack is slow or refuses, that capture's status says so (NAS calls give up after 8 seconds, Slack after 30) and the still is still on this machine's `/live`. Restart `pnpm dev` after editing `.env.local`; it is read at startup.

### Connecting the NAS

The app writes to the NAS as a mounted folder, not over the network itself.

1. In Finder, press ⌘K (Go → Connect to Server) and enter `smb://<NAS IP>`. Choose **Registered User**, enter a NAS account, tick **Remember this password in my keychain**, and pick the share. It mounts at `/Volumes/<share name>`; `ls /Volumes` to check.
2. Once, from any machine, make the folder: `mkdir "/Volumes/<share name>/tdm155ai-week-3"`.
3. In `nextjs/.env.local`: `CAPTURE_NAS_DIR="/Volumes/<share name>/tdm155ai-week-3"` (keep the quotes if the name has spaces). `NAS_IP` is only a note for whoever sets up the machine.
4. Restart `pnpm dev`. The capture status should read **NAS ✓**, a `lights/` or `obscura/` folder appears on the share, and `/live/nas` shows every machine's captures.

If Connect to Server fails, the Mac is probably on a different network from the NAS. If captures say "NAS folder not found (is the share mounted?)", the share dropped (sleep and restarts do that): reconnect with ⌘K, or drag the mounted share into System Settings → General → Login Items so it remounts at login. If the share shows up as `/Volumes/<share>-1`, it was mounted twice: eject both, reconnect, and check the path.

### Connecting Slack

Captures go to one channel, with the station and machine name as the message. Two ways to set it up in `nextjs/.env.local`:

- **Upload as you, with public links (what we use):** `SLACK_USER_TOKEN` (an `xoxp-` token; user token scopes `files:write`, `files:read`, `chat:write`) and `SLACK_CHANNEL_ID` (the `C…` ID; in Slack, channel name → About → the ID at the bottom). Each capture is posted as that user, made public, and a thread reply carries a Markdown embed line (`![name](https://files.slack.com/files-pri/…?pub_secret=…)`); the capture page shows a **Copy MD** button for it too. Slack only lets the person who uploaded a file make its public link, which is why this needs a user token. The workspace setting "Allow file sharing via public links" has to be on.
- **Upload as a bot, no public links:** `SLACK_BOT_TOKEN` (an `xoxb-` token with `files:write`) and `SLACK_CHANNEL_ID`, and invite the bot to the channel (`/invite @<bot name>`).

If both tokens are set, the user token is used. The capture page's Slack checkbox turns posting off for that machine without touching the file.

## Folders

- `_context/docs/` and `_context/glossary/`: the Markdown the site renders.
- `_media/`: **gitignored, local only.** Drop images (JPEG, PNG, WebP, GIF) and clips (MP4, MOV, WebM) here and they appear on `/live`. Subfolders are fine. HEIC and RAW are counted but not shown; export as JPEG. The app works with the folder empty, so your copy shows your files and nobody else's.
- `nextjs/`: the app. Dark only. Files are served from `_media/` by a route handler, not from `public/`, so the folder can live outside the app and be swapped for another source later.

## Later

`/live/nas` is the first try at one wall for every machine. Pulling phone shots in from the Slack channel is not built yet.
