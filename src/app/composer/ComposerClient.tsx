"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { LiveAudioWaveform } from "@/components/ui/live-audio-waveform";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
type WizardStep = 1 | 2 | 3 | 4;
type RecordState = "idle" | "requesting" | "recording" | "uploading" | "done";

interface CardData {
  fromName: string;
  toName: string;
  date: string;
  occasion: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
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
    features: [
      "1 carte vocale personnalisée",
      "QR code unique",
      "Page d'écoute premium",
      "PDF imprimable",
      "Lien actif à vie",
    ],
    highlight: false,
    cardCount: 1,
  },
  {
    id: "coffret",
    name: "Le Coffret",
    price: 34.9,
    tagline: "Parfait pour une famille ou un événement.",
    features: [
      "5 cartes vocales",
      "5 QR codes uniques",
      "5 pages d'écoute",
      "5 PDF imprimables",
      "Support prioritaire",
    ],
    highlight: true,
    cardCount: 5,
  },
];

const STEP_LABELS = ["Votre carte", "Votre message", "Aperçu", "Formule"];

// ── Card Preview ─────────────────────────────────────────────────────────────
function CardPreview({ card }: { card: CardData }) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        width: 220,
        height: 140,
        background: "var(--ink)",
        boxShadow: "0 16px 48px rgba(28,20,16,0.28), 0 2px 8px rgba(28,20,16,0.12)",
      }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gold accent top line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

      {/* Top row */}
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
        <div>
          <p className="text-[7px] font-black tracking-[0.2em] uppercase" style={{ color: "rgba(240,232,216,0.35)" }}>
            N&apos;OUBLIE JAMAIS
          </p>
          <p className="text-[6px] tracking-widest mt-0.5" style={{ color: "var(--gold)", opacity: 0.7 }}>
            LA CARTE VOCALE
          </p>
        </div>
        <Logo size={18} />
      </div>

      {/* Main content */}
      <div className="absolute left-5 right-16 bottom-4">
        <p className="text-[7px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(240,232,216,0.4)" }}>
          Pour
        </p>
        <p
          className="text-[17px] font-black leading-tight truncate"
          style={{ color: "var(--cream)", fontFamily: "var(--font-playfair)" }}
        >
          {card.toName || "…"}
        </p>
        {card.fromName && (
          <p className="text-[8px] mt-0.5" style={{ color: "rgba(240,232,216,0.45)" }}>
            de {card.fromName}
          </p>
        )}
        {card.date && (
          <p className="text-[7px] mt-1" style={{ color: "var(--gold)", opacity: 0.7 }}>
            {card.date}
          </p>
        )}
      </div>

      {/* QR placeholder */}
      <div
        className="absolute bottom-4 right-4 rounded-lg flex items-center justify-center"
        style={{ width: 36, height: 36, border: "1px solid rgba(240,232,216,0.12)", background: "rgba(240,232,216,0.04)" }}
      >
        <svg viewBox="0 0 20 20" width={20} height={20} fill="none">
          <rect x="2" y="2" width="6" height="6" rx="1" stroke="rgba(240,232,216,0.25)" strokeWidth="1.2" />
          <rect x="12" y="2" width="6" height="6" rx="1" stroke="rgba(240,232,216,0.25)" strokeWidth="1.2" />
          <rect x="2" y="12" width="6" height="6" rx="1" stroke="rgba(240,232,216,0.25)" strokeWidth="1.2" />
          <path d="M12 12h3M12 15h1M15 15h3M12 18h3M17 15v3" stroke="rgba(240,232,216,0.25)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  );
}

// ── Listen Preview ────────────────────────────────────────────────────────────
function ListenPreview({ card, audioUrl }: { card: CardData; audioUrl: string }) {
  return (
    <div
      className="rounded-3xl w-full flex flex-col items-center gap-6 py-8 px-6"
      style={{
        background: "white",
        boxShadow: "0 8px 40px rgba(28,20,16,0.10)",
        border: "1px solid rgba(184,134,26,0.10)",
      }}
    >
      {/* Brand */}
      <div className="flex flex-col items-center gap-2">
        <Logo size={52} />
        <div className="text-center">
          <p className="text-[9px] font-black tracking-[0.22em] uppercase" style={{ color: "var(--ink)" }}>
            N&apos;OUBLIE JAMAIS
          </p>
          <p className="text-[7px] tracking-[0.16em] uppercase mt-0.5" style={{ color: "var(--gold)" }}>
            La carte vocale
          </p>
        </div>
      </div>

      {/* Sender badge */}
      {card.fromName && (
        <div
          className="px-4 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: "var(--cream)", color: "var(--gold)" }}
        >
          Message de {card.fromName}
        </div>
      )}

      {/* Names */}
      <div className="text-center">
        <h2
          className="text-[26px] font-black leading-tight"
          style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
        >
          Pour {card.toName || "…"}
        </h2>
        {card.date && (
          <p className="text-[12px] mt-1.5" style={{ color: "var(--ink-muted)" }}>
            {card.date}
          </p>
        )}
        {card.occasion && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--gold)" }}>
            {card.occasion}
          </p>
        )}
      </div>

      {/* Player */}
      {audioUrl && (
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.10)" }}
        >
          <div className="p-4">
            <LiveAudioWaveform src={audioUrl} />
          </div>
        </div>
      )}

      {/* Footer hint */}
      <p className="text-[10px] text-center" style={{ color: "rgba(28,20,16,0.3)" }}>
        Aperçu de votre page d&apos;écoute
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ComposerClient() {
  const [step, setStep] = useState<WizardStep>(1);
  const [card, setCard] = useState<CardData>({ fromName: "", toName: "", date: "", occasion: "" });

  // Audio
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [audioObjectUrl, setAudioObjectUrl] = useState<string>("");
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string>("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(32).fill(4));
  const [uploadError, setUploadError] = useState<string>("");

  // Checkout
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string>("");

  // Refs
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
    setUploadError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
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
          if (json.audioUrl) {
            setUploadedAudioUrl(json.audioUrl);
            setRecordState("done");
          } else {
            setUploadError("Échec de la sauvegarde. Réessayez.");
            setRecordState("idle");
          }
        } catch {
          setUploadError("Erreur réseau. Réessayez.");
          setRecordState("idle");
        }
      };

      mr.start();
      setRecordState("recording");
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);

      const animate = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        analyserRef.current.getByteFrequencyData(data);
        const heights = Array.from({ length: 32 }, (_, i) => {
          const val = data[Math.floor((i * data.length) / 32)];
          return Math.max(4, (val / 255) * 52);
        });
        setBarHeights(heights);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } catch {
      setRecordState("idle");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    cleanupRecording();
  };

  const resetRecording = () => {
    if (audioObjUrlRef.current) { URL.revokeObjectURL(audioObjUrlRef.current); audioObjUrlRef.current = ""; }
    setAudioObjectUrl("");
    setUploadedAudioUrl("");
    setRecordState("idle");
    setRecordingSeconds(0);
    setBarHeights(Array(32).fill(4));
    setUploadError("");
  };

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          fromName: card.fromName,
          toName: card.toName,
          date: card.date || "",
          occasion: card.occasion,
          audioUrl: uploadedAudioUrl,
        }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setCheckoutError("Erreur lors du paiement. Réessayez.");
        setCheckoutLoading(null);
      }
    } catch {
      setCheckoutError("Erreur réseau. Vérifiez votre connexion.");
      setCheckoutLoading(null);
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const goNext = () => setStep((s) => Math.min(4, s + 1) as WizardStep);
  const goPrev = () => setStep((s) => Math.max(1, s - 1) as WizardStep);

  const nextDisabled =
    (step === 1 && !step1Valid) ||
    (step === 2 && !step2Valid) ||
    step === 4;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
        <div
          className="max-w-3xl mx-auto flex items-center justify-between h-12 px-4 rounded-2xl"
          style={{
            background: "rgba(240,232,216,0.94)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(184,134,26,0.14)",
          }}
        >
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size={24} />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase hidden sm:block" style={{ color: "var(--ink)" }}>
              N&apos;OUBLIE JAMAIS
            </span>
          </Link>

          {/* Step dots */}
          <div className="flex items-center gap-1">
            {([1, 2, 3, 4] as WizardStep[]).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className="rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    width: step === s ? 24 : 20,
                    height: step === s ? 24 : 20,
                    background:
                      step > s
                        ? "linear-gradient(135deg, var(--gold-light), var(--gold-dark))"
                        : step === s
                        ? "var(--ink)"
                        : "rgba(28,20,16,0.10)",
                    fontSize: 9,
                    fontWeight: 800,
                    color: step >= s ? "white" : "var(--ink-muted)",
                    boxShadow: step === s ? "0 2px 8px rgba(28,20,16,0.25)" : "none",
                  }}
                >
                  {step > s ? (
                    <svg viewBox="0 0 12 12" fill="none" width={8} height={8}>
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 4 && (
                  <div
                    className="h-px transition-all duration-300"
                    style={{ width: 16, background: step > s ? "var(--gold)" : "rgba(28,20,16,0.12)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <span className="text-[11px] font-semibold hidden sm:block" style={{ color: "var(--ink-muted)" }}>
            {STEP_LABELS[step - 1]}
          </span>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 pt-24 pb-28 px-5 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── STEP 1 — Design ──────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="mb-8">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "var(--gold)" }}>
                  Étape 1 · 4
                </p>
                <h1
                  className="text-[28px] font-black leading-tight"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Personnalisez votre carte.
                </h1>
                <p className="text-[13px] mt-2" style={{ color: "var(--ink-muted)" }}>
                  Ces informations apparaîtront sur votre page d&apos;écoute.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="flex flex-col gap-5">
                  {/* fromName */}
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--ink-muted)" }}>
                      De la part de *
                    </span>
                    <input
                      type="text"
                      placeholder="Votre prénom ou nom"
                      value={card.fromName}
                      onChange={(e) => setCard((c) => ({ ...c, fromName: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl text-[14px] font-medium outline-none transition-all"
                      style={{
                        background: "white",
                        border: `1.5px solid ${card.fromName ? "var(--gold)" : "rgba(28,20,16,0.12)"}`,
                        color: "var(--ink)",
                        boxShadow: card.fromName ? "0 0 0 3px rgba(184,134,26,0.08)" : "none",
                      }}
                    />
                  </label>

                  {/* toName */}
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--ink-muted)" }}>
                      Pour *
                    </span>
                    <input
                      type="text"
                      placeholder="Prénom du destinataire"
                      value={card.toName}
                      onChange={(e) => setCard((c) => ({ ...c, toName: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl text-[14px] font-medium outline-none transition-all"
                      style={{
                        background: "white",
                        border: `1.5px solid ${card.toName ? "var(--gold)" : "rgba(28,20,16,0.12)"}`,
                        color: "var(--ink)",
                        boxShadow: card.toName ? "0 0 0 3px rgba(184,134,26,0.08)" : "none",
                      }}
                    />
                  </label>

                  {/* date */}
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--ink-muted)" }}>
                      Date ou occasion
                    </span>
                    <input
                      type="text"
                      placeholder="ex : Notre mariage · 25 juin 2026"
                      value={card.date}
                      onChange={(e) => setCard((c) => ({ ...c, date: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl text-[14px] font-medium outline-none transition-all"
                      style={{
                        background: "white",
                        border: `1.5px solid ${card.date ? "var(--gold)" : "rgba(28,20,16,0.12)"}`,
                        color: "var(--ink)",
                        boxShadow: card.date ? "0 0 0 3px rgba(184,134,26,0.08)" : "none",
                      }}
                    />
                  </label>

                  {/* Occasion chips */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--ink-muted)" }}>
                      Type d&apos;occasion
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o.label}
                          type="button"
                          onClick={() =>
                            setCard((c) => ({ ...c, occasion: c.occasion === o.label ? "" : o.label }))
                          }
                          className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                          style={{
                            background:
                              card.occasion === o.label
                                ? "linear-gradient(135deg, var(--gold-light), var(--gold-dark))"
                                : "white",
                            color: card.occasion === o.label ? "white" : "var(--ink)",
                            border: `1.5px solid ${card.occasion === o.label ? "transparent" : "rgba(28,20,16,0.10)"}`,
                            boxShadow: card.occasion === o.label ? "0 2px 8px rgba(184,134,26,0.22)" : "none",
                          }}
                        >
                          {o.emoji} {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card preview */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <CardPreview card={card} />
                    <p className="text-[10px]" style={{ color: "rgba(28,20,16,0.35)" }}>
                      Aperçu de votre carte physique
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 — Recording ───────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-10">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "var(--gold)" }}>
                  Étape 2 · 4
                </p>
                <h1
                  className="text-[28px] font-black leading-tight"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Enregistrez votre message.
                </h1>
                <p className="text-[13px] mt-2 max-w-xs mx-auto" style={{ color: "var(--ink-muted)" }}>
                  Parlez depuis le cœur.{card.toName ? ` ${card.toName} ` : " Votre destinataire "}
                  l&apos;écoutera pour toujours.
                </p>
              </div>

              <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                  {/* Idle */}
                  {recordState === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-7"
                    >
                      <div className="flex items-end justify-center gap-0.5 h-14">
                        {Array.from({ length: 32 }, (_, i) => (
                          <div
                            key={i}
                            className="rounded-full"
                            style={{ width: 3, height: 4 + Math.sin(i * 0.9) * 3, background: "rgba(28,20,16,0.10)" }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{
                          background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                          boxShadow: "0 8px 32px rgba(184,134,26,0.38)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" width={28} height={28} fill="none">
                          <rect x="9" y="2" width="6" height="13" rx="3" fill="white" />
                          <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 18v4M9 22h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
                        Appuyez pour commencer
                      </p>
                      {uploadError && (
                        <p className="text-[12px]" style={{ color: "#C0392B" }}>{uploadError}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Requesting permission */}
                  {recordState === "requesting" && (
                    <motion.div
                      key="requesting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4 py-10"
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 animate-spin"
                        style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                      />
                      <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
                        Autorisation microphone…
                      </p>
                    </motion.div>
                  )}

                  {/* Recording */}
                  {recordState === "recording" && (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-7"
                    >
                      <div className="flex items-end justify-center gap-0.5 h-14">
                        {barHeights.map((h, i) => (
                          <div
                            key={i}
                            className="rounded-full transition-all"
                            style={{ width: 3, height: h, background: "#C0392B", transitionDuration: "60ms" }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span
                          className="text-[14px] font-black tracking-[0.15em]"
                          style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}
                        >
                          REC {formatTime(recordingSeconds)}
                        </span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-8 py-3.5 rounded-full font-bold text-[14px] text-white transition-all active:scale-95"
                        style={{ background: "#C0392B", boxShadow: "0 4px 16px rgba(192,57,43,0.32)" }}
                      >
                        Arrêter l&apos;enregistrement
                      </button>
                    </motion.div>
                  )}

                  {/* Uploading */}
                  {recordState === "uploading" && (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4 py-10"
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 animate-spin"
                        style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                      />
                      <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
                        Sauvegarde en cours…
                      </p>
                    </motion.div>
                  )}

                  {/* Done */}
                  {recordState === "done" && audioObjectUrl && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="flex flex-col items-center gap-6"
                    >
                      {/* Check */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                          boxShadow: "0 4px 16px rgba(184,134,26,0.32)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                          <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>

                      {/* Player */}
                      <div
                        className="w-full rounded-2xl overflow-hidden"
                        style={{ background: "white", boxShadow: "0 4px 20px rgba(28,20,16,0.08)" }}
                      >
                        <div className="p-4">
                          <LiveAudioWaveform src={audioObjectUrl} />
                        </div>
                      </div>

                      <button
                        onClick={resetRecording}
                        className="text-[12px] font-semibold px-4 py-2 rounded-full transition-all"
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

          {/* ── STEP 3 — Preview ─────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 text-center">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "var(--gold)" }}>
                  Étape 3 · 4
                </p>
                <h1
                  className="text-[28px] font-black leading-tight"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Voici votre carte.
                </h1>
                <p className="text-[13px] mt-2" style={{ color: "var(--ink-muted)" }}>
                  C&apos;est exactement ce que {card.toName || "votre destinataire"} verra en scannant le QR code.
                </p>
              </div>

              <div className="w-full max-w-sm">
                <ListenPreview card={card} audioUrl={audioObjectUrl} />
              </div>
            </motion.div>
          )}

          {/* ── STEP 4 — Plan ────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="mb-8 text-center">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "var(--gold)" }}>
                  Étape 4 · 4
                </p>
                <h1
                  className="text-[28px] font-black leading-tight"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
                >
                  Choisissez votre formule.
                </h1>
                <p className="text-[13px] mt-2" style={{ color: "var(--ink-muted)" }}>
                  Paiement sécurisé · Accès immédiat après confirmation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                {PLANS.map((plan) => (
                  <motion.div
                    key={plan.id}
                    className="flex-1 rounded-2xl p-6 flex flex-col"
                    style={{
                      background: plan.highlight ? "var(--ink)" : "white",
                      border: plan.highlight ? "none" : "1.5px solid rgba(28,20,16,0.10)",
                      boxShadow: plan.highlight
                        ? "0 16px 48px rgba(28,20,16,0.20)"
                        : "0 4px 20px rgba(28,20,16,0.06)",
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
                  >
                    {plan.highlight && (
                      <div
                        className="text-[9px] font-black tracking-[0.18em] uppercase mb-4 px-3 py-1.5 rounded-full self-start"
                        style={{
                          background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                          color: "white",
                        }}
                      >
                        Le plus populaire
                      </div>
                    )}
                    <p
                      className="text-[20px] font-black mb-1"
                      style={{
                        color: plan.highlight ? "var(--cream)" : "var(--ink)",
                        fontFamily: "var(--font-playfair)",
                      }}
                    >
                      {plan.name}
                    </p>
                    <p
                      className="text-[11px] mb-4"
                      style={{ color: plan.highlight ? "rgba(240,232,216,0.45)" : "var(--ink-muted)" }}
                    >
                      {plan.tagline}
                    </p>
                    <p
                      className="text-[30px] font-black mb-5"
                      style={{ color: plan.highlight ? "var(--cream)" : "var(--ink)" }}
                    >
                      {plan.price.toFixed(2).replace(".", ",")}
                      <span className="text-[16px] font-semibold ml-1">€</span>
                    </p>
                    <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-[12px]"
                          style={{ color: plan.highlight ? "rgba(240,232,216,0.65)" : "var(--ink-muted)" }}
                        >
                          <svg viewBox="0 0 12 12" width={11} height={11} fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkoutLoading !== null}
                      className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all active:scale-95 disabled:opacity-50"
                      style={
                        plan.highlight
                          ? {
                              background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                              color: "white",
                              boxShadow: "0 4px 20px rgba(184,134,26,0.32)",
                            }
                          : {
                              background: "var(--ink)",
                              color: "var(--cream)",
                            }
                      }
                    >
                      {checkoutLoading === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span
                            className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
                          />
                          Redirection…
                        </span>
                      ) : (
                        `Choisir — ${plan.price.toFixed(2).replace(".", ",")} €`
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              {checkoutError && (
                <p className="text-center text-[12px] mt-4" style={{ color: "#C0392B" }}>
                  {checkoutError}
                </p>
              )}

              <p className="text-center text-[10px] mt-6" style={{ color: "rgba(28,20,16,0.35)" }}>
                🔒 Paiement sécurisé · Stripe · Visa · Mastercard · Apple Pay
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom Nav ────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-50">
        <div
          className="max-w-3xl mx-auto flex justify-between items-center px-5 py-3.5 rounded-2xl"
          style={{
            background: "rgba(240,232,216,0.96)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(184,134,26,0.14)",
          }}
        >
          {/* Back / Cancel */}
          {step > 1 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-muted)" }}
            >
              <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 4L6 8l4 4" />
              </svg>
              Retour
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-muted)" }}
            >
              <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 4L6 8l4 4" />
              </svg>
              Annuler
            </Link>
          )}

          {/* Progress label */}
          <span className="text-[10px] font-semibold" style={{ color: "rgba(28,20,16,0.4)" }}>
            {step} / 4
          </span>

          {/* Next */}
          {step < 4 && (
            <button
              onClick={goNext}
              disabled={nextDisabled}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                boxShadow: nextDisabled ? "none" : "0 4px 16px rgba(184,134,26,0.28)",
              }}
            >
              {step === 3 ? "Choisir ma formule" : "Continuer"}
              <svg viewBox="0 0 16 16" width={13} height={13} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
