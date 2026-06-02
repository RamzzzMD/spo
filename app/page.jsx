import Link from "next/link";
import { Download, Music2, Search, Server } from "lucide-react";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="hero-api">
        <div>
          <p className="section-kicker green">Ranzz Web API</p>
          <h2>AIO Downloader with Spotify Background Player.</h2>
          <p>
            Dashboard API modern untuk download multi-platform, search Spotify,
            detail track, dan audio preview yang tetap berjalan di background.
          </p>

          <div className="hero-actions">
            <Link href="/aio">
              <Download size={18} />
              Try AIO
            </Link>

            <Link href="/search" className="secondary">
              <Search size={18} />
              Search Music
            </Link>
          </div>
        </div>

        <div className="hero-orb">
          <Music2 size={76} />
        </div>
      </div>

      <div className="endpoint-grid">
        <Link href="/aio" className="endpoint-card">
          <Server size={25} />
          <span>Downloader Endpoint</span>
          <strong>POST /api/downr</strong>
          <p>Auto cookie, retry endpoint utama, lalu fallback endpoint cadangan.</p>
        </Link>

        <Link href="/search" className="endpoint-card">
          <Search size={25} />
          <span>Spotify Search</span>
          <strong>GET /api/spotify/search</strong>
          <p>Search lagu, ambil cover, artist, durasi, URL, dan audio preview.</p>
        </Link>

        <Link href="/detail" className="endpoint-card">
          <Music2 size={25} />
          <span>Track Detail</span>
          <strong>/detail</strong>
          <p>Halaman detail lagu dengan tombol play background.</p>
        </Link>
      </div>

      <div className="code-card">
        <div className="section-kicker">Example Request</div>

        <pre>{`fetch("/api/downr", {
  method: "POST",
  headers: {
    "content-type": "application/json"
  },
  body: JSON.stringify({
    url: "https://vt.tiktok.com/xxxxx"
  })
})
  .then(res => res.json())
  .then(console.log);`}</pre>
      </div>
    </section>
  );
}
