import Link from "next/link";
import { Download, Play, Search, Sparkles } from "lucide-react";

const featured = [
  {
    title: "Spotify Search",
    desc: "Find tracks, artist names, covers, duration, and playable previews.",
    href: "/search",
    icon: Search
  },
  {
    title: "Background Player",
    desc: "Play track previews while browsing other pages.",
    href: "/search",
    icon: Play
  },
  {
    title: "Download Center",
    desc: "Paste media links from many platforms and extract results.",
    href: "/aio",
    icon: Download
  }
];

export default function HomePage() {
  return (
    <section className="home-music">
      <div className="home-hero">
        <div className="hero-text">
          <p className="eyebrow">Ranzz Play Music</p>
          <h2>Professional web music player with smart downloader.</h2>
          <p>
            Search songs, preview music, open track details, and keep the player
            running in the background while exploring the app.
          </p>

          <div className="hero-buttons">
            <Link href="/search">
              <Play size={18} fill="currentColor" />
              Start Listening
            </Link>

            <Link href="/aio" className="light">
              <Download size={18} />
              Download Center
            </Link>
          </div>
        </div>

        <div className="album-showcase">
          <div className="album-card one">
            <Sparkles size={42} />
            <strong>Ranzz Mix</strong>
            <span>Daily preview playlist</span>
          </div>

          <div className="album-card two">
            <Play size={42} fill="currentColor" />
            <strong>Now Playing</strong>
            <span>Background audio ready</span>
          </div>
        </div>
      </div>

      <div className="featured-grid">
        {featured.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.title} href={item.href} className="feature-card">
              <Icon size={27} />
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </Link>
          );
        })}
      </div>

      <div className="music-banner">
        <div>
          <p className="eyebrow">Made for listening</p>
          <h3>Clean cards, smooth dark UI, and always-on player.</h3>
        </div>

        <Link href="/search">Explore Music</Link>
      </div>
    </section>
  );
}
