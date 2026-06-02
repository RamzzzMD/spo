"use client";

import Link from "next/link";
import { ExternalLink, Info, Play } from "lucide-react";
import { useMusic } from "@/components/MusicProvider";

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

export default function TrackCard({ track }) {
  const { playTrack } = useMusic();

  return (
    <article className="track-card">
      <div className="cover-wrap">
        <img
          src={track.thumb || "https://placehold.co/400x400/181818/1ed760?text=Music"}
          alt={track.title || "Track cover"}
        />

        <button
          type="button"
          className="floating-play"
          onClick={() => playTrack(track)}
          disabled={!track.urlpreview}
          title={track.urlpreview ? "Play in background" : "No preview available"}
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className="track-body">
        <strong>{track.title || "Unknown title"}</strong>
        <span>{track.artist || "Unknown artist"}</span>
        <small>{track.duration || "-"}</small>
      </div>

      <div className="track-actions">
        <button
          type="button"
          onClick={() => playTrack(track)}
          disabled={!track.urlpreview}
        >
          <Play size={15} />
          Play Background
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
