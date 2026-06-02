"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Link as LinkIcon, Loader2 } from "lucide-react";

const PLATFORMS = [
  "Tiktok",
  "Douyin",
  "Capcut",
  "Threads",
  "Instagram",
  "Facebook",
  "Espn",
  "Pinterest",
  "imdb",
  "imgur",
  "ifunny",
  "Izlesene",
  "Reddit",
  "Youtube",
  "Twitter",
  "Vimeo",
  "Snapchat",
  "Bilibili",
  "Dailymotion",
  "Sharechat",
  "Likee",
  "Linkedin",
  "Tumblr",
  "Hipi",
  "Telegram",
  "Getstickerpack",
  "Bitchute",
  "Febspot",
  "9GAG",
  "ok.ru",
  "Rumble",
  "Streamable",
  "Ted",
  "SohuTv",
  "Xvideos",
  "Xnxx",
  "Xiaohongshu",
  "Ixigua",
  "Weibo",
  "Miaopai",
  "Meipai",
  "Xiaoying",
  "National Video",
  "Yingke",
  "Sina",
  "Vk-vkvideo",
  "Soundcloud",
  "Mixcloud",
  "Spotify",
  "Zingmp3",
  "Bandcamp"
];

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

export default function DownloaderPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const links = useMemo(() => {
    if (!result?.Result) return [];
    return collectLinks(result.Result).slice(0, 20);
  }, [result]);

  async function handleSubmit(e) {
    e.preventDefault();

    const input = url.trim();

    if (!input) {
      setResult({
        Status: false,
        Code: 400,
        Input: null,
        Endpoint: null,
        Result: null,
        Error: "Masukkan URL terlebih dahulu."
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/downr", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          url: input
        })
      });

      const json = await res.json();

      setResult(json);
    } catch (err) {
      setResult({
        Status: false,
        Code: 500,
        Input: input,
        Endpoint: null,
        Result: null,
        Error: err.message || "Request failed"
      });
    } finally {
      setLoading(false);
    }
  }

  async function copyJson() {
    if (!result) return;

    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <p className="section-kicker green">AIO Downloader API</p>
          <h2>All-in-One Downloader</h2>
        </div>

        <span className="api-status">POST /api/downr</span>
      </div>

      <form className="download-panel" onSubmit={handleSubmit}>
        <div className="url-field">
          <LinkIcon size={21} />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL TikTok, Instagram, YouTube, Spotify, SoundCloud..."
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="spin" size={18} />
              Processing
            </>
          ) : (
            <>
              <Download size={18} />
              Download
            </>
          )}
        </button>
      </form>

      <div className="platform-cloud">
        {PLATFORMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      {result && (
        <div className={`api-result ${result.Status ? "ok" : "bad"}`}>
          <div className="result-top">
            <div>
              <p className="section-kicker">Response</p>
              <h3>{result.Status ? "Success" : "Failed"}</h3>
            </div>

            <button type="button" onClick={copyJson}>
              <Copy size={16} />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <div className="result-info-grid">
            <div>
              <small>Status</small>
              <strong>{String(result.Status)}</strong>
            </div>

            <div>
              <small>Code</small>
              <strong>{result.Code}</strong>
            </div>

            <div>
              <small>Endpoint</small>
              <strong>{result.Endpoint || "-"}</strong>
            </div>
          </div>

          {links.length > 0 && (
            <div className="download-links">
              <h4>Detected Download Links</h4>

              {links.map((link) => (
                <a key={link} href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              ))}
            </div>
          )}

          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
