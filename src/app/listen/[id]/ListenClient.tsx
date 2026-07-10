"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveAudioWaveform } from "@/components/ui/live-audio-waveform";
import Logo from "@/components/Logo";
import { getTheme, type Theme } from "@/lib/themes";

interface Props {
  slug?: string;
  fromName: string;
  toName: string;
  date: string;
  audioUrl: string;
  duration?: number;
  expired?: boolean;
  demo?: boolean;
  locked?: boolean;
  theme?: string;
  replyAudioUrl?: string;
  replyFromName?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Réponse vocale du destinataire : fonctionnalité prête mais désactivée —
// elle sera proposée en option payante. Passer à true pour la réactiver.
const REPLY_ENABLED = false;

const fmtTime = (s: number) =>
  !isFinite(s) || isNaN(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ── Mini player (réponse vocale) ──────────────────────────────────────────────
function MiniPlayer({ src, accent }: { src: string; accent: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const toggle = async () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { try { await ref.current.play(); setPlaying(true); } catch { /* refusé */ } }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <audio
        ref={ref} src={src}
        onTimeUpdate={() => {
          const el = ref.current;
          if (!el || !el.duration) return;
          setElapsed(el.currentTime);
          setProgress(el.currentTime / el.duration);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); setElapsed(0); }}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95"
        style={{ background: accent, boxShadow: `0 3px 12px ${accent}55` }}
        aria-label={playing ? "Pause" : "Écouter la réponse"}
      >
        {playing
          ? <svg viewBox="0 0 24 24" fill="white" width={12} height={12}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          : <svg viewBox="0 0 24 24" fill="white" width={13} height={13}><path d="M8 5.14v14l11-7-11-7z"/></svg>}
      </button>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: `${accent}22` }}>
        <div className="h-full rounded-full transition-[width]" style={{ width: `${progress * 100}%`, background: accent }} />
      </div>
      <span className="text-[11px] font-semibold shrink-0" style={{ color: accent, fontVariantNumeric: "tabular-nums" }}>{fmtTime(elapsed)}</span>
    </div>
  );
}

// ── Bloc "Répondre par un message vocal" ──────────────────────────────────────
type ReplyState = "idle" | "recording" | "preview" | "sending" | "sent";

function ReplySection({ slug, code, fromName, t, existingUrl, existingFrom }: {
  slug: string;
  code: string;
  fromName: string;
  t: Theme;
  existingUrl?: string;
  existingFrom?: string;
}) {
  const [state, setState] = useState<ReplyState>("idle");
  const [replyUrl, setReplyUrl] = useState(existingUrl ?? "");
  const [replyFrom, setReplyFrom] = useState(existingFrom ?? "");
  const [name, setName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
        setState("preview");
        stream.getTracks().forEach((tr) => tr.stop());
      };
      mr.start(100);
      startRef.current = Date.now();
      setState("recording");
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(secs);
        if (secs >= 120) stopRecording(); // 2 min max
      }, 250);
    } catch {
      setError("Accès au micro refusé. Autorisez-le dans les réglages du navigateur.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
  };

  const send = async () => {
    if (!blobRef.current) return;
    setState("sending");
    setError("");
    try {
      const fd = new FormData();
      fd.append("audio", new File([blobRef.current], "reply.webm", { type: "audio/webm" }));
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upJson = await up.json();
      if (!up.ok || !upJson.audioUrl) throw new Error(upJson.error || "upload");

      const res = await fetch("/api/listen/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code, fromName: name, audioUrl: upJson.audioUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "envoi");

      setReplyUrl(upJson.audioUrl);
      setReplyFrom(json.replyFromName || name);
      setState("sent");
    } catch {
      setError("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
      setState("preview");
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    blobRef.current = null;
    setElapsed(0);
    setState("idle");
  };

  // Une réponse existe déjà (ou vient d'être envoyée) : on l'affiche.
  if (replyUrl && state !== "recording" && state !== "preview" && state !== "sending") {
    return (
      <div className="w-full rounded-2xl p-4 flex flex-col gap-3" style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.textMuted }}>
          {state === "sent" ? "Votre réponse a été envoyée ♥" : `La réponse de ${replyFrom}`}
        </p>
        <MiniPlayer src={replyUrl} accent={t.accent} />
        {state === "sent" && (
          <p className="text-[11px]" style={{ color: t.textMuted }}>
            {fromName} recevra un email pour l&apos;écouter.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startRecording}
            className="w-full py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: t.accentBg, border: `1.5px solid ${t.accentBorder}`, color: t.accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={16} height={16}>
              <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" />
            </svg>
            Répondre par un message vocal
          </motion.button>
        )}

        {state === "recording" && (
          <motion.div
            key="rec"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full rounded-2xl p-4 flex items-center gap-3"
            style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}
          >
            <span className="relative flex w-3 h-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#C0392B" }} />
              <span className="relative inline-flex rounded-full w-3 h-3" style={{ background: "#C0392B" }} />
            </span>
            <span className="text-[13px] font-semibold flex-1" style={{ color: t.text }}>
              Enregistrement… {fmtTime(elapsed)}
            </span>
            <button
              onClick={stopRecording}
              className="px-4 py-2 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95"
              style={{ background: "#C0392B" }}
            >
              ■ Terminer
            </button>
          </motion.div>
        )}

        {(state === "preview" || state === "sending") && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.textMuted }}>Votre réponse</p>
            <MiniPlayer src={previewUrl} accent={t.accent} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre prénom (facultatif)"
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
              style={{ background: t.cardBg, border: `1px solid ${t.accentBorder}`, color: t.text }}
            />
            <div className="flex gap-2">
              <button
                onClick={reset}
                disabled={state === "sending"}
                className="px-4 py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "transparent", border: `1.5px solid ${t.accentBorder}`, color: t.textMuted }}
              >
                Recommencer
              </button>
              <button
                onClick={send}
                disabled={state === "sending"}
                className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-60"
                style={{ background: t.accent }}
              >
                {state === "sending" ? "Envoi…" : `Envoyer à ${fromName} ♥`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[11px] text-center" style={{ color: "#C0392B" }}>{error}</p>}
    </div>
  );
}

export default function ListenClient({ slug, fromName, toName, date, audioUrl, duration, expired, demo, locked, theme: themeId, replyAudioUrl, replyFromName }: Props) {
  const t = getTheme(themeId);

  // Access-code gate: when locked, the audio URL is fetched only after the
  // correct code is verified server-side.
  const [unlocked, setUnlocked] = useState(!locked);
  const [audioSrc, setAudioSrc] = useState(audioUrl);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(duration);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [reply, setReply] = useState<{ url?: string; from?: string }>({ url: replyAudioUrl, from: replyFromName });

  const verifyCode = async () => {
    if (code.trim().length === 0 || !slug) return;
    setVerifying(true);
    setCodeError("");
    try {
      const res = await fetch("/api/listen/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code: code.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        setAudioSrc(json.audioUrl);
        setAudioDuration(json.duration ?? undefined);
        setReply({ url: json.replyAudioUrl ?? undefined, from: json.replyFromName ?? undefined });
        setUnlocked(true);
      } else if (res.status === 401) {
        setCodeError("Code incorrect. Vérifiez le code sur la carte.");
      } else {
        setCodeError("Une erreur est survenue. Réessayez.");
      }
    } catch {
      setCodeError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setVerifying(false);
    }
  };
  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{ background: t.pageBg }}
    >
      {/* ── Ambient background orbs ── */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: 420,
          height: 320,
          background: `radial-gradient(ellipse, ${t.orb1} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background: `radial-gradient(ellipse, ${t.orb2} 0%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />

      <div className="relative w-full max-w-sm mx-auto flex flex-col px-6 py-10 gap-0">

        {/* ── LOGO + BRAND ── */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col items-center gap-3 mb-6 float-logo"
        >
          <Logo size={100} />
          <div className="text-center">
            <h1
              className="text-[20px] font-black tracking-[0.22em] uppercase"
              style={{ color: t.text }}
            >
              N&rsquo;OUBLIE JAMAIS
            </h1>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mt-0.5" style={{ color: t.accent }}>
              LES ÉMOTIONS PRENNENT UNE VOIX
            </p>
          </div>
        </motion.div>

        {/* ── MAIN CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: EASE }}
          className="w-full rounded-3xl overflow-hidden"
          style={{
            background: t.cardBg,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: t.cardShadow,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div className="flex flex-col items-center px-6 py-7 gap-5">

            {/* FROM / TO section */}
            <div className="flex items-center justify-around w-full gap-3">
              {/* From */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                className="flex flex-col items-center gap-0.5 flex-1"
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: t.textMuted }}
                >
                  De
                </span>
                <span
                  className="text-2xl font-semibold text-center leading-tight"
                  style={{ color: t.accent, fontFamily: t.font }}
                >
                  {fromName}
                </span>
              </motion.div>

              {/* Heart center */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 16 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center heartbeat"
                  style={{
                    background: t.accentBg,
                    border: `1px solid ${t.accentBorder}`,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill={t.heartFill} width={18} height={18}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="w-px h-4" style={{ background: `${t.accent}44` }} />
              </motion.div>

              {/* To */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                className="flex flex-col items-center gap-0.5 flex-1"
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: t.textMuted }}
                >
                  Pour
                </span>
                <span
                  className="text-2xl font-semibold text-center leading-tight"
                  style={{ color: t.accent, fontFamily: t.font }}
                >
                  {toName}
                </span>
              </motion.div>
            </div>

            {/* Date pill — masquée si aucune date/occasion saisie */}
            {date && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <div
                className="flex items-center justify-center px-5 py-1.5 rounded-full"
                style={{
                  background: t.accentBg,
                  border: `1px solid ${t.accentBorder}`,
                }}
              >
                <span className="text-xs font-semibold text-center leading-normal" style={{ color: t.accent }}>
                  {date}
                </span>
              </div>
            </motion.div>
            )}

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="w-full h-px"
              style={{ background: `linear-gradient(to right, transparent, ${t.accent}44, transparent)` }}
            />

            {/* Player section */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5, ease: EASE }}
              className="w-full"
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-4"
                style={{ color: t.textMuted }}
              >
                Votre message vocal
              </p>
              {demo ? (
                <LiveAudioWaveform demo barPlayed={t.barPlayed} barIdle={t.barIdle} progressBg={t.progressBg} accentColor={t.accent} />
              ) : expired ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth={1.8} width={22} height={22}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-center font-medium" style={{ color: t.textMuted }}>Ce message a expiré.</p>
                  <p className="text-xs text-center" style={{ color: t.textMuted, opacity: 0.6 }}>La durée de conservation incluse dans cette formule est dépassée.</p>
                </div>
              ) : !unlocked ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth={1.8} width={20} height={20}>
                      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: t.text }}>Message privé</p>
                    <p className="text-xs mt-1" style={{ color: t.textMuted }}>Saisissez le code d&apos;accès figurant sur la carte.</p>
                  </div>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => { if (e.key === "Enter") verifyCode(); }}
                    placeholder="••••••"
                    className="w-40 text-center text-2xl font-bold tracking-[0.4em] py-3 rounded-xl outline-none"
                    style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accent }}
                  />
                  {codeError && <p className="text-xs text-center" style={{ color: "#C0392B" }}>{codeError}</p>}
                  <button
                    onClick={verifyCode}
                    disabled={verifying || code.trim().length === 0}
                    className="px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: t.accent, color: "#fff" }}
                  >
                    {verifying ? "Vérification…" : "Écouter le message"}
                  </button>
                </div>
              ) : (
                <LiveAudioWaveform src={audioSrc} duration={audioDuration} barPlayed={t.barPlayed} barIdle={t.barIdle} progressBg={t.progressBg} accentColor={t.accent} />
              )}
            </motion.div>

            {/* ── Réponse vocale (désactivée — option à venir) ── */}
            {REPLY_ENABLED && !demo && !expired && unlocked && slug && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
                className="w-full"
              >
                <ReplySection
                  slug={slug}
                  code={code.trim()}
                  fromName={fromName}
                  t={t}
                  existingUrl={reply.url}
                  existingFrom={reply.from}
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── FOOTER ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-col items-center gap-2 mt-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-px" style={{ background: `${t.accent}55` }} />
            <svg viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.5" width={16} height={16}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="w-8 h-px" style={{ background: `${t.accent}55` }} />
          </div>
          <p className="text-[11px] font-medium text-center" style={{ color: t.textMuted, opacity: 0.7 }}>
            Créé avec N&rsquo;OUBLIE JAMAIS
          </p>
          <p className="text-[10px] text-center" style={{ color: t.textMuted, opacity: 0.45 }}>
            Un message unique. Un souvenir précieux.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
