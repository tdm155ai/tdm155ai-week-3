# tdm155ai-week-3

TDM 155AI, week 3 (class of 2026-09-23): tools of the AV trade. Cameras, lenses, light, sound, recording formats, and a live wall of what the room makes.

**Start with the [checklist](_context/docs/00-checklist.md).** Ten stations, each with a thing to do, a thing to notice, and a thing to share. The [glossary](_context/glossary/README.md) has one short entry per term the checklist uses.

The Next.js app in [`nextjs/`](nextjs/) renders both, and a `/live` gallery of everything in `_media/`:

| URL | What |
| --- | --- |
| `/docs` | The checklist, the recording-formats reference, the desk video kit handout, how to share to the wall |
| `/glossary` | The glossary, one page per term |
| `/live` | Stills and clips from `_media/`, newest first, re-checked every ten seconds |

## Run it

```sh
cd nextjs
pnpm install
pnpm dev
```

Open the localhost address it prints. Markdown under `_context/` is read on each request, so edits show on refresh; nothing needs registering.

## Folders

- `_context/docs/` and `_context/glossary/`: the Markdown the site renders.
- `_media/`: **gitignored, local only.** Drop images (JPEG, PNG, WebP, GIF) and clips (MP4, MOV, WebM) here and they appear on `/live`. Subfolders are fine. HEIC and RAW are counted but not shown; export as JPEG. The app works with the folder empty, so your copy shows your files and nobody else's.
- `nextjs/`: the app. Dark only. Files are served from `_media/` by a route handler, not from `public/`, so the folder can live outside the app and be swapped for another source later.

## Later

Filling `_media/` from a shared source (a Slack channel, a Drive folder, an upload page) is the next step and not built yet.
