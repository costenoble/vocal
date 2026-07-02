"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LiveAudioWaveform } from "@/components/ui/live-audio-waveform";
import Logo from "@/components/Logo";
import { getTheme } from "@/lib/themes";

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
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ListenClient({ slug, fromName, toName, date, audioUrl, duration, expired, demo, locked, theme: themeId }: Props) {
  const t = getTheme(themeId);

  // Access-code gate: when locked, the audio URL is fetched only after the
  // correct code is verified server-side.
  const [unlocked, setUnlocked] = useState(!locked);
  const [audioSrc, setAudioSrc] = useState(audioUrl);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(duration);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");

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
              UN SOUVENIR QUI TRAVERSE LE TEMPS
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

            {/* Date pill */}
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
