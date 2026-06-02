"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Download,
  Home,
  Music2,
  Search,
  TerminalSquare
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
    label: "AIO",
    icon: Download
  },
  {
    href: "/detail",
    label: "Detail",
    icon: Boxes
  }
];

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <MusicProvider>
      <div className="app-layout">
        <aside className="sidebar">
          <Link href="/" className="brand">
            <div className="brand-icon">
              <Music2 size={23} />
            </div>

            <div>
              <strong>Ranzz API</strong>
              <span>AIO Downloader</span>
            </div>
          </Link>

          <nav className="side-nav">
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
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="api-box">
            <div className="section-kicker">API Status</div>
            <h3>Ready for Vercel</h3>

            <div className="mini-endpoint">
              <TerminalSquare size={16} />
              <span>GET /api/spotify/search</span>
            </div>

            <div className="mini-endpoint">
              <TerminalSquare size={16} />
              <span>POST /api/downr</span>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="top-header">
            <div>
              <p>Web API Dashboard</p>
              <h1>Ranzz AIO Downloader</h1>
            </div>

            <Link href="/search" className="header-search-pill">
              <Search size={18} />
              Search Spotify music...
            </Link>
          </header>

          {children}
        </main>

        <AudioPlayer />
      </div>
    </MusicProvider>
  );
}
