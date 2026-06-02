"use client";

import Link from "next/link";
import { ExternalLink, Info, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { useMusic } from "@/components/MusicProvider";
import { resolveFullAudioTrack } from "@/lib/media-client";

function detailHref(track) {
  const params = new URLSearchParams({
    title: track.title || "",
    artist: track.artist || "",
    duration: track.duration || "",
    thumb: track.thumb || "",
    url: track.url || "",
    preview: track.urlpreview || ""
  });

  return `/detail?${params.toString()}`;
}

export default function TrackCard({ track, large = false }) {
  const { playTrack } = useMusic();
  const [loadingFull, setLoadingFull] = useState(false);
  const [error, setError] = useState("");

  async function handlePlayFull() {
    try {
      setError("");
      setLoadingFull(true);

      const fullTrack = await resolveFullAudioTrack(track);

      playTrack(fullTrack);
    } catch (err) {
      setError(err.message || "Full song tidak tersedia.");
    } finally {
      setLoadingFull(false);
    }
  }

  return (
    <article className={large ? "song-card large" : "song-card"}>
      <div className="song-cover">
        <img
          src={track.thumb || "https://placehold.co/500x500/181818/1ed760?text=Music"}
          alt={track.title || "Track cover"}
        />

        <button
          type="button"
          className="cover-play"
          onClick={handlePlayFull}
          disabled={loadingFull || !track.url}
          title="Play full song"
        >
          {loadingFull ? (
            <Loader2 className="spin" size={20} />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>
      </div>

      <div className="song-info">
        <strong>{track.title || "Unknown title"}</strong>
        <span>{track.artist || "Unknown artist"}</span>
        <small>{track.duration || "-"}</small>
      </div>

      {error && <div className="song-error">{error}</div>}

      <div className="song-actions">
        <button
          type="button"
          onClick={handlePlayFull}
          disabled={loadingFull || !track.url}
        >
          {loadingFull ? (
            <>
              <Loader2 className="spin" size={15} />
              Loading Full
            </>
          ) : (
            <>
              <Play size={15} />
              Play Full
            </>
          )}
        </button>

        <Link href={detailHref(track)}>
          <Info size={15} />
          Detail
        </Link>

        {track.url && (
          <a href={track.url} target="_blank" rel="noreferrer">
            <ExternalLink size={15} />
            Open
          </a>
        )}
      </div>
    </article>
  );
}
