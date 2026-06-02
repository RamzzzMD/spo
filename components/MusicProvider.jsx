"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Pause, Play, Volume2, SkipBack, SkipForward, ListMusic, X } from "lucide-react";

const MusicContext = createContext(null);

function fmtTime(seconds) {
  const safe = Number.isFinite(seconds) ? seconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MusicProvider({ children }) {
  const audioRef = useRef(null);

  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  // === STATE BARU UNTUK HISTORY & QUEUE ===
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);

  function playTrack(nextTrack) {
    if (!nextTrack?.audioUrl) {
      setTrack(nextTrack || null);
      setPlaying(false);
      return;
    }

    // Masukkan lagu yang sedang diputar sekarang ke history sebelum diganti
    if (track) {
      setHistory((prev) => [track, ...prev].slice(0, 30));
    }

    setTrack(nextTrack);
    setPlaying(true);
  }

  function addToQueue(newTrack) {
    setQueue((prev) => [...prev, newTrack]);
  }

  function playNext() {
    if (queue.length === 0) return;
    const nextTrack = queue[0];
    
    if (track) setHistory((prev) => [track, ...prev].slice(0, 30));
    
    setQueue((prev) => prev.slice(1)); // Hapus dari queue
    setTrack(nextTrack);
    setPlaying(true);
  }

  function playPrevious() {
    if (history.length === 0) return;
    const prevTrack = history[0];

    if (track) setQueue((prev) => [track, ...prev]); // Kembalikan yang sekarang ke queue
    
    setHistory((prev) => prev.slice(1)); // Hapus dari history
    setTrack(prevTrack);
    setPlaying(true);
  }

  function togglePlay() {
    if (!track?.audioUrl) return;
    setPlaying((value) => !value);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track?.audioUrl) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    audio.src = track.audioUrl;
    audio.currentTime = 0;
    audio.load();

    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
  }, [track?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;

    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, track?.audioUrl]);

  const value = useMemo(
    () => ({
      track, playing, progress, duration, current, queue, history,
      playTrack, togglePlay, addToQueue, playNext, playPrevious
    }),
    [track, playing, progress, duration, current, queue, history]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const total = e.currentTarget.duration || 0;
          setDuration(Number.isFinite(total) ? total : 0);
        }}
        onTimeUpdate={(e) => {
          const now = e.currentTarget.currentTime || 0;
          const total = e.currentTarget.duration || 0;
          setCurrent(Number.isFinite(now) ? now : 0);
          setDuration(Number.isFinite(total) ? total : 0);
          setProgress(total ? (now / total) * 100 : 0);
        }}
        onEnded={() => {
          // Putar lagu selanjutnya otomatis jika antrean ada
          if (queue.length > 0) {
            playNext();
          } else {
            setPlaying(false);
            setProgress(0);
            setCurrent(0);
          }
        }}
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
}

export function AudioPlayer() {
  const { 
    track, playing, progress, current, duration, queue, history,
    togglePlay, playNext, playPrevious 
  } = useMusic();
  
  const [showQueue, setShowQueue] = useState(false);

  return (
    <>
      {/* UI PANEL ANTREAN & HISTORY */}
      {showQueue && (
        <div className="queue-panel">
          <div className="queue-panel-header">
            <h3>Antrean & Riwayat</h3>
            <button onClick={() => setShowQueue(false)}><X size={20}/></button>
          </div>

          <div className="queue-section">
            <span className="eyebrow">Up Next ({queue.length})</span>
            {queue.length === 0 && <p className="empty-txt">Tidak ada antrean.</p>}
            {queue.map((q, i) => (
              <div key={i} className="queue-item">
                <img src={q.thumb || "/placeholder.png"} alt="cover"/>
                <div>
                  <strong>{q.title}</strong>
                  <span>{q.artist}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="queue-section" style={{marginTop: 24}}>
            <span className="eyebrow">History ({history.length})</span>
            {history.length === 0 && <p className="empty-txt">Belum ada riwayat.</p>}
            {history.map((h, i) => (
              <div key={i} className="queue-item opacity-70">
                <img src={h.thumb || "/placeholder.png"} alt="cover"/>
                <div>
                  <strong>{h.title}</strong>
                  <span>{h.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bottom-player">
        <div className="player-song">
          <img
            src={track?.thumb || "https://placehold.co/120x120/181818/1ed760?text=R"}
            alt={track?.title || "No track"}
          />
          <div>
            <strong>{track?.title || "No song playing"}</strong>
            <span>
              {track?.artist || "Choose a song to start playback"}
            </span>
          </div>
        </div>

        <div className="player-center">
          <div className="player-controls">
            <button type="button" className="skip-btn" onClick={playPrevious} disabled={history.length === 0}>
              <SkipBack size={18} fill={history.length > 0 ? "currentColor" : "none"}/>
            </button>

            <button type="button" className="main-play-button" onClick={togglePlay} disabled={!track?.audioUrl}>
              {playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}
            </button>

            <button type="button" className="skip-btn" onClick={playNext} disabled={queue.length === 0}>
              <SkipForward size={18} fill={queue.length > 0 ? "currentColor" : "none"}/>
            </button>
          </div>

          <div className="player-time-row">
            <small>{fmtTime(current)}</small>
            <div className="player-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>{duration ? fmtTime(duration) : track?.duration || "0:00"}</small>
          </div>
        </div>

        <div className="player-side">
          <button 
            type="button" 
            onClick={() => setShowQueue(!showQueue)} 
            className={`action-btn ${showQueue ? 'active-green' : ''}`}
          >
            <ListMusic size={18} />
          </button>
          <Volume2 size={18} />
        </div>
      </div>
    </>
  );
}
