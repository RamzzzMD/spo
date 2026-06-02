"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Play } from "lucide-react";
import { useMusic } from "@/components/MusicProvider";
import { resolveFullAudioTrack } from "@/lib/media-client";

export default function DetailClient({ track }) {
  const { playTrack } = useMusic();

  const [loadingFull, setLoadingFull] = useState(false);
  const [error, setError] = useState("");

  const hasData = track?.title || track?.artist || track?.url;

  async function handlePlayFull() {
    try {
      setError("");
      setLoadingFull(true);

      const fullTrack = await resolveFullAudioTrack(track);

      playTrack(fullTrack);
    } catch (err) {
      setError(err.message || "Full audio tidak tersedia.");
    } finally {
      setLoadingFull(false);
    }
  }

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
            src={
              track.thumb ||
              "https://placehold.co/600x600/181818/1ed760?text=Music"
            }
            alt={track.title || "Track cover"}
          />

          <button
            type="button"
            onClick={handlePlayFull}
            disabled={loadingFull || !track.url}
          >
            {loadingFull ? (
              <Loader2 className="spin" size={28} />
            ) : (
              <Play size={28} fill="currentColor" />
            )}
          </button>
        </div>

        <div className="detail-content">
          <p className="eyebrow">Song Detail</p>
          <h2>{track.title || "Unknown title"}</h2>
          <h3>{track.artist || "Unknown artist"}</h3>

          <div className="detail-tags">
            <span>{track.duration || "0:00"}</span>
            <span>Full Song Mode</span>
            <span>Ranzz Play</span>
          </div>

          {error && <div className="song-error detail-error">{error}</div>}

          <div className="detail-buttons">
            <button
              type="button"
              onClick={handlePlayFull}
              disabled={loadingFull || !track.url}
            >
              {loadingFull ? (
                <>
                  <Loader2 className="spin" size={18} />
                  Loading Full
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  Play Full Song
                </>
              )}
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
