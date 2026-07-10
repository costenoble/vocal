"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveAudioWaveform } from "@/components/ui/live-audio-waveform";
import Logo from "@/components/Logo";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;
const BAR_COUNT = 48;

type Step = "idle" | "recording" | "done";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function staticHeight(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return Math.abs(x - Math.floor(x)) * 0.45 + 0.08;
}

const IDLE_BARS = Array.from({ length: BAR_COUNT }, (_, i) => staticHeight(i));

export default function DemoClient() {
  const [step, setStep] = useState<Step>("idle");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [micBars, setMicBars] = useState<number[]>(IDLE_BARS);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micRafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Mic visualisation tick ── */
  const tickMic = useCallback(() => {
    if (!micAnalyserRef.current) return;
    const data = new Uint8Array(micAnalyserRef.current.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    micAnalyserRef.current.getByteFrequencyData(data);
    const step = data.length / BAR_COUNT;
    setMicBars(
      Array.from({ length: BAR_COUNT }, (_, i) =>
        Math.max(0.05, data[Math.floor(i * step)] / 255)
      )
    );
    micRafRef.current = requestAnimationFrame(tickMic);
  }, []);

  /* ── Start recording ── */
  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Wire up analyser for live visualisation
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      micCtxRef.current = ctx;
      micAnalyserRef.current = analyser;
      tickMic();

      // Start recording — laisser le navigateur choisir son format natif
      // (Safari/iOS enregistre en MP4/AAC, pas en WebM) et le respecter pour
      // le blob final, sinon le lecteur ne peut pas décoder l'audio ensuite.
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const recordedType = recorder.mimeType || "audio/webm";
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recordedType });
        setAudioUrl(URL.createObjectURL(blob));
        setStep("done");
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;

      setElapsed(0);
      setStep("recording");
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setError("Microphone inaccessible. Autorisez l'accès dans votre navigateur.");
    }
  }, [tickMic]);

  /* ── Stop recording ── */
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(micRafRef.current);
    micCtxRef.current?.close();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  /* ── Restart ── */
  const restart = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setElapsed(0);
    setMicBars(IDLE_BARS);
    setStep("idle");
  }, [audioUrl]);

  /* ── Cleanup ── */
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(micRafRef.current);
    micCtxRef.current?.close();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "var(--cream)" }}>
      {/* Demo banner */}
      <div
        className="text-center py-2.5 px-5 shrink-0"
        style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" }}
      >
        <p className="text-[11px] font-bold text-white tracking-wide">
          ✦ Démo interactive — essayez gratuitement ·{" "}
          <Link href="/boutique" className="underline opacity-90 font-black">
            Créer ma vraie carte
          </Link>
        </p>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 420, height: 320, background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: 280, height: 280, background: "radial-gradient(ellipse, rgba(184,134,26,0.07) 0%, transparent 70%)", filter: "blur(30px)" }} />

        <div className="relative w-full max-w-sm mx-auto flex flex-col px-6 py-10 gap-0">
          {/* Logo + brand */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col items-center gap-3 mb-6 float-logo"
          >
            <Logo size={96} />
            <div className="text-center">
              <h1 className="text-[20px] font-black tracking-[0.22em] uppercase" style={{ color: "var(--ink)" }}>
                N&rsquo;OUBLIE JAMAIS
              </h1>
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-shimmer mt-0.5">
                LES ÉMOTIONS PRENNENT UNE VOIX
              </p>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
            className="w-full rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 48px rgba(184,134,26,0.12), 0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid rgba(184,134,26,0.14)",
            }}
          >
            <div style={{ height: 3, background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />

            <div className="flex flex-col items-center px-6 py-7 gap-5">
              {/* From / To */}
              <div className="flex items-center justify-around w-full gap-3">
                <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="flex flex-col items-center gap-0.5 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--ink-muted)" }}>De</span>
                  <span className="text-2xl font-semibold text-center" style={{ color: "var(--gold)", fontFamily: "var(--font-playfair)" }}>Sophie</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, type: "spring", stiffness: 400, damping: 16 }} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center heartbeat" style={{ background: "linear-gradient(135deg, rgba(184,134,26,0.15), rgba(184,134,26,0.08))", border: "1px solid rgba(184,134,26,0.2)" }}>
                    <svg viewBox="0 0 24 24" fill="var(--gold)" width={18} height={18}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="flex flex-col items-center gap-0.5 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--ink-muted)" }}>Pour</span>
                  <span className="text-2xl font-semibold text-center" style={{ color: "var(--gold)", fontFamily: "var(--font-playfair)" }}>Maman</span>
                </motion.div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: "rgba(184,134,26,0.08)", border: "1px solid rgba(184,134,26,0.18)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" width={12} height={12}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>25 juin 2026</span>
              </div>

              {/* Divider */}
              <div className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(184,134,26,0.25), transparent)" }} />

              {/* Audio section — switches between states */}
              <div className="w-full">
                <AnimatePresence mode="wait">

                  {/* ── IDLE ── */}
                  {step === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center" style={{ color: "var(--ink-muted)" }}>
                        Votre message vocal
                      </p>

                      {/* Static waveform preview */}
                      <div className="flex items-end justify-center gap-[2.5px] w-full" style={{ height: 48 }}>
                        {IDLE_BARS.map((h, i) => (
                          <div key={i} className="flex-1 rounded-full" style={{ height: `${Math.max(6, h * 100)}%`, background: "rgba(184,134,26,0.18)", minWidth: 2, maxWidth: 7 }} />
                        ))}
                      </div>

                      {error && (
                        <p className="text-[11px] text-center px-2" style={{ color: "#ef4444" }}>{error}</p>
                      )}

                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-[13px] tracking-wide transition-all active:scale-[0.97]"
                        style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", color: "white", boxShadow: "0 4px 16px rgba(184,134,26,0.28)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="white" width={15} height={15}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        Enregistrer votre message
                      </button>
                      <p className="text-[10px] text-center" style={{ color: "var(--ink-muted)", opacity: 0.6 }}>
                        Accès micro requis · aucun envoi de données
                      </p>
                    </motion.div>
                  )}

                  {/* ── RECORDING ── */}
                  {step === "recording" && (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center gap-4"
                    >
                      {/* Live waveform from mic */}
                      <div className="flex items-end justify-center gap-[2.5px] w-full" style={{ height: 56 }}>
                        {micBars.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full"
                            style={{
                              height: `${Math.max(6, h * 100)}%`,
                              background: "linear-gradient(to top, #dc2626, #ef4444)",
                              minWidth: 2,
                              maxWidth: 7,
                              transition: "height 60ms ease",
                            }}
                          />
                        ))}
                      </div>

                      {/* Timer + REC dot */}
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "heartbeat 1.2s ease-in-out infinite" }} />
                        <span className="text-[13px] font-mono font-bold tabular-nums" style={{ color: "#dc2626" }}>
                          REC {fmt(elapsed)}
                        </span>
                      </div>

                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[13px] border-2 transition-all active:scale-[0.97]"
                        style={{ borderColor: "#dc2626", color: "#dc2626" }}
                      >
                        <svg viewBox="0 0 24 24" fill="#dc2626" width={13} height={13}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                        Terminer l&rsquo;enregistrement
                      </button>
                    </motion.div>
                  )}

                  {/* ── DONE ── */}
                  {step === "done" && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4 w-full"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center" style={{ color: "var(--ink-muted)" }}>
                        Votre message vocal
                      </p>

                      <LiveAudioWaveform src={audioUrl} />

                      <div className="flex items-center justify-center gap-2 mt-1">
                        <button
                          onClick={restart}
                          className="text-[11px] font-medium flex items-center gap-1.5"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={12} height={12}><path d="M1 8a7 7 0 1 0 1.5-4.4M1 3v4h4"/></svg>
                          Recommencer
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div style={{ height: 3, background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col items-center gap-3 mt-8"
          >
            {step === "done" && (
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full flex flex-col items-center gap-2">
                <p className="text-[12px] text-center font-semibold" style={{ color: "var(--ink-muted)" }}>
                  Vous aimez ? Créez votre vraie carte avec QR code imprimable.
                </p>
                <Link
                  href="/boutique"
                  className="w-full py-4 rounded-2xl font-bold text-white text-center text-[14px] tracking-wide block transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 24px rgba(184,134,26,0.28)" }}
                >
                  Commander ma carte
                </Link>
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-8 h-px" style={{ background: "rgba(184,134,26,0.3)" }} />
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" width={14} height={14}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <div className="w-8 h-px" style={{ background: "rgba(184,134,26,0.3)" }} />
            </div>
            <p className="text-[11px] font-medium text-center" style={{ color: "var(--ink-muted)", opacity: 0.7 }}>
              Créé avec N&rsquo;OUBLIE JAMAIS
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
