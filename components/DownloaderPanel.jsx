"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  FileAudio,
  FileDown,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Play,
  Video
} from "lucide-react";

const platforms = [
  "TikTok", "Instagram", "YouTube", "Facebook", "Spotify", 
  "SoundCloud", "Twitter", "Reddit", "Pinterest", "CapCut", 
  "Vimeo", "Bilibili", "Dailymotion", "Bandcamp", "Mixcloud", "Zingmp3"
];

const audioNoPreview = ["mp3", "opus"];

function collectLinks(value, out = new Set()) {
  if (!value) return Array.from(out);
  if (typeof value === "string" && /^https?:\/\//i.test(value)) {
    out.add(value);
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectLinks(item, out));
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    Object.values(value).forEach((item) => collectLinks(item, out));
  }
  return Array.from(out);
}

function getUrlExt(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const clean = path.split("?")[0].split("#")[0];
    const ext = clean.includes(".") ? clean.split(".").pop() : "";
    return ext.replace(/[^a-z0-9]/g, "");
  } catch {
    return "";
  }
}

function detectMediaType(url) {
  const ext = getUrlExt(url);
  const videoExt = ["mp4", "webm", "mov", "m4v", "mkv", "avi", "3gp"];
  const imageExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
  const audioExt = ["mp3", "opus", "ogg", "wav", "m4a", "aac", "flac"];

  if (videoExt.includes(ext)) return "video";
  if (imageExt.includes(ext)) return "image";
  if (audioExt.includes(ext)) return "audio";

  const lower = url.toLowerCase();
  if (lower.includes(".mp4") || lower.includes(".webm")) return "video";
  if (lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".png") || lower.includes(".webp")) return "image";
  if (lower.includes(".mp3") || lower.includes(".opus")) return "audio";

  return "unknown";
}

function getFileLabel(url, index) {
  const ext = getUrlExt(url);
  const type = detectMediaType(url);
  if (ext) return `${type}-${index + 1}.${ext}`;
  return `${type}-${index + 1}`;
}

function getIcon(type) {
  if (type === "video") return <Video size={18} />;
  if (type === "image") return <ImageIcon size={18} />;
  if (type === "audio") return <FileAudio size={18} />;
  return <FileDown size={18} />;
}

function MediaPreview({ url, type, ext }) {
  if (type === "video") {
    return (
      <video className="aio-media-preview" src={url} controls preload="metadata" playsInline />
    );
  }
  if (type === "image") {
    return (
      <img className="aio-media-preview" src={url} alt="Detected media" loading="lazy" />
    );
  }
  if (type === "audio") {
    if (audioNoPreview.includes(ext)) {
      return (
        <div className="aio-no-preview">
          <FileAudio size={34} />
          <strong>{ext.toUpperCase()} Audio</strong>
          <span>Preview disembunyikan agar bersih.</span>
        </div>
      );
    }
    return (
      <div className="aio-audio-preview">
        <FileAudio size={30} />
        <audio src={url} controls preload="metadata" />
      </div>
    );
  }
  return (
    <div className="aio-no-preview">
      <FileDown size={34} />
      <strong>Unknown Media</strong>
      <span>File bisa langsung dicoba download.</span>
    </div>
  );
}

// === KOMPONEN BARU UNTUK MEDIA CARD (Agar bisa Custom Name) ===
function MediaCardItem({ item }) {
  const [customName, setCustomName] = useState(item.label);

  // Endpoint `/api/proxy-download` kamu sudah memiliki logic inferFilename jika tidak ada extensinya
  const downloadUrl = `/api/proxy-download?url=${encodeURIComponent(
    item.url
  )}&name=${encodeURIComponent(customName || item.label)}`;

  function shortLink(link) {
    try {
      const u = new URL(link);
      return `${u.hostname}${u.pathname}`.slice(0, 36) + '...';
    } catch {
      return link.slice(0, 36) + '...';
    }
  }

  return (
    <article className="aio-media-card">
      <div className="aio-card-top">
        <span>
          {getIcon(item.type)}
          {item.type}
        </span>
        <small>{item.ext || "file"}</small>
      </div>

      <MediaPreview url={item.url} type={item.type} ext={item.ext} />

      <div className="aio-card-info">
        {/* Input rapih untuk Custom Filename */}
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Ketik nama file kustom..."
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#1f1f1f',
            border: '1px solid #333',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '700',
            outline: 'none',
            marginBottom: '6px'
          }}
        />
        <span style={{ fontSize: '11px', opacity: 0.5 }} title={item.url}>
          {shortLink(item.url)}
        </span>
      </div>

      <a className="aio-download-btn" href={downloadUrl} download>
        <Download size={17} />
        Download This
      </a>
    </article>
  );
}

export default function DownloaderPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const links = useMemo(() => {
    if (!result?.Result) return [];

    return collectLinks(result.Result)
      .map((link, index) => {
        const ext = getUrlExt(link);
        const type = detectMediaType(link);

        return {
          id: `${link}-${index}`,
          url: link,
          ext,
          type,
          label: getFileLabel(link, index),
        };
      })
      .filter((item) => item.url)
      .slice(0, 24);
  }, [result]);

  async function handleSubmit(e) {
    e.preventDefault();
    const input = url.trim();

    if (!input) {
      setResult({ Status: false, Error: "Paste URL first." });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      
      // Jika url Spotify, otomatis pakai scraper Spotidown kita langsung di AIO!
      let apiUrl = "/api/downr";
      if (input.includes("spotify.com")) {
        apiUrl = "/api/spotidown";
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input })
      });

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ Status: false, Error: err.message || "Download failed" });
    } finally {
      setLoading(false);
    }
  }

  async function copyJson() {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  }

  return (
    <section className="download-center">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Download Center</p>
          <h2>Choose media, download instantly.</h2>
        </div>
      </div>

      <div className="download-hero-card">
        <div>
          <h3>Preview media langsung di aplikasi.</h3>
          <p>
            Paste URL, ketik nama file yang kamu mau di dalam form card, lalu tekan download.
            Tidak akan diarahkan ke website sumber. 
          </p>
        </div>
        <div className="download-disc">
          <Download size={54} />
        </div>
      </div>

      <form className="music-download-form" onSubmit={handleSubmit}>
        <LinkIcon size={22} />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste music or video URL (TikTok, Spotify, dll)..."
        />
        <button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="spin" size={18} /> Loading</>
          ) : (
            <><Download size={18} /> Get Media</>
          )}
        </button>
      </form>

      <div className="platform-row">
        {platforms.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      {result && (
        <div className={`download-result ${result.Status ? "success" : "failed"}`}>
          <div className="result-header">
            <div>
              <p className="eyebrow">Result</p>
              <h3>{result.Status ? "Media Ready" : "Download Failed"}</h3>
            </div>
            <button type="button" onClick={copyJson}>
              <Copy size={16} />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          {result.Error && (
            <div className="aio-error">
              <strong>Error:</strong> {result.Error}
            </div>
          )}

          {links.length > 0 ? (
            <div className="aio-media-grid">
              {/* Memanggil sub-komponen baru (dengan Input Custom File Name) */}
              {links.map((item) => (
                <MediaCardItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            result.Status && (
              <div className="aio-no-preview">
                <Play size={34} />
                <strong>No direct media link detected.</strong>
                <span>
                  Response berhasil, tapi link media langsung tidak ditemukan
                  dari data yang dikembalikan.
                </span>
              </div>
            )
          )}

          <details className="json-details">
            <summary>Show raw JSON</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </section>
  );
}
