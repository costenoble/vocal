"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { LiveAudioWaveform } from "@/components/ui/live-audio-waveform";
import Link from "next/link";
import { THEMES, getTheme, type ThemeId } from "@/lib/themes";

type WizardStep = 1 | 2 | 3 | 4;
type RecordState = "idle" | "requesting" | "recording" | "uploading" | "done";

interface CardData {
  fromName: string;
  toName: string;
  date: string;
  occasion: string;
  theme: ThemeId;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const OCCASIONS = [
  { emoji: "💒", label: "Mariage" },
  { emoji: "🎂", label: "Anniversaire" },
  { emoji: "🍼", label: "Naissance" },
  { emoji: "🎓", label: "Diplôme" },
  { emoji: "💼", label: "Retraite" },
  { emoji: "🫂", label: "Pour toujours" },
  { emoji: "🖤", label: "Deuil" },
  { emoji: "✨", label: "Autre" },
];

const PLANS = [
  {
    id: "carte",
    name: "La Carte",
    price: 14.9,
    tagline: "Un souvenir unique, pour toujours.",
    features: ["1 carte vocale personnalisée", "QR code unique", "Page d'écoute premium", "PDF imprimable", "Lien actif à vie"],
    highlight: false,
  },
  {
    id: "coffret",
    name: "Le Coffret",
    price: 34.9,
    tagline: "Parfait pour une famille ou un événement.",
    features: ["5 cartes vocales", "5 QR codes uniques", "5 pages d'écoute", "5 PDF imprimables", "Support prioritaire"],
    highlight: true,
  },
];

// ── Card Preview Component ────────────────────────────────────────────────────
function CardPreview({ card }: { card: CardData }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative rounded-[20px] overflow-hidden select-none"
        style={{
          width: 260,
          height: 164,
          background: "var(--ink)",
          boxShadow: "0 24px 60px rgba(28,20,16,0.32), 0 4px 12px rgba(28,20,16,0.14)",
          rotate: -2,
        }}
        animate={{ rotate: card.toName ? -2 : -3 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* Gold line top */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold) 60%, transparent 100%)" }} />

        {/* Top row */}
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
          <div>
            <p className="text-[7px] font-black tracking-[0.22em] uppercase" style={{ color: "rgba(240,232,216,0.30)" }}>
              N&apos;OUBLIE JAMAIS
            </p>
            <p className="text-[6px] tracking-widest mt-0.5" style={{ color: "var(--gold)", opacity: 0.65 }}>
              La carte vocale
            </p>
          </div>
          <Logo size={20} />
        </div>

        {/* Content */}
        <div className="absolute left-6 bottom-5" style={{ right: 60 }}>
          <p className="text-[7px] uppercase tracking-[0.14em] mb-0.5" style={{ color: "rgba(240,232,216,0.35)" }}>Pour</p>
          <motion.p
            key={card.toName}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="text-[20px] font-black leading-tight truncate"
            style={{ color: "var(--cream)", fontFamily: "var(--font-playfair)" }}
          >
            {card.toName || "…"}
          </motion.p>
          {card.fromName && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[8px] mt-0.5"
              style={{ color: "rgba(240,232,216,0.4)" }}
            >
              de {card.fromName}
            </motion.p>
          )}
          {card.date && (
            <p className="text-[7px] mt-1 truncate" style={{ color: "var(--gold)", opacity: 0.65 }}>
              {card.date}
            </p>
          )}
        </div>

        {/* QR placeholder */}
        <div
          className="absolute bottom-5 right-5 rounded-lg flex items-center justify-center"
          style={{ width: 40, height: 40, border: "1px solid rgba(240,232,216,0.10)", background: "rgba(240,232,216,0.04)" }}
        >
          <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1" stroke="rgba(240,232,216,0.20)" strokeWidth="1.2" />
            <rect x="12" y="2" width="6" height="6" rx="1" stroke="rgba(240,232,216,0.20)" strokeWidth="1.2" />
            <rect x="2" y="12" width="6" height="6" rx="1" stroke="rgba(240,232,216,0.20)" strokeWidth="1.2" />
            <path d="M12 12h3M12 15h1M15 15h3M12 18h3M17 15v3" stroke="rgba(240,232,216,0.20)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      <p className="text-[10px]" style={{ color: "rgba(28,20,16,0.3)" }}>Aperçu de votre carte</p>
    </div>
  );
}

// ── Simple audio player (no Web Audio API — reliable for blob URLs) ───────────
function SimplePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try { await audioRef.current.play(); setPlaying(true); } catch { /* denied */ }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
    setProgress(ratio);
  };

  return (
    <div className="flex flex-col gap-3">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (!el || !isFinite(el.duration) || el.duration === 0) return;
          setElapsed(el.currentTime);
          setProgress(el.currentTime / el.duration);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); setElapsed(0); }}
      />

      {/* Waveform placeholder bars */}
      <div className="flex items-end justify-center gap-[2.5px] w-full" style={{ height: 48 }} aria-hidden>
        {Array.from({ length: 40 }, (_, i) => {
          const isPlayed = i / 40 <= progress;
          const h = 18 + Math.abs(Math.sin(i * 0.8 + 1.2) * 22 + Math.cos(i * 0.4) * 10);
          return (
            <div key={i} className="flex-1 rounded-full" style={{ height: h, background: isPlayed ? "linear-gradient(to top, var(--gold-dark), var(--gold-light))" : "rgba(184,134,26,0.18)", minWidth: 2, maxWidth: 7 }} />
          );
        })}
      </div>

      {/* Seek bar */}
      <div role="slider" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}
        className="relative w-full rounded-full cursor-pointer" style={{ height: 3, background: "rgba(184,134,26,0.14)" }}
        onClick={handleSeek}
      >
        <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress * 100}%`, background: "var(--gold)" }} />
        {progress > 0 && (
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2" style={{ left: `calc(${progress * 100}% - 6px)`, background: "white", borderColor: "var(--gold)" }} />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: playing ? "0 0 0 6px rgba(184,134,26,0.12)" : "0 4px 14px rgba(184,134,26,0.25)" }}
          aria-label={playing ? "Pause" : "Lire"}
        >
          {playing
            ? <svg viewBox="0 0 24 24" fill="white" width={13} height={13}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            : <svg viewBox="0 0 24 24" fill="white" width={14} height={14}><path d="M8 5.14v14l11-7-11-7z"/></svg>
          }
        </button>
        <div className="flex items-center justify-between flex-1">
          <span className="text-[11px] tabular-nums font-medium" style={{ color: "var(--gold)" }}>{fmt(elapsed)}</span>
          <span className="text-[11px] tabular-nums" style={{ color: "var(--ink-muted)", opacity: 0.5 }}>{duration > 0 ? fmt(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Theme Selector Component ──────────────────────────────────────────────────
function ThemeSelector({ selected, onChange }: { selected: ThemeId; onChange: (id: ThemeId) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--ink-muted)" }}>
        Design de la page d&apos;écoute
      </span>
      <div className="grid grid-cols-4 gap-2.5">
        {THEMES.map((th) => {
          const active = selected === th.id;
          return (
            <button
              key={th.id}
              type="button"
              onClick={() => onChange(th.id as ThemeId)}
              className="relative flex flex-col items-center rounded-2xl overflow-hidden transition-all"
              style={{
                border: active ? `2px solid ${th.accent}` : "2px solid rgba(28,20,16,0.08)",
                boxShadow: active ? `0 0 0 3px ${th.accent}28, 0 6px 20px ${th.accent}22` : "none",
                transform: active ? "scale(1.04)" : "scale(1)",
                transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* Card preview fill */}
              <div className="w-full relative" style={{ paddingBottom: "72%", background: th.pageBg }}>
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0" style={{ height: 3, background: th.topBarGrad }} />
                {/* Mini card */}
                <div
                  className="absolute rounded-lg"
                  style={{
                    top: "22%", left: "12%", right: "12%", bottom: "14%",
                    background: th.cardBg,
                    border: `1px solid ${th.cardBorder}`,
                    boxShadow: th.cardShadow,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-1">
                    <div className="w-4/5 h-1 rounded-full" style={{ background: th.accent, opacity: 0.35 }} />
                    <div className="w-3/5 h-0.5 rounded-full" style={{ background: th.accent, opacity: 0.2 }} />
                  </div>
                </div>
                {/* Selected check */}
                {active && (
                  <div
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: th.accent }}
                  >
                    <svg viewBox="0 0 10 10" fill="none" width={8} height={8}>
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Label */}
              <div className="px-1 py-1.5 text-center" style={{ background: "white" }}>
                <p className="text-[9px] font-bold leading-none" style={{ color: active ? th.accent : "var(--ink-muted)" }}>
                  {th.emoji} {th.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Listen Preview Component ──────────────────────────────────────────────────
function ListenPreview({ card, audioUrl }: { card: CardData; audioUrl: string }) {
  const t = getTheme(card.theme);
  return (
    <motion.div
      key={card.theme}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden"
      style={{ boxShadow: t.cardShadow, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ background: t.topBarGrad }} />

      <div className="flex flex-col items-center gap-5 px-7 py-8" style={{ background: t.pageBg }}>
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <Logo size={56} />
          <div className="text-center">
            <p className="text-[8px] font-black tracking-[0.24em] uppercase" style={{ color: t.text }}>N&apos;OUBLIE JAMAIS</p>
            <p className="text-[7px] tracking-[0.18em] mt-0.5" style={{ color: t.accent }}>La carte vocale</p>
          </div>
        </div>

        {/* Sender */}
        {card.fromName && (
          <div className="px-4 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: t.accentBg, color: t.accent, border: `1px solid ${t.accentBorder}` }}>
            Un message de {card.fromName}
          </div>
        )}

        {/* Names */}
        <div className="text-center">
          <h2 className="text-[28px] font-black leading-tight" style={{ color: t.text, fontFamily: t.font }}>
            Pour {card.toName || "…"}
          </h2>
          {card.date && <p className="text-[12px] mt-1.5" style={{ color: t.textMuted }}>{card.date}</p>}
          {card.occasion && <p className="text-[11px] font-semibold mt-0.5" style={{ color: t.accent }}>{card.occasion}</p>}
        </div>

        {/* Player */}
        <div className="w-full rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.accentBorder}` }}>
          <div className="p-4">
            <LiveAudioWaveform src={audioUrl || undefined} demo={!audioUrl} barPlayed={t.barPlayed} barIdle={t.barIdle} progressBg={t.progressBg} accentColor={t.accent} />
          </div>
        </div>

        <p className="text-[9px] tracking-wide" style={{ color: t.textMuted, opacity: 0.5 }}>
          APERÇU · PAGE D&apos;ÉCOUTE
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function ComposerClient() {
  const [step, setStep] = useState<WizardStep>(1);
  const [card, setCard] = useState<CardData>({ fromName: "", toName: "", date: "", occasion: "", theme: "classique" });
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [audioObjectUrl, setAudioObjectUrl] = useState<string>("");
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string>("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(32).fill(4));
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioObjUrlRef = useRef<string>("");

  const step1Valid = card.fromName.trim().length > 0 && card.toName.trim().length > 0;
  const step2Valid = uploadedAudioUrl.length > 0;

  const cleanupRecording = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioObjUrlRef.current) URL.revokeObjectURL(audioObjUrlRef.current);
    };
  }, [cleanupRecording]);

  const startRecording = async () => {
    setRecordState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;
      analyserRef.current = analyser;
      audioCtx.createMediaStreamSource(stream).connect(analyser);

      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const objUrl = URL.createObjectURL(blob);
        audioObjUrlRef.current = objUrl;
        setAudioObjectUrl(objUrl);
        setRecordState("uploading");

        try {
          const fd = new FormData();
          fd.append("audio", blob, "message.webm");
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const json = await res.json();
          setUploadedAudioUrl(json.audioUrl ?? objUrl);
        } catch {
          setUploadedAudioUrl(objUrl);
        }
        setRecordState("done");
      };

      mr.start();
      setRecordState("recording");
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);

      const animate = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        analyserRef.current.getByteFrequencyData(data);
        setBarHeights(Array.from({ length: 32 }, (_, i) => Math.max(4, (data[Math.floor((i * data.length) / 32)] / 255) * 52)));
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } catch {
      setRecordState("idle");
    }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); cleanupRecording(); };
  const resetRecording = () => {
    if (audioObjUrlRef.current) { URL.revokeObjectURL(audioObjUrlRef.current); audioObjUrlRef.current = ""; }
    setAudioObjectUrl("");
    setUploadedAudioUrl("");
    setRecordState("idle");
    setRecordingSeconds(0);
    setBarHeights(Array(32).fill(4));
  };

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, fromName: card.fromName, toName: card.toName, date: card.date || "", occasion: card.occasion, audioUrl: uploadedAudioUrl, theme: card.theme }),
      });
      const json = await res.json();
      if (json.url) { window.location.href = json.url; }
      else { setCheckoutError("Erreur lors du paiement. Réessayez."); setCheckoutLoading(null); }
    } catch {
      setCheckoutError("Erreur réseau. Vérifiez votre connexion.");
      setCheckoutLoading(null);
    }
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const goNext = () => setStep((s) => Math.min(4, s + 1) as WizardStep);
  const goPrev = () => setStep((s) => Math.max(1, s - 1) as WizardStep);
  const nextDisabled = (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || step === 4;

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)", overflowX: "hidden" }}>

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
        <div
          className="max-w-4xl mx-auto flex items-center justify-between h-13 px-5 rounded-2xl"
          style={{ background: "rgba(240,232,216,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(184,134,26,0.14)", height: 52 }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[9px] font-black tracking-[0.22em] uppercase hidden sm:block" style={{ color: "var(--ink)" }}>
              N&apos;OUBLIE JAMAIS
            </span>
          </Link>

          {/* Step pills */}
          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4] as WizardStep[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="rounded-full flex items-center justify-center transition-all duration-400"
                  style={{
                    width: step === s ? 28 : 22,
                    height: step === s ? 28 : 22,
                    background: step > s
                      ? "linear-gradient(135deg, var(--gold-light), var(--gold-dark))"
                      : step === s ? "var(--ink)" : "rgba(28,20,16,0.08)",
                    fontSize: 10,
                    fontWeight: 800,
                    color: step >= s ? "white" : "rgba(28,20,16,0.35)",
                    boxShadow: step === s ? "0 2px 10px rgba(28,20,16,0.22)" : "none",
                    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  {step > s ? (
                    <svg viewBox="0 0 12 12" fill="none" width={9} height={9}>
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : s}
                </div>
                {s < 4 && <div className="h-px transition-all duration-300" style={{ width: 18, background: step > s ? "var(--gold)" : "rgba(28,20,16,0.10)", transitionDuration: "0.3s" }} />}
              </div>
            ))}
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "var(--gold)" }}>
              {step} / 4
            </p>
            <p className="text-[11px] font-semibold" style={{ color: "var(--ink)" }}>
              {["Votre carte", "Votre message", "Aperçu", "Formule"][step - 1]}
            </p>
          </div>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div className="pt-19 pb-36 px-5 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════════════════
              STEP 1 — Personnalisation
          ════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="pt-10"
            >
              {/* Hero */}
              <div className="mb-10">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>
                  Étape 1 · Votre carte
                </p>
                <h1
                  className="text-[36px] sm:text-[44px] font-black leading-[1.05]"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Personnalisez<br />votre carte.
                </h1>
                <p className="text-[14px] mt-3" style={{ color: "var(--ink-muted)", maxWidth: 380 }}>
                  Ces informations apparaîtront sur votre page d&apos;écoute, visible à chaque scan du QR code.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
                {/* Form column */}
                <div className="flex flex-col gap-6">

                  {/* fromName + toName side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--ink-muted)" }}>
                        De la part de *
                      </span>
                      <input
                        type="text"
                        placeholder="Votre prénom"
                        value={card.fromName}
                        onChange={(e) => setCard((c) => ({ ...c, fromName: e.target.value }))}
                        className="w-full px-4 py-3.5 rounded-xl text-[14px] font-medium outline-none"
                        style={{
                          background: "white",
                          border: `1.5px solid ${card.fromName ? "var(--gold)" : "rgba(28,20,16,0.12)"}`,
                          color: "var(--ink)",
                          boxShadow: card.fromName ? "0 0 0 3px rgba(184,134,26,0.10)" : "none",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--ink-muted)" }}>
                        Pour *
                      </span>
                      <input
                        type="text"
                        placeholder="Destinataire"
                        value={card.toName}
                        onChange={(e) => setCard((c) => ({ ...c, toName: e.target.value }))}
                        className="w-full px-4 py-3.5 rounded-xl text-[14px] font-medium outline-none"
                        style={{
                          background: "white",
                          border: `1.5px solid ${card.toName ? "var(--gold)" : "rgba(28,20,16,0.12)"}`,
                          color: "var(--ink)",
                          boxShadow: card.toName ? "0 0 0 3px rgba(184,134,26,0.10)" : "none",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      />
                    </label>
                  </div>

                  {/* Date */}
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--ink-muted)" }}>
                      Date ou occasion
                    </span>
                    <input
                      type="text"
                      placeholder="ex : Notre mariage · 25 juin 2026"
                      value={card.date}
                      onChange={(e) => setCard((c) => ({ ...c, date: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl text-[14px] font-medium outline-none"
                      style={{
                        background: "white",
                        border: `1.5px solid ${card.date ? "var(--gold)" : "rgba(28,20,16,0.12)"}`,
                        color: "var(--ink)",
                        boxShadow: card.date ? "0 0 0 3px rgba(184,134,26,0.10)" : "none",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  </label>

                  {/* Occasion chips */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--ink-muted)" }}>
                      Type d&apos;occasion
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => {
                        const active = card.occasion === o.label;
                        return (
                          <button
                            key={o.label}
                            type="button"
                            onClick={() => setCard((c) => ({ ...c, occasion: active ? "" : o.label }))}
                            className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                            style={{
                              background: active ? "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" : "white",
                              color: active ? "white" : "var(--ink)",
                              border: `1.5px solid ${active ? "transparent" : "rgba(28,20,16,0.10)"}`,
                              boxShadow: active ? "0 2px 10px rgba(184,134,26,0.24)" : "none",
                            }}
                          >
                            {o.emoji} {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Theme selector */}
                  <ThemeSelector selected={card.theme} onChange={(id) => setCard((c) => ({ ...c, theme: id }))} />

                  {/* Mobile preview */}
                  <div className="lg:hidden pt-2">
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--ink-muted)" }}>
                      Aperçu en temps réel
                    </p>
                    <ListenPreview card={card} audioUrl="" />
                  </div>
                </div>

                {/* Live preview — desktop sticky */}
                <div className="hidden lg:block sticky top-24">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-4 text-center" style={{ color: "var(--ink-muted)" }}>
                    Aperçu en temps réel
                  </p>
                  <ListenPreview card={card} audioUrl="" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 2 — Enregistrement
          ════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="pt-10 flex flex-col items-center text-center"
            >
              <div className="mb-12">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>
                  Étape 2 · Votre message
                </p>
                <h1
                  className="text-[36px] sm:text-[44px] font-black leading-[1.05]"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Enregistrez<br />votre message.
                </h1>
                <p className="text-[14px] mt-3" style={{ color: "var(--ink-muted)" }}>
                  Parlez depuis le cœur.{" "}
                  {card.toName ? <><strong style={{ color: "var(--ink)" }}>{card.toName}</strong> l&apos;écoutera pour toujours.</> : "Votre destinataire l'écoutera pour toujours."}
                </p>
              </div>

              <div className="w-full max-w-md">
                <AnimatePresence mode="wait">

                  {/* Idle */}
                  {recordState === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8">
                      {/* Static bars */}
                      <div className="flex items-end justify-center gap-1 h-16 w-full max-w-xs mx-auto">
                        {Array.from({ length: 32 }, (_, i) => (
                          <div key={i} className="rounded-full" style={{ width: 4, height: 4 + Math.sin(i * 0.9 + 1) * 4 + Math.cos(i * 0.4) * 2, background: "rgba(28,20,16,0.08)" }} />
                        ))}
                      </div>

                      {/* Mic button */}
                      <button
                        onClick={startRecording}
                        className="relative w-24 h-24 rounded-full flex items-center justify-center transition-transform active:scale-95 group"
                        style={{ background: "linear-gradient(145deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 12px 40px rgba(184,134,26,0.40)" }}
                      >
                        <svg viewBox="0 0 24 24" width={32} height={32} fill="none">
                          <rect x="9" y="2" width="6" height="13" rx="3" fill="white" />
                          <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 18v4M9 22h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <p className="text-[14px] font-medium" style={{ color: "var(--ink-muted)" }}>
                        Appuyez pour commencer
                      </p>
                    </motion.div>
                  )}

                  {/* Requesting */}
                  {recordState === "requesting" && (
                    <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-12">
                      <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                      <p className="text-[14px]" style={{ color: "var(--ink-muted)" }}>Autorisation microphone…</p>
                    </motion.div>
                  )}

                  {/* Recording */}
                  {recordState === "recording" && (
                    <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8">
                      {/* Live bars */}
                      <div className="flex items-end justify-center gap-1 h-16 w-full max-w-xs mx-auto">
                        {barHeights.map((h, i) => (
                          <div key={i} className="rounded-full" style={{ width: 4, height: h, background: "#C0392B", transition: "height 60ms" }} />
                        ))}
                      </div>

                      {/* Timer with pulsing ring */}
                      <div className="relative flex items-center justify-center">
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#C0392B", animationDuration: "1.4s" }} />
                        <div className="absolute rounded-full" style={{ inset: -8, border: "1.5px solid rgba(192,57,43,0.25)", borderRadius: "50%" }} />
                        <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ background: "rgba(192,57,43,0.08)", border: "2px solid rgba(192,57,43,0.20)" }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold tracking-widest" style={{ color: "#C0392B" }}>REC</span>
                          </div>
                          <span className="text-[28px] font-black tabular-nums leading-none" style={{ color: "var(--ink)" }}>
                            {fmt(recordingSeconds)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={stopRecording}
                        className="px-10 py-4 rounded-full font-bold text-[14px] text-white transition-all active:scale-95"
                        style={{ background: "#C0392B", boxShadow: "0 6px 24px rgba(192,57,43,0.36)" }}
                      >
                        Arrêter l&apos;enregistrement
                      </button>
                    </motion.div>
                  )}

                  {/* Uploading */}
                  {recordState === "uploading" && (
                    <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 py-12">
                      <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                      <p className="text-[14px]" style={{ color: "var(--ink-muted)" }}>Sauvegarde en cours…</p>
                    </motion.div>
                  )}

                  {/* Done */}
                  {recordState === "done" && audioObjectUrl && (
                    <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col items-center gap-6">
                      {/* Check */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 20px rgba(184,134,26,0.32)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" width={22} height={22}>
                          <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>

                      <p className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>Message enregistré ✓</p>

                      {/* Player */}
                      <div className="w-full rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 6px 24px rgba(28,20,16,0.08)" }}>
                        <div className="p-5">
                          <SimplePlayer src={audioObjectUrl} />
                        </div>
                      </div>

                      <button
                        onClick={resetRecording}
                        className="text-[12px] font-semibold px-5 py-2 rounded-full transition-all"
                        style={{ border: "1.5px solid rgba(28,20,16,0.12)", color: "var(--ink-muted)" }}
                      >
                        Ré-enregistrer
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 3 — Aperçu
          ════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="pt-10 flex flex-col items-center"
            >
              <div className="mb-10 text-center">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>
                  Étape 3 · Aperçu
                </p>
                <h1
                  className="text-[36px] sm:text-[44px] font-black leading-[1.05]"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Voici votre carte.
                </h1>
                <p className="text-[14px] mt-3" style={{ color: "var(--ink-muted)", maxWidth: 340 }}>
                  C&apos;est exactement ce que <strong style={{ color: "var(--ink)" }}>{card.toName || "votre destinataire"}</strong> verra en scannant le QR code.
                </p>
              </div>

              <ListenPreview card={card} audioUrl={audioObjectUrl} />
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 4 — Formule
          ════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="pt-10"
            >
              <div className="mb-10 text-center">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>
                  Étape 4 · Votre formule
                </p>
                <h1
                  className="text-[36px] sm:text-[44px] font-black leading-[1.05]"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Choisissez<br />votre formule.
                </h1>
                <p className="text-[14px] mt-3" style={{ color: "var(--ink-muted)" }}>
                  Paiement sécurisé · Accès immédiat après confirmation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 max-w-xl mx-auto">
                {PLANS.map((plan) => (
                  <motion.div
                    key={plan.id}
                    className="flex-1 rounded-2xl flex flex-col overflow-hidden"
                    style={{
                      background: plan.highlight ? "var(--ink)" : "white",
                      border: plan.highlight ? "none" : "1.5px solid rgba(28,20,16,0.10)",
                      boxShadow: plan.highlight ? "0 20px 56px rgba(28,20,16,0.22)" : "0 4px 20px rgba(28,20,16,0.06)",
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
                  >
                    {plan.highlight && (
                      <div className="py-2.5 text-center" style={{ background: "linear-gradient(90deg, var(--gold-light), var(--gold-dark))" }}>
                        <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white">✦ Le plus populaire</span>
                      </div>
                    )}

                    <div className="p-7 flex flex-col flex-1 gap-1">
                      <p className="text-[22px] font-black" style={{ color: plan.highlight ? "var(--cream)" : "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                        {plan.name}
                      </p>
                      <p className="text-[11px] mb-5" style={{ color: plan.highlight ? "rgba(240,232,216,0.45)" : "var(--ink-muted)" }}>
                        {plan.tagline}
                      </p>

                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-[38px] font-black leading-none" style={{ color: plan.highlight ? "var(--cream)" : "var(--ink)" }}>
                          {plan.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-[16px] font-semibold" style={{ color: plan.highlight ? "rgba(240,232,216,0.6)" : "var(--ink-muted)" }}>€</span>
                      </div>

                      <ul className="flex flex-col gap-3 mb-7 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-[12px]" style={{ color: plan.highlight ? "rgba(240,232,216,0.65)" : "var(--ink-muted)" }}>
                            <svg viewBox="0 0 12 12" width={11} height={11} fill="none">
                              <path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading !== null}
                        className="w-full py-4 rounded-xl font-bold text-[14px] transition-all active:scale-95 disabled:opacity-50"
                        style={plan.highlight
                          ? { background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", color: "white", boxShadow: "0 4px 20px rgba(184,134,26,0.32)" }
                          : { background: "var(--ink)", color: "var(--cream)" }
                        }
                      >
                        {checkoutLoading === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                            Redirection…
                          </span>
                        ) : (
                          `Choisir — ${plan.price.toFixed(2).replace(".", ",")} €`
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {checkoutError && (
                <p className="text-center text-[12px] mt-4" style={{ color: "#C0392B" }}>{checkoutError}</p>
              )}

              <p className="text-center text-[11px] mt-7" style={{ color: "rgba(28,20,16,0.32)" }}>
                🔒 Paiement sécurisé · Stripe · Visa · Mastercard · Apple Pay
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom nav ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-50">
        <div
          className="max-w-4xl mx-auto flex justify-between items-center px-6 py-4 rounded-2xl"
          style={{
            background: "rgba(240,232,216,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(184,134,26,0.14)",
            boxShadow: "0 -4px 24px rgba(28,20,16,0.06)",
          }}
        >
          {step > 1 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-60"
              style={{ color: "var(--ink-muted)" }}
            >
              <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 4L6 8l4 4" />
              </svg>
              Retour
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-60" style={{ color: "var(--ink-muted)" }}>
              <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 4L6 8l4 4" />
              </svg>
              Annuler
            </Link>
          )}

          {/* Hint text center */}
          <p className="text-[10px] font-medium hidden sm:block" style={{ color: "rgba(28,20,16,0.35)" }}>
            {step === 1 && !step1Valid && "Renseignez les prénoms pour continuer"}
            {step === 1 && step1Valid && "Prêt à enregistrer votre message"}
            {step === 2 && !step2Valid && "Enregistrez votre message vocal"}
            {step === 2 && step2Valid && "Message enregistré avec succès"}
            {step === 3 && "Ça vous convient ? Choisissez votre formule"}
            {step === 4 && "Paiement 100 % sécurisé par Stripe"}
          </p>

          {step < 4 && (
            <button
              onClick={goNext}
              disabled={nextDisabled}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                boxShadow: nextDisabled ? "none" : "0 4px 18px rgba(184,134,26,0.30)",
              }}
            >
              {step === 3 ? "Choisir ma formule" : "Continuer"}
              <svg viewBox="0 0 16 16" width={13} height={13} fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
