---
title: "Sharing to /live"
description: "How the live wall works today, and how to get your stills and clips onto it."
updated: 2026-09-23
---

# Sharing to /live

The [live page](/live) is a gallery of whatever is in the `_media/` folder at the root of this repo, newest first. It re-checks the folder every ten seconds, so a file you drop in shows up on the wall without anyone reloading.

## Today

The wall runs on the classroom machine. Get your file into its `_media/` folder:

1. **AirDrop** to the classroom Mac. Files land in Downloads; a helper moves them into `_media/`, or you do it yourself if you're at that machine.
2. Or **drop it in the class Slack channel**; we'll pull it over.

Name files so they say what they are: `station-5-key-only.jpg`, `gimbal-vs-handheld.mov`. Subfolders are fine (`_media/ana/`, `_media/station-6/`); the folder name shows in the caption.

Formats that display: JPEG, PNG, WebP, GIF, MP4, MOV, WebM. **HEIC does not** (the default iPhone photo format), and the wall will count it as skipped. Either set Settings → Camera → Formats → Most Compatible before you shoot, or share via the Files app / AirDrop with "Most Compatible" chosen, which converts on the way out.

## Running it yourself

Clone the repo, then:

```sh
cd nextjs
pnpm install
pnpm dev
```

Open the localhost address it prints. `_media/` is gitignored, so your wall shows your files and nobody else's; the app works with the folder empty.

## Later

Populating `_media/` from a shared source (a Slack channel, a Drive folder, a phone upload page) is the next step and not built yet. The gallery reads the folder; whatever fills the folder can change without touching the page.
