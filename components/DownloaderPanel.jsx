"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Link as LinkIcon, Loader2 } from "lucide-react";

const platforms = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Facebook",
  "Spotify",
  "SoundCloud",
  "Twitter",
  "Reddit",
  "Pinterest",
  "CapCut",
  "Vimeo",
  "Bilibili",
  "Dailymotion",
  "Bandcamp",
  "Mixcloud",
  "Zingmp3"
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
        Error: "Paste URL first."
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
        Error: err.message || "Download failed"
      });
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
          <h2>Save your favorite media.</h2>
        </div>
      </div>

      <div className="download-hero-card">
        <div>
          <h3>Paste any supported music or video URL.</h3>
          <p>
            Works with popular music and social platforms. The result will be
            shown as clean JSON and detected media links.
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
          placeholder="Paste music or video URL..."
        />

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="spin" size={18} />
              Loading
            </>
          ) : (
            <>
              <Download size={18} />
              Download
            </>
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
              <h3>{result.Status ? "Media Found" : "Download Failed"}</h3>
            </div>

            <button type="button" onClick={copyJson}>
              <Copy size={16} />
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          {links.length > 0 && (
            <div className="media-links">
              <h4>Media Links</h4>

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
