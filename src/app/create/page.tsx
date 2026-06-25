"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioRecorder from "@/components/AudioRecorder";
import Logo from "@/components/Logo";
import Link from "next/link";

type Step = "record" | "details" | "success";

interface Result {
  slug: string;
  listenUrl: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: EASE },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.28, ease: EASE },
  }),
};

const STEPS: Step[] = ["record", "details", "success"];

export default function CreatePage() {
  const [step, setStep] = useState<Step>("record");
  const [dir, setDir] = useState(1);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const goTo = (next: Step, direction = 1) => {
    setDir(direction);
    setStep(next);
  };

  const handleRecorded = useCallback((blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
  }, []);

  const handleImported = useCallback((file: File, duration: number) => {
    setAudioBlob(file);
    setAudioDuration(duration);
  }, []);

  const goToDetails = () => {
    if (!audioBlob) {
      setError("Veuillez d'abord enregistrer ou importer un message audio.");
      return;
    }
    setError("");
    goTo("details", 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioBlob || !fromName.trim() || !toName.trim() || !date) return;
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      const ext = audioBlob instanceof File ? audioBlob.name.split(".").pop() || "webm" : "webm";
      fd.append("audio", audioBlob, `recording.${ext}`);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error("Erreur lors de l'upload audio");
      const { audioPath } = await uploadRes.json();

      const msgRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromName: fromName.trim(),
          toName: toName.trim(),
          date,
          audioPath,
          duration: Math.round(audioDuration),
        }),
      });
      if (!msgRes.ok) throw new Error("Erreur lors de la création");
      const { slug, listenUrl } = await msgRes.json();

      setResult({ slug, listenUrl });
      goTo("success", 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard?.writeText(result.listenUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "var(--cream)" }}
    >
      {/* Top glow */}
      <div
        className="fixed top-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,134,26,0.07) 0%, transparent 100%)",
        }}
      />

      <div className="relative w-full max-w-sm mx-auto px-5 py-8 flex flex-col gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <Logo size={72} />
          <div className="text-center">
            <h1
              className="text-lg font-black tracking-[0.2em] uppercase"
              style={{ color: "var(--ink)" }}
            >
              N&rsquo;OUBLIE JAMAIS
            </h1>
            <p
              className="text-[10px] font-semibold tracking-widest uppercase text-shimmer"
            >
              Créer votre carte
            </p>
          </div>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StepIndicator current={stepIndex} />
        </motion.div>

        {/* Step content */}
        <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
          <AnimatePresence mode="wait" custom={dir}>
            {step === "record" && (
              <motion.div
                key="record"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <GlassCard title="Votre message vocal" icon="🎙️">
                  <AudioRecorder
                    onRecorded={handleRecorded}
                    onImported={handleImported}
                  />
                </GlassCard>

                {error && <ErrorBanner msg={error} />}

                <PrimaryButton
                  onClick={goToDetails}
                  disabled={!audioBlob}
                  className="mt-4"
                >
                  Continuer →
                </PrimaryButton>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="details"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <GlassCard title="Informations de la carte" icon="✍️">
                    <div className="flex flex-col gap-4">
                      <PremiumInput
                        label="Message de"
                        placeholder="Sophie"
                        value={fromName}
                        onChange={setFromName}
                        required
                        hint="Votre prénom"
                      />
                      <PremiumInput
                        label="Pour"
                        placeholder="Maman"
                        value={toName}
                        onChange={setToName}
                        required
                        hint="Prénom du destinataire"
                      />
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between">
                          <label
                            className="text-[11px] font-bold uppercase tracking-widest"
                            style={{ color: "var(--gold)" }}
                          >
                            Date
                          </label>
                          <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>
                            Date du message
                          </span>
                        </div>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                          style={{
                            borderColor: "rgba(184,134,26,0.3)",
                            background: "rgba(255,255,255,0.7)",
                            color: "var(--ink)",
                            backdropFilter: "blur(4px)",
                          }}
                        />
                      </div>
                    </div>
                  </GlassCard>

                  {error && <ErrorBanner msg={error} />}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goTo("record", -1)}
                      className="flex-1 py-3.5 rounded-2xl font-semibold border text-sm transition-all active:scale-95"
                      style={{ borderColor: "var(--gold)", color: "var(--gold)", background: "transparent" }}
                    >
                      ← Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !fromName.trim() || !toName.trim()}
                      className="flex-2 py-3.5 rounded-2xl font-bold text-white text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                        boxShadow: "0 4px 16px rgba(184,134,26,0.30)",
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <SpinIcon />
                          Création…
                        </span>
                      ) : (
                        "Créer la carte ✦"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "success" && result && (
              <motion.div
                key="success"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex flex-col gap-4"
              >
                {/* Success animation */}
                <div className="flex flex-col items-center gap-3 py-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                      boxShadow: "0 6px 24px rgba(184,134,26,0.35)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="white" width={30} height={30}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                      Votre carte est prête !
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                      Partagez le lien ou imprimez la carte avec son QR code.
                    </p>
                  </motion.div>
                </div>

                {/* Link display */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(184,134,26,0.15)",
                      boxShadow: "0 2px 12px rgba(184,134,26,0.08)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
                        Lien d'écoute
                      </p>
                      <p
                        className="text-xs mt-0.5 truncate font-mono"
                        style={{ color: "var(--ink-light)" }}
                      >
                        {result.listenUrl}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-90"
                      style={{
                        background: copied ? "#16a34a" : "var(--gold)",
                        color: "white",
                      }}
                    >
                      {copied ? "✓ Copié" : "Copier"}
                    </button>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex flex-col gap-2.5"
                >
                  <Link
                    href={result.listenUrl}
                    className="w-full py-4 rounded-2xl font-bold text-white text-center text-sm tracking-wide block transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                      boxShadow: "0 4px 16px rgba(184,134,26,0.30)",
                    }}
                  >
                    Voir la page d'écoute →
                  </Link>

                  <a
                    href={`/api/pdf/${result.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl font-semibold border text-center text-sm block transition-all active:scale-95"
                    style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                  >
                    Télécharger la carte (QR + PDF)
                  </a>

                  <button
                    onClick={() => {
                      setStep("record");
                      setAudioBlob(null);
                      setFromName("");
                      setToName("");
                      setDate(new Date().toISOString().split("T")[0]);
                      setResult(null);
                    }}
                    className="text-xs text-center py-2 active:opacity-60 transition-opacity"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Créer une nouvelle carte
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub components ─── */

function StepIndicator({ current }: { current: number }) {
  const labels = ["Message", "Détails", "Carte"];
  return (
    <div className="flex items-center justify-center">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                background:
                  i < current
                    ? "#16a34a"
                    : i === current
                    ? "linear-gradient(135deg, #D4A832, #8B6510)"
                    : "rgba(184,134,26,0.15)",
                scale: i === current ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ color: i <= current ? "white" : "var(--ink-muted)" }}
            >
              {i < current ? "✓" : i + 1}
            </motion.div>
            <span
              className="text-[10px] font-semibold"
              style={{
                color: i === current ? "var(--gold)" : "var(--ink-muted)",
                opacity: i > current ? 0.5 : 1,
              }}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className="w-10 h-px mx-1 mb-4 transition-all duration-500"
              style={{
                background: i < current ? "#16a34a" : "rgba(184,134,26,0.2)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function GlassCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full rounded-3xl p-5 flex flex-col gap-4"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:
          "0 4px 32px rgba(184,134,26,0.09), 0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.95)",
        border: "1px solid rgba(184,134,26,0.12)",
      }}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--gold)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function PremiumInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>
            {hint}
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3.5 rounded-xl border text-base outline-none transition-all"
        style={{
          borderColor: "rgba(184,134,26,0.3)",
          background: "rgba(255,255,255,0.7)",
          color: "var(--ink)",
          fontFamily: "var(--font-playfair)",
          fontSize: 18,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--gold)";
          e.target.style.boxShadow = "0 0 0 3px rgba(184,134,26,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(184,134,26,0.3)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
  className = "",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl font-bold text-white tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
        boxShadow: disabled ? "none" : "0 4px 16px rgba(184,134,26,0.30)",
      }}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-2xl px-4 py-3 text-sm font-medium"
      style={{ background: "#FEE2E2", color: "#B91C1C" }}
    >
      {msg}
    </motion.div>
  );
}

function SpinIcon() {
  return (
    <svg
      className="animate-spin"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
