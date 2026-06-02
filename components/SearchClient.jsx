"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import TrackCard from "@/components/TrackCard";

export default function SearchClient() {
  const [query, setQuery] = useState("trouble is a friend");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();

    const q = query.trim();

    if (!q) return;

    try {
      setLoading(true);
      setSearched(true);

      const res = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(q)}&limit=8`,
        {
          cache: "no-store"
        }
      );

      const json = await res.json();

      setTracks(Array.isArray(json?.Result) ? json.Result : []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <p className="section-kicker green">Spotify Search API</p>
          <h2>Search Music</h2>
        </div>
      </div>

      <form className="search-big" onSubmit={handleSearch}>
        <Search size={21} />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari lagu, artist, atau judul..."
        />

        <button type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : "Search"}
        </button>
      </form>

      {searched && tracks.length === 0 && !loading && (
        <div className="empty-card">
          <strong>Musik tidak ditemukan.</strong>
          <span>Coba keyword lain.</span>
        </div>
      )}

      <div className="track-grid">
        {tracks.map((track, index) => (
          <TrackCard key={`${track.url}-${index}`} track={track} />
        ))}
      </div>
    </section>
  );
}
