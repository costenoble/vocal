"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

/* ── Constants ── */
const BAR_COUNT = 48

function staticHeight(i: number): number {
  // Seeded pseudo-random for consistent idle state
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return Math.abs(x - Math.floor(x)) * 0.45 + 0.08
}

const IDLE_BARS = Array.from({ length: BAR_COUNT }, (_, i) => staticHeight(i))

// Barres décoratives animées pendant la lecture — pas une vraie analyse du
// signal audio (voir plus bas pourquoi : fiabilité de la lecture avant tout).
function fakeBars(t: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const x = Math.sin(i * 12.9898 + t * 6.283) * 43758.5453
    const n = Math.abs(x - Math.floor(x))
    return Math.max(0.08, Math.min(1, n * 0.8 + Math.sin(t * 3 + i * 0.5) * 0.15 + 0.15))
  })
}

/* ── Types ── */
interface LiveAudioWaveformProps {
  src?: string
  duration?: number
  className?: string
  demo?: boolean
  barPlayed?: string
  barIdle?: string
  progressBg?: string
  accentColor?: string
}

/* ── Helpers ── */
function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

/* ── Component ── */
export function LiveAudioWaveform({
  src,
  duration: initialDuration,
  className,
  demo = false,
  barPlayed = "linear-gradient(to top, var(--gold-dark), var(--gold-light))",
  barIdle = "rgba(184,134,26,0.22)",
  progressBg = "rgba(184,134,26,0.15)",
  accentColor = "var(--gold)",
}: LiveAudioWaveformProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef<number>(0)

  const [bars, setBars] = useState<number[]>(IDLE_BARS)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(initialDuration ?? 0)
  const [playError, setPlayError] = useState(false)

  // Lecture 100% native (pas de Web Audio API) : la carte doit être écoutable
  // sur tous les appareils sans exception. Router l'audio dans un
  // AudioContext/AnalyserNode pour animer les barres est une source connue
  // de silence total (notamment Safari/iOS avec un fichier cross-origin),
  // parfois sans aucune erreur visible — trop risqué pour ce qui est le cœur
  // du produit. Les barres ci-dessous sont donc décoratives, pas une vraie
  // analyse du signal.
  const tick = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isFinite(audio.duration) && audio.duration > 0) {
      setElapsed(audio.currentTime)
      setProgress(audio.currentTime / audio.duration)
    }
    setBars(fakeBars(audio.currentTime))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  /* ── Toggle play/pause ── */
  const toggle = useCallback(async () => {
    if (!audioRef.current || demo) return
    setPlayError(false)

    if (playing) {
      audioRef.current.pause()
      cancelAnimationFrame(rafRef.current)
      setBars(prev => prev.map(b => Math.max(0.05, b * 0.4)))
      setPlaying(false)
      return
    }

    try {
      await audioRef.current.play()
      tick()
      setPlaying(true)
    } catch {
      setPlayError(true)
    }
  }, [playing, demo, tick])

  /* ── Seek on progress bar click ── */
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || demo) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0)
    setProgress(ratio)
    setElapsed(ratio * (audioRef.current.duration || 0))
  }, [demo])

  /* ── Cleanup ── */
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
  }, [])

  const isDisabled = demo || !src

  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onLoadedMetadata={() => {
            const d = audioRef.current?.duration ?? 0
            if (isFinite(d)) setDuration(d)
          }}
          onEnded={() => {
            setPlaying(false)
            cancelAnimationFrame(rafRef.current)
            setProgress(0)
            setElapsed(0)
            setBars(IDLE_BARS)
          }}
          onError={() => setPlayError(true)}
        />
      )}

      {/* ── Waveform bars ── */}
      <div
        className="flex items-end justify-center gap-[2.5px] w-full"
        style={{ height: 56 }}
        aria-hidden
      >
        {bars.map((h, i) => {
          const isPlayed = i / BAR_COUNT <= progress
          return (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${Math.max(6, h * 100)}%`,
                background: isPlayed ? barPlayed : barIdle,
                minWidth: 2,
                maxWidth: 7,
                transition: playing ? "height 75ms ease" : "height 300ms ease",
              }}
            />
          )
        })}
      </div>

      {/* ── Progress bar ── */}
      <div
        role={isDisabled ? undefined : "slider"}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative w-full rounded-full"
        style={{
          height: 3,
          background: progressBg,
          cursor: isDisabled ? "default" : "pointer",
        }}
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%`, background: accentColor }}
        />
        {!isDisabled && progress > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
            style={{
              left: `calc(${progress * 100}% - 6px)`,
              background: "white",
              borderColor: accentColor,
              boxShadow: `0 1px 6px ${accentColor}55`,
            }}
          />
        )}
      </div>

      {/* ── Controls row ── */}
      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          onClick={toggle}
          disabled={isDisabled}
          className="shrink-0 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: 40,
            height: 40,
            background: accentColor,
            boxShadow: playing
              ? `0 0 0 6px ${accentColor}22, 0 4px 16px ${accentColor}55`
              : `0 4px 14px ${accentColor}44`,
          }}
          aria-label={playing ? "Pause" : "Lire"}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="white" width={13} height={13}>
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white" width={14} height={14}>
              <path d="M8 5.14v14l11-7-11-7z"/>
            </svg>
          )}
        </button>

        {/* Time display */}
        <div className="flex items-center justify-between flex-1">
          <span
            className="text-[11px] tabular-nums font-medium"
            style={{ color: accentColor, fontVariantNumeric: "tabular-nums" }}
          >
            {fmt(elapsed)}
          </span>
          <span
            className="text-[11px] tabular-nums"
            style={{ color: "var(--ink-muted)", opacity: 0.5, fontVariantNumeric: "tabular-nums" }}
          >
            {duration > 0 ? fmt(duration) : "--:--"}
          </span>
        </div>
      </div>

      {playError && (
        <p className="text-[12px] text-center" style={{ color: "#C0392B" }}>
          La lecture a échoué sur cet appareil. Réessayez, ou changez de navigateur si le problème persiste.
        </p>
      )}
    </div>
  )
}
