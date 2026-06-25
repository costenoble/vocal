"use client";

import { motion } from "framer-motion";
import { LiveAudioWaveform } from "@/components/ui/live-audio-waveform";
import Logo from "@/components/Logo";

interface Props {
  fromName: string;
  toName: string;
  date: string;
  audioUrl: string;
  duration?: number;
  expired?: boolean;
  demo?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ListenClient({ fromName, toName, date, audioUrl, duration, expired, demo }: Props) {
  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{ background: "var(--cream)" }}
    >
      {/* ── Ambient background orbs ── */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: 420,
          height: 320,
          background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background: "radial-gradient(ellipse, rgba(184,134,26,0.07) 0%, transparent 70%)",
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
              style={{ color: "var(--ink)" }}
            >
              N&rsquo;OUBLIE JAMAIS
            </h1>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-shimmer mt-0.5">
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
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow:
              "0 8px 48px rgba(184,134,26,0.12), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)",
            border: "1px solid rgba(184,134,26,0.14)",
          }}
        >
          {/* Gold top accent bar */}
          <div
            style={{
              height: 3,
              background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))",
            }}
          />

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
                  style={{ color: "var(--ink-muted)" }}
                >
                  De
                </span>
                <span
                  className="text-2xl font-semibold text-center leading-tight"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-playfair)" }}
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
                    background: "linear-gradient(135deg, rgba(184,134,26,0.15), rgba(184,134,26,0.08))",
                    border: "1px solid rgba(184,134,26,0.2)",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="var(--gold)" width={18} height={18}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="w-px h-4" style={{ background: "rgba(184,134,26,0.25)" }} />
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
                  style={{ color: "var(--ink-muted)" }}
                >
                  Pour
                </span>
                <span
                  className="text-2xl font-semibold text-center leading-tight"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-playfair)" }}
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
                className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{
                  background: "rgba(184,134,26,0.08)",
                  border: "1px solid rgba(184,134,26,0.18)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" width={12} height={12}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>
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
              style={{ background: "linear-gradient(to right, transparent, rgba(184,134,26,0.25), transparent)" }}
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
                style={{ color: "var(--ink-muted)" }}
              >
                Votre message vocal
              </p>
              {demo ? (
                <LiveAudioWaveform demo />
              ) : expired ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(184,134,26,0.10)", border: "1px solid rgba(184,134,26,0.20)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={1.8} width={22} height={22}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-center font-medium" style={{ color: "var(--ink-muted)" }}>Ce message a expiré.</p>
                  <p className="text-xs text-center" style={{ color: "var(--ink-muted)", opacity: 0.6 }}>La durée de conservation incluse dans cette formule est dépassée.</p>
                </div>
              ) : (
                <LiveAudioWaveform src={audioUrl} duration={duration} />
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
            <div className="w-8 h-px" style={{ background: "rgba(184,134,26,0.3)" }} />
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" width={16} height={16}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="w-8 h-px" style={{ background: "rgba(184,134,26,0.3)" }} />
          </div>
          <p className="text-[11px] font-medium text-center" style={{ color: "var(--ink-muted)", opacity: 0.7 }}>
            Créé avec N&rsquo;OUBLIE JAMAIS
          </p>
          <p className="text-[10px] text-center" style={{ color: "var(--ink-muted)", opacity: 0.45 }}>
            Un message unique. Un souvenir précieux.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
