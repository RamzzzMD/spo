"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Link as LinkIcon,
  Loader2,
  Music2,
  Play,
  Search,
  Sparkles,
  XCircle
} from "lucide-react";

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
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectLinks(item, out));
  } else if (typeof value === "object") {
    Object.values(value).forEach((item) => collectLinks(item, out));
  }

  return Array.from(out);
}

function shortLink(link) {
  try {
    const u = new URL(link);
    return `${u.hostname}${u.pathname}`.slice(0, 58);
  } catch {
    return link.slice(0, 58);
  }
}

export default function DownloaderApp() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [spotifyTerm, setSpotifyTerm] = useState("");
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const resultLinks = useMemo(() => {
    if (!result?.Result) return [];
    return collectLinks(result.Result).slice(0, 12);
  }, [result]);

  useEffect(() => {
    const term = spotifyTerm.trim();

    if (term.length < 2) {
      setSpotifyResults([]);
      setSpotifyLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSpotifyLoading(true);

        const res = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(term)}&limit=5`,
          {
            signal: controller.signal,
            cache: "no-store"
          }
        );

        const json = await res.json();

        setSpotifyResults(Array.isArray(json?.Result) ? json.Result : []);
        setSearchOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSpotifyResults([]);
        }
      } finally {
        setSpotifyLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [spotifyTerm]);

  async function handleDownload(e) {
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
      setDownloading(true);
      setResult(null);

      const res = await fetch("/api/downr", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ url: input })
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
        Error: err.message || "Request gagal."
      });
    } finally {
      setDownloading(false);
    }
  }

  async function copyJson() {
    if (!result) return;

    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function useSpotifyUrl(track) {
    setUrl(track.url || "");
    setSearchOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Music2 size={22} />
          </div>
          <div>
            <strong>Ranzz AIO</strong>
            <span>Downloader</span>
          </div>
        </div>

        <nav className="side-nav">
          <a className="active" href="#">
            <Sparkles size={18} />
            Home
          </a>
          <a href="#download">
            <Download size={18} />
            Downloader
          </a>
          <a href="#platforms">
            <LinkIcon size={18} />
            Platforms
          </a>
        </nav>

        <section id="platforms" className="platform-box">
          <div className="section-kicker">Supported</div>
          <h2>{PLATFORMS.length}+ Platforms</h2>

          <div className="platform-list">
            {PLATFORMS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
      </aside>

      <main className="main">
        <header className="spotify-header">
          <div className="nav-dots">
            <span />
            <span />
          </div>

          <div className="header-search">
            <Search size={20} />
            <input
              value={spotifyTerm}
              onChange={(e) => setSpotifyTerm(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Cari lagu Spotify..."
            />

            {spotifyLoading && <Loader2 className="spin" size={18} />}

            {searchOpen && (spotifyResults.length > 0 || spotifyTerm.length > 1) && (
              <div className="search-overlay">
                {spotifyResults.length === 0 && !spotifyLoading ? (
                  <div className="empty-state">Lagu tidak ditemukan.</div>
                ) : (
                  spotifyResults.map((track, index) => (
                    <article className="search-card" key={`${track.url}-${index}`}>
                      <img
                        src={track.thumb || "/placeholder.png"}
                        alt={track.title || "Spotify cover"}
                      />

                      <div className="track-meta">
                        <strong>{track.title || "Unknown title"}</strong>
                        <span>{track.artist || "Unknown artist"}</span>
                        <small>{track.duration}</small>

                        {track.urlpreview ? (
                          <audio controls src={track.urlpreview} />
                        ) : (
                          <small>No preview</small>
                        )}
                      </div>

                      <button type="button" onClick={() => useSpotifyUrl(track)}>
                        Use
                      </button>
                    </article>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="header-actions">
            <span className="pro-badge">AIO</span>
            <div className="avatar">R</div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="section-kicker green">Ranzz Downloader Engine</div>
            <h1>All-in-One Downloader dengan rasa Spotify.</h1>
            <p>
              Tempel link dari TikTok, Instagram, YouTube, Spotify, SoundCloud,
              Facebook, Reddit, dan banyak platform lain. Sistem akan ambil
              cookie otomatis, coba endpoint utama, retry, lalu fallback.
            </p>
          </div>

          <div className="hero-player">
            <button className="play-button" type="button">
              <Play size={28} fill="currentColor" />
            </button>
            <div>
              <strong>Downr Auto Retry</strong>
              <span>Primary endpoint + backup fallback</span>
            </div>
          </div>
        </section>

        <section id="download" className="download-card">
          <div className="card-head">
            <div>
              <div className="section-kicker">Downloader</div>
              <h2>Paste URL</h2>
            </div>

            <span className="status-pill">
              <span />
              Server Side
            </span>
          </div>

          <form onSubmit={handleDownload} className="download-form">
            <div className="url-input">
              <LinkIcon size={20} />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://vt.tiktok.com/xxxx atau Spotify track URL..."
              />
            </div>

            <button disabled={downloading} type="submit" className="download-btn">
              {downloading ? (
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
        </section>

        {result && (
          <section className={`result-card ${result.Status ? "success" : "failed"}`}>
            <div className="result-head">
              <div>
                <div className="section-kicker">Response</div>
                <h2>{result.Status ? "Download Ready" : "Download Failed"}</h2>
              </div>

              <div className="result-status">
                {result.Status ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )}
                <span>{result.Code}</span>
              </div>
            </div>

            <div className="response-grid">
              <div>
                <small>Input</small>
                <p>{result.Input || "-"}</p>
              </div>
              <div>
                <small>Endpoint</small>
                <p>{result.Endpoint || "-"}</p>
              </div>
              <div>
                <small>Error</small>
                <p>{result.Error || "-"}</p>
              </div>
            </div>

            {resultLinks.length > 0 && (
              <div className="links-box">
                <h3>Detected Links</h3>

                {resultLinks.map((link) => (
                  <a key={link} href={link} target="_blank" rel="noreferrer">
                    {shortLink(link)}
                  </a>
                ))}
              </div>
            )}

            <div className="json-toolbar">
              <button onClick={copyJson} type="button">
                <Copy size={16} />
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>

            <pre>{JSON.stringify(result, null, 2)}</pre>
          </section>
        )}
      </main>
    </div>
  );
}
