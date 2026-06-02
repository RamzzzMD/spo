"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Pause, Play, Volume2 } from "lucide-react";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);

  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  function playTrack(nextTrack) {
    if (!nextTrack?.audioUrl) {
      setTrack(nextTrack || null);
      setPlaying(false);
      return;
    }

    setTrack(nextTrack);
    setPlaying(true);
    setProgress(0);
    setCurrent(0);
  }

  function togglePlay() {
    if (!track?.audioUrl) return;
    setPlaying((value) => !value);
  }

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !track?.audioUrl) return;

    audio.src = track.audioUrl;
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
      track,
      playing,
      progress,
      duration,
      current,
      playTrack,
      togglePlay
    }),
    [track, playing, progress, duration, current]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
        }}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          const now = audio.currentTime || 0;
          const total = audio.duration || 0;

          setCurrent(now);
          setDuration(Number.isFinite(total) ? total : 0);
          setProgress(total ? (now / total) * 100 : 0);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          setCurrent(0);
        }}
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);

  if (!ctx) {
    throw new Error("useMusic must be used inside MusicProvider");
  }

  return ctx;
}

function fmtTime(seconds) {
  const safe = Number.isFinite(seconds) ? seconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);

  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer() {
  const { track, playing, progress, current, duration, togglePlay } = useMusic();

  return (
    <div className="bottom-player">
      <div className="player-song">
        <img
          src={track?.thumb || "https://placehold.co/120x120/181818/1ed760?text=R"}
          alt={track?.title || "No track"}
        />

        <div>
          <strong>{track?.title || "No song playing"}</strong>
          <span>
            {track?.artist ||
              "Choose a song to start full background playback"}
          </span>
        </div>
      </div>

      <div className="player-center">
        <button
          type="button"
          className="main-play-button"
          onClick={togglePlay}
          disabled={!track?.audioUrl}
        >
          {playing ? (
            <Pause size={21} fill="currentColor" />
          ) : (
            <Play size={21} fill="currentColor" />
          )}
        </button>

        <div className="player-time-row">
          <small>{fmtTime(current)}</small>

          <div className="player-progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <small>{duration ? fmtTime(duration) : track?.duration || "0:00"}</small>
        </div>
      </div>

      <div className="player-side">
        <Volume2 size={18} />
        <span>{track?.isFullAudio ? "Full Song" : "No Preview Mode"}</span>
      </div>
    </div>
  );
}
