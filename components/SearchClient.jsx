"use client";

import { useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import TrackCard from "@/components/TrackCard";

const suggestions = [
  "trouble is a friend",
  "night changes",
  "blue jeans",
  "rewrite the stars",
  "one of the girls",
  "about you"
];

export default function SearchClient() {
  const [query, setQuery] = useState("trouble is a friend");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function searchMusic(keyword = query) {
    const q = String(keyword || "").trim();

    if (!q) return;

    try {
      setQuery(q);
      setLoading(true);
      setSearched(true);

      const res = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(q)}&limit=12`,
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
    <section className="search-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Discover Music</p>
          <h2>Search songs you love.</h2>
        </div>
      </div>

      <form
        className="hero-search"
        onSubmit={(e) => {
          e.preventDefault();
          searchMusic();
        }}
      >
        <Search size={22} />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search song, artist, or track..."
        />

        <button type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : "Search"}
        </button>
      </form>

      <div className="suggestion-row">
        <Sparkles size={17} />

        {suggestions.map((item) => (
          <button key={item} type="button" onClick={() => searchMusic(item)}>
            {item}
          </button>
        ))}
      </div>

      {searched && tracks.length === 0 && !loading && (
        <div className="empty-music">
          <strong>No songs found.</strong>
          <span>Try another keyword or artist name.</span>
        </div>
      )}

      <div className="song-grid">
        {tracks.map((track, index) => (
          <TrackCard key={`${track.url}-${index}`} track={track} />
        ))}
      </div>
    </section>
  );
}
