"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AudioPlayerProps {
  src: string;
  duration?: number;
}

const BAR_COUNT = 44;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateBars(seed: number): number[] {
  const rand = seededRandom(seed + 42);
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const envelope = Math.sin((i / BAR_COUNT) * Math.PI) * 0.65 + 0.35;
    const noise = rand() * 0.6 + 0.4;
    return Math.max(0.12, Math.min(1, noise * envelope));
  });
}

export default function AudioPlayer({ src, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration ?? 0);
  const [bars] = useState(() => generateBars(src.length * 31 + 7));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => { if (!isDragging) setCurrentTime(audio.currentTime); };
    const onLoaded = () => setTotalDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isDragging]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setCurrentTime(v);
    if (audioRef.current) audioRef.current.currentTime = v;
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
  const playedCount = Math.floor(progress * BAR_COUNT);

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Waveform */}
      <div
        className="w-full flex items-end justify-between px-1"
        style={{ height: 64, gap: 2 }}
      >
        {bars.map((h, i) => {
          const played = i < playedCount;
          const isNear = Math.abs(i - playedCount) < 3;
          return (
            <div
              key={i}
              className={`waveform-bar flex-1${isPlaying && !played ? " playing" : ""}`}
              style={{
                height: `${h * 100}%`,
                opacity: played ? 1 : isNear ? 0.55 : 0.25,
                background: played
                  ? `linear-gradient(to top, var(--gold-dark), var(--gold-light))`
                  : "var(--gold)",
                animationDelay: isPlaying ? `${(i % 7) * 0.11}s` : "0s",
                animationDuration: isPlaying ? `${0.65 + (i % 5) * 0.1}s` : "0s",
                transition: "opacity 0.1s ease",
                borderRadius: 3,
              }}
            />
          );
        })}
      </div>

      {/* Progress track */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative w-full">
          {/* Track background */}
          <div
            className="w-full rounded-full"
            style={{ height: 4, background: "rgba(184,134,26,0.18)" }}
          />
          {/* Played portion */}
          <div
            className="absolute top-0 left-0 rounded-full"
            style={{
              height: 4,
              width: `${progress * 100}%`,
              background: "linear-gradient(to right, var(--gold-dark), var(--gold-light))",
              transition: isDragging ? "none" : "width 0.1s linear",
            }}
          />
          {/* Thumb dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full shadow-md"
            style={{
              width: 14,
              height: 14,
              background: "var(--gold)",
              left: `calc(${progress * 100}% - 7px)`,
              boxShadow: "0 0 0 3px rgba(184,134,26,0.2)",
              transition: isDragging ? "none" : "left 0.1s linear",
            }}
          />
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="absolute inset-0 w-full opacity-0"
            style={{ height: 20, top: -8, cursor: "pointer" }}
          />
        </div>

        {/* Timestamps */}
        <div
          className="flex justify-between text-xs font-medium tabular-nums"
          style={{ color: "var(--ink-muted)" }}
        >
          <span>{fmt(currentTime)}</span>
          <span>{fmt(totalDuration)}</span>
        </div>
      </div>

      {/* Play / Pause button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={togglePlay}
          className="relative flex items-center justify-center rounded-full transition-transform active:scale-90"
          style={{ width: 76, height: 76 }}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(184,134,26,0.12)",
              transform: "scale(1.18)",
            }}
          />
          {/* Inner ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(184,134,26,0.08)", transform: "scale(1.36)" }}
          />
          {/* Button */}
          <div
            className={`relative flex items-center justify-center rounded-full${isPlaying ? " gold-glow-pulse" : ""}`}
            style={{
              width: 76,
              height: 76,
              background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
              boxShadow: "0 4px 20px rgba(184,134,26,0.35), 0 1px 4px rgba(0,0,0,0.12)",
            }}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="white" width={28} height={28}>
                <rect x="5" y="4" width="4" height="16" rx="1.5" />
                <rect x="15" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" width={28} height={28} style={{ marginLeft: 3 }}>
                <path d="M8 5.14v14l11-7z" />
              </svg>
            )}
          </div>
        </button>

        <p
          className="text-xs font-semibold tracking-[0.22em] uppercase"
          style={{ color: "var(--gold)" }}
        >
          {isPlaying ? "PAUSE" : "ÉCOUTER"}
        </p>
      </div>
    </div>
  );
}
