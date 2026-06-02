"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { useMusic } from "@/components/MusicProvider";

export default function DetailClient({ track }) {
  const { playTrack } = useMusic();

  const hasData = track?.title || track?.artist || track?.url;

  if (!hasData) {
    return (
      <section className="detail-page">
        <div className="empty-music">
          <strong>No track selected.</strong>
          <span>Search music first, then open the track detail.</span>

          <Link href="/search" className="primary-pill">
            Go to Search
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

      <div className="track-detail-hero">
        <div className="detail-cover-wrap">
          <img
            src={track.thumb || "https://placehold.co/600x600/181818/1ed760?text=Music"}
            alt={track.title || "Track cover"}
          />

          <button
            type="button"
            onClick={() => playTrack(track)}
            disabled={!track.urlpreview}
          >
            <Play size={28} fill="currentColor" />
          </button>
        </div>

        <div className="detail-content">
          <p className="eyebrow">Song Detail</p>
          <h2>{track.title || "Unknown title"}</h2>
          <h3>{track.artist || "Unknown artist"}</h3>

          <div className="detail-tags">
            <span>{track.duration || "0:00"}</span>
            <span>{track.urlpreview ? "Preview Available" : "No Preview"}</span>
            <span>Ranzz Play</span>
          </div>

          <div className="detail-buttons">
            <button
              type="button"
              onClick={() => playTrack(track)}
              disabled={!track.urlpreview}
            >
              <Play size={18} fill="currentColor" />
              Play Background
            </button>

            {track.url && (
              <a href={track.url} target="_blank" rel="noreferrer">
                <ExternalLink size={18} />
                Open Original
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="lyrics-card">
        <p className="eyebrow">Track Data</p>

        <pre>{JSON.stringify(track, null, 2)}</pre>
      </div>
    </section>
  );
}
