"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Download,
  Heart,
  Home,
  Library,
  Music2,
  Search
} from "lucide-react";
import { AudioPlayer, MusicProvider } from "@/components/MusicProvider";

const navs = [
  {
    href: "/",
    label: "Home",
    icon: Home
  },
  {
    href: "/search",
    label: "Search",
    icon: Search
  },
  {
    href: "/aio",
    label: "Download Center",
    icon: Download
  },
  {
    href: "/detail",
    label: "Now Detail",
    icon: Compass
  }
];

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <MusicProvider>
      <div className="music-app">
        <aside className="music-sidebar">
          <Link href="/" className="brand">
            <div className="brand-mark">
              <Music2 size={25} />
            </div>

            <div>
              <strong>Ranzz Play</strong>
              <span>Music & Downloader</span>
            </div>
          </Link>

          <nav className="music-nav">
            {navs.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : ""}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="library-card">
            <div className="library-title">
              <Library size={18} />
              <strong>Your Library</strong>
            </div>

            <div className="playlist-pill active">
              <Heart size={15} />
              Liked Preview
            </div>

            <div className="playlist-pill">
              <Music2 size={15} />
              Search History
            </div>

            <div className="playlist-pill">
              <Download size={15} />
              Downloaded Links
            </div>
          </div>
        </aside>

        <main className="music-main">
          <header className="music-topbar">
            <div className="topbar-left">
              <span>Professional Music Player</span>
              <strong>Listen, search, preview, and download</strong>
            </div>

            <Link href="/search" className="topbar-search">
              <Search size={18} />
              Search songs, artists, tracks...
            </Link>
          </header>

          {children}
        </main>

        <AudioPlayer />
      </div>
    </MusicProvider>
  );
}
