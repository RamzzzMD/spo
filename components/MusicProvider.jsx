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

  function playTrack(nextTrack) {
    if (!nextTrack?.urlpreview) {
      setTrack(nextTrack);
      setPlaying(false);
      return;
    }

    const isSame = track?.urlpreview === nextTrack.urlpreview;

    if (isSame) {
      setPlaying(true);
      return;
    }

    setTrack(nextTrack);
    setPlaying(true);
    setProgress(0);
  }

  function togglePlay() {
    if (!track?.urlpreview) return;
    setPlaying((v) => !v);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.urlpreview) return;

    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, track]);

  const value = useMemo(
    () => ({
      track,
      playing,
      progress,
      playTrack,
      togglePlay
    }),
    [track, playing, progress]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}

      <audio
        ref={audioRef}
        src={track?.urlpreview || ""}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          const percent = audio.duration
            ? (audio.currentTime / audio.duration) * 100
            : 0;

          setProgress(percent);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
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

export function AudioPlayer() {
  const { track, playing, progress, togglePlay } = useMusic();

  return (
    <div className="audio-player">
      <div className="audio-track">
        <img
          src={track?.thumb || "https://placehold.co/80x80/181818/1ed760?text=R"}
          alt={track?.title || "No track"}
        />

        <div>
          <strong>{track?.title || "Belum ada lagu diputar"}</strong>
          <span>{track?.artist || "Pilih lagu dari halaman Search"}</span>
        </div>
      </div>

      <div className="audio-center">
        <button
          type="button"
          onClick={togglePlay}
          className="player-button"
          disabled={!track?.urlpreview}
        >
          {playing ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>

        <div className="progress-line">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="audio-volume">
        <Volume2 size={18} />
        <span>Background Player</span>
      </div>
    </div>
  );
}
