"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface AudioRecorderProps {
  onRecorded: (blob: Blob, duration: number) => void;
  onImported: (file: File, duration: number) => void;
}

type RecordState = "idle" | "recording" | "done";

const LIVE_BAR_COUNT = 32;

export default function AudioRecorder({ onRecorded, onImported }: AudioRecorderProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(Array(LIVE_BAR_COUNT).fill(0));

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number | null>(null);
  const historyRef = useRef<number[]>(Array(LIVE_BAR_COUNT).fill(0));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const stopAnim = () => { if (animRef.current) cancelAnimationFrame(animRef.current); };

  const tickAnalyser = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    // Average energy across frequency bins
    const avg = data.slice(0, data.length / 2).reduce((a, b) => a + b, 0) / (data.length / 2);
    const norm = Math.min(1, avg / 80);

    // Shift history left, push new value
    historyRef.current = [...historyRef.current.slice(1), norm];

    // Add natural variation to each bar based on its position
    const bars = historyRef.current.map((v, i) => {
      const jitter = Math.sin(Date.now() / 180 + i * 1.3) * 0.08;
      return Math.max(0.04, Math.min(1, v + jitter));
    });

    setLevels(bars);
    animRef.current = requestAnimationFrame(tickAnalyser);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      src.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("done");
        const duration = (Date.now() - startTimeRef.current) / 1000;
        onRecorded(blob, duration);
        stream.getTracks().forEach((t) => t.stop());
        stopAnim();
        historyRef.current = Array(LIVE_BAR_COUNT).fill(0);
        setLevels(Array(LIVE_BAR_COUNT).fill(0));
      };

      mr.start(100);
      startTimeRef.current = Date.now();
      setState("recording");
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
      tickAnalyser();
    } catch {
      alert("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres.");
    }
  }, [onRecorded, tickAnalyser]);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    stopTimer();
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setElapsed(0);
    setState("idle");
    historyRef.current = Array(LIVE_BAR_COUNT).fill(0);
    setLevels(Array(LIVE_BAR_COUNT).fill(0));
  }, [audioUrl]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setAudioUrl(url);
      setState("done");
      onImported(file, audio.duration);
    });
  }, [onImported]);

  useEffect(() => () => { stopTimer(); stopAnim(); }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* ── IDLE ── */}
      {state === "idle" && (
        <>
          <div className="flex flex-col items-center gap-3">
            {/* Mic button */}
            <button
              onClick={startRecording}
              className="relative flex items-center justify-center rounded-full transition-transform active:scale-90"
              style={{ width: 80, height: 80 }}
              aria-label="Commencer l'enregistrement"
            >
              {/* Rings */}
              <div className="absolute inset-0 rounded-full" style={{ background: "rgba(184,134,26,0.10)", transform: "scale(1.2)" }} />
              <div className="absolute inset-0 rounded-full" style={{ background: "rgba(184,134,26,0.06)", transform: "scale(1.42)" }} />
              {/* Button */}
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                  boxShadow: "0 4px 20px rgba(184,134,26,0.35), 0 1px 4px rgba(0,0,0,0.12)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" width={30} height={30}>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V21H8v2h8v-2h-3v-.06A9 9 0 0 0 21 12v-2h-2z" />
                </svg>
              </div>
            </button>
            <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
              Appuyez pour enregistrer
            </p>
          </div>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px" style={{ background: "var(--gold)", opacity: 0.2 }} />
            <span className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "var(--gold)", opacity: 0.2 }} />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all active:scale-95"
            style={{ borderColor: "rgba(184,134,26,0.35)", color: "var(--gold)", background: "rgba(184,134,26,0.04)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
            </svg>
            Importer un fichier audio
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleImport} />
        </>
      )}

      {/* ── RECORDING ── */}
      {state === "recording" && (
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Live waveform */}
          <div
            className="w-full rounded-2xl px-4 py-3 flex items-end justify-between"
            style={{
              height: 72,
              background: "rgba(184,134,26,0.06)",
              border: "1px solid rgba(184,134,26,0.12)",
              gap: 2,
            }}
          >
            {levels.map((lvl, i) => {
              const h = Math.max(4, lvl * 100);
              // Gradient: bars get slightly taller in the middle for visual interest
              const scale = 0.7 + Math.sin((i / LIVE_BAR_COUNT) * Math.PI) * 0.3;
              const finalH = Math.max(4, h * scale);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all"
                  style={{
                    height: `${finalH}%`,
                    background: `linear-gradient(to top, var(--gold-dark), var(--gold-light))`,
                    opacity: 0.75 + lvl * 0.25,
                    transitionDuration: "80ms",
                    transitionTimingFunction: "ease-out",
                  }}
                />
              );
            })}
          </div>

          {/* Recording indicator + timer */}
          <div className="flex items-center gap-3">
            {/* Pulsing red dot */}
            <div className="relative">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: "#ef4444",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "#ef4444",
                  opacity: 0.4,
                  transform: "scale(2)",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              />
            </div>
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(elapsed)}
            </span>
            <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
              REC
            </span>
          </div>

          {/* Stop button */}
          <button
            onClick={stopRecording}
            className="relative flex items-center justify-center rounded-full transition-transform active:scale-90"
            style={{ width: 72, height: 72 }}
            aria-label="Arrêter l'enregistrement"
          >
            <div className="absolute inset-0 rounded-full" style={{ background: "rgba(184,134,26,0.10)", transform: "scale(1.2)" }} />
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 72,
                height: 72,
                background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                boxShadow: "0 4px 20px rgba(184,134,26,0.35)",
              }}
            >
              {/* Square stop icon */}
              <div
                className="rounded-md"
                style={{ width: 22, height: 22, background: "white" }}
              />
            </div>
          </button>
          <p className="text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>
            Appuyez pour arrêter
          </p>
        </div>
      )}

      {/* ── DONE ── */}
      {state === "done" && audioUrl && (
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Preview */}
          <div
            className="w-full rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: "rgba(184,134,26,0.05)",
              border: "1px solid rgba(184,134,26,0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(184,134,26,0.12)" }}
              >
                <svg viewBox="0 0 24 24" fill="var(--gold)" width={16} height={16}>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V21H8v2h8v-2h-3v-.06A9 9 0 0 0 21 12v-2h-2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>
                Message enregistré
              </p>
              <svg viewBox="0 0 24 24" fill="#16a34a" width={16} height={16} className="ml-auto">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <audio
              controls
              src={audioUrl}
              className="w-full"
              style={{ height: 36, accentColor: "var(--gold)" }}
            />
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm font-medium active:opacity-60 transition-opacity py-1"
            style={{ color: "var(--ink-muted)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
            Recommencer
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
