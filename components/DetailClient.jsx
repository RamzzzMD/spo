"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { useMusic } from "@/components/MusicProvider";

export default function DetailClient({ track }) {
  const { playTrack } = useMusic();

  const hasData = track?.title || track?.artist || track?.url;

  if (!hasData) {
    return (
      <section className="page-section">
        <div className="empty-card">
          <strong>Detail lagu belum tersedia.</strong>
          <span>Buka halaman Search, pilih lagu, lalu klik Detail.</span>

          <Link href="/search" className="primary-link">
            Ke Search
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <Link href="/search" className="back-link">
        <ArrowLeft size={17} />
        Back to Search
      </Link>

      <div className="detail-hero">
        <img
          src={track.thumb || "https://placehold.co/500x500/181818/1ed760?text=Music"}
          alt={track.title || "Track cover"}
        />

        <div className="detail-info">
          <p className="section-kicker green">Track Detail</p>
          <h2>{track.title || "Unknown title"}</h2>
          <h3>{track.artist || "Unknown artist"}</h3>

          <div className="detail-meta">
            <span>Duration: {track.duration || "-"}</span>
            <span>{track.urlpreview ? "Preview Ready" : "No Preview"}</span>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              onClick={() => playTrack(track)}
              disabled={!track.urlpreview}
            >
              <Play size={18} fill="currentColor" />
              Play in Background
            </button>

            {track.url && (
              <a href={track.url} target="_blank" rel="noreferrer">
                <ExternalLink size={18} />
                Open Spotify
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="code-card">
        <div className="section-kicker">JSON Output</div>

        <pre>{JSON.stringify(track, null, 2)}</pre>
      </div>
    </section>
  );
}
