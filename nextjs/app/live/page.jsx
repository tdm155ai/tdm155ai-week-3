import Link from "next/link";
import { listMedia } from "../../lib/media.mjs";
import AutoRefresh from "./AutoRefresh.jsx";

// Read _media/ on every request; the client component above refreshes it on a timer.
export const dynamic = "force-dynamic";

export const metadata = { title: "Live" };

function size(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1e3)) + " KB";
}

export default async function LivePage() {
  const { items, skipped } = await listMedia();
  const images = items.filter((item) => item.type === "image").length;
  const videos = items.length - images;

  return (
    <>
      <header className="site-header">
        <Link className="wordmark" href="/">tdm155ai <span>week 3</span></Link>
        <nav aria-label="Main navigation">
          <Link href="/docs">Docs</Link>
          <Link href="/glossary">Glossary</Link>
          <Link href="/live" aria-current="true">Live</Link>
        </nav>
      </header>
      <main id="main" className="live-main">
        <header className="page-heading live-heading">
          <p className="eyebrow">Week 03 / Live</p>
          <h1>What the room is making</h1>
          <p className="lede">Stills and clips from today's stations, newest first. {items.length ? `${images} image${images === 1 ? "" : "s"}${videos ? ` and ${videos} clip${videos === 1 ? "" : "s"}` : ""}.` : "Nothing yet."}</p>
          <AutoRefresh seconds={10} />
        </header>
        {skipped > 0 && <p className="live-note">{skipped} file{skipped === 1 ? "" : "s"} skipped: HEIC and RAW can't be shown in a browser. Export as JPEG or PNG (on iPhone: Settings → Camera → Formats → Most Compatible, or share via Files, which converts).</p>}
        {items.length === 0 ? (
          <section className="live-empty">
            <p className="eyebrow">Empty</p>
            <p>Drop images or clips into <code>_media/</code> at the root of this repo. They appear here within a few seconds; subfolders are fine.</p>
          </section>
        ) : (
          <ul className="live-grid">
            {items.map((item) => (
              <li className="live-item" key={item.src}>
                {item.type === "image"
                  ? <a href={item.src} target="_blank" rel="noreferrer"><img src={item.src} alt={item.name} loading="lazy" /></a>
                  : <video src={item.src} controls muted playsInline preload="metadata" />}
                <div className="live-caption"><span>{item.folder ? `${item.folder}/` : ""}{item.name}</span><span>{size(item.bytes)}</span></div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="site-footer"><Link href="/">TDM155AI · Week 3</Link><span>Tools of the AV trade</span></footer>
    </>
  );
}
