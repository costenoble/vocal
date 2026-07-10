"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Splash d'arrivée : onde vocale → logo révélé → rideau qui se lève.
// Joué une seule fois par session de navigation.
//
// Toutes les animations sont en CSS pur (transform/opacity) : elles tournent
// sur le thread compositeur du navigateur et restent fluides même pendant
// l'hydratation React de la page — c'était la cause des saccades avec les
// animations pilotées en JS.

const BRAND = "N'OUBLIE JAMAIS";
const WAVE_MS = 1300;
const TOTAL_MS = 3800; // début de la levée du rideau
const CURTAIN_MS = 900;

type Status = "pending" | "wave" | "logo" | "lifting" | "done";

const CSS = `
@keyframes nj-bar {
  0%, 100% { transform: scaleY(0.25); }
  50% { transform: scaleY(1); }
}
@keyframes nj-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nj-zoom-in {
  from { opacity: 0; transform: scale(0.86); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes nj-shine {
  from { transform: translateX(-130%); }
  to { transform: translateX(320%); }
}
@keyframes nj-glow {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.9; }
}
@keyframes nj-sparkle {
  0% { opacity: 0; transform: scale(0) rotate(-30deg); }
  35% { opacity: 1; transform: scale(1) rotate(0deg); }
  70% { opacity: 0.75; transform: scale(0.7) rotate(12deg); }
  100% { opacity: 0; transform: scale(0.2) rotate(25deg); }
}
.nj-curtain {
  transition: transform ${CURTAIN_MS}ms cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform;
}
.nj-curtain.up { transform: translateY(-101%); }
.nj-content {
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .nj-anim { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

function Sparkle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="absolute pointer-events-none nj-anim"
      style={{ left: x, top: y, fill: "var(--gold)", opacity: 0, animation: `nj-sparkle 1.8s ease-in-out ${delay}s both` }}
      aria-hidden
    >
      <path d="M12 2 C13.2 8 16 10.8 22 12 C16 13.2 13.2 16 12 22 C10.8 16 8 13.2 2 12 C8 10.8 10.8 8 12 2 Z" />
    </svg>
  );
}

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("pending");

  useEffect(() => {
    if (sessionStorage.getItem("nj_splash_seen")) {
      setStatus("done");
      return;
    }
    sessionStorage.setItem("nj_splash_seen", "1");
    document.body.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 1500 : TOTAL_MS;

    setStatus(reduced ? "logo" : "wave");

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (!reduced) timers.push(setTimeout(() => setStatus("logo"), WAVE_MS));
    timers.push(setTimeout(() => setStatus("lifting"), total));
    timers.push(
      setTimeout(() => {
        setStatus("done");
        document.body.style.overflow = "";
        // Arrivée avec une ancre (#faq…) : rejouer la navigation après le rideau.
        const hash = window.location.hash;
        if (hash) {
          setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 150);
        }
      }, total + CURTAIN_MS)
    );

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  const splashVisible = status === "wave" || status === "logo" || status === "lifting";
  const contentRevealed = status === "lifting" || status === "done";

  return (
    <>
      {splashVisible && (
        <div
          className={`nj-curtain fixed inset-0 z-999 flex flex-col items-center justify-center${status === "lifting" ? " up" : ""}`}
          style={{ background: "var(--cream)" }}
        >
          <style>{CSS}</style>

          {/* Halo ambiant */}
          <div
            className="absolute pointer-events-none"
            style={{ width: 520, height: 520, background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 65%)" }}
          />

          {status === "wave" ? (
            /* ── Phase 1 : onde vocale ── */
            <div className="flex items-center justify-center gap-2" style={{ height: 80 }}>
              {[16, 30, 46, 62, 46, 30, 16].map((h, i) => (
                <div
                  key={i}
                  className="rounded-full nj-anim"
                  style={{
                    width: 6,
                    height: h,
                    background: "linear-gradient(180deg, var(--gold-light), var(--gold-dark))",
                    transformOrigin: "center",
                    animation: `nj-bar 0.85s ease-in-out ${i * 0.09}s infinite`,
                  }}
                />
              ))}
            </div>
          ) : (
            /* ── Phase 2 : logo + reflet + lettres ── */
            <div className="relative flex flex-col items-center">
              <Sparkle x="-14%" y="12%" size={16} delay={1.15} />
              <Sparkle x="100%" y="30%" size={12} delay={1.4} />
              <Sparkle x="-6%" y="72%" size={10} delay={1.65} />
              <Sparkle x="92%" y="80%" size={14} delay={1.9} />

              <div className="relative nj-anim" style={{ animation: "nj-zoom-in 0.85s cubic-bezier(0.22,1,0.36,1) both" }}>
                {/* Halo pulsant */}
                <div
                  className="absolute pointer-events-none nj-anim"
                  style={{
                    inset: "-30%",
                    background: "radial-gradient(ellipse, rgba(212,168,50,0.20) 0%, transparent 62%)",
                    animation: "nj-glow 2.4s ease-in-out 0.4s infinite",
                  }}
                />
                <Image src="/logo.png" alt="N'OUBLIE JAMAIS" width={216} height={215} priority />

                {/* Reflet lumineux masqué par le logo lui-même */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    WebkitMaskImage: "url(/logo.png)",
                    maskImage: "url(/logo.png)",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 nj-anim"
                    style={{
                      width: "55%",
                      background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)",
                      transform: "translateX(-130%)",
                      animation: "nj-shine 1.05s ease-in-out 0.75s both",
                      willChange: "transform",
                    }}
                  />
                </div>
              </div>

              {/* Marque — lettre par lettre */}
              <div className="mt-4 flex" aria-label={BRAND}>
                {BRAND.split("").map((ch, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="text-[19px] font-black uppercase nj-anim"
                    style={{
                      color: "var(--ink)",
                      letterSpacing: "0.24em",
                      opacity: 0,
                      animation: `nj-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) ${0.45 + i * 0.045}s both`,
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </div>

              {/* Tagline */}
              <p
                className="text-[9px] font-bold tracking-[0.26em] uppercase mt-2 nj-anim"
                style={{ color: "var(--gold)", opacity: 0, animation: "nj-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 1.5s both" }}
              >
                Les émotions prennent une voix
              </p>
            </div>
          )}
        </div>
      )}

      {/* Contenu du site — non peint pendant le splash, révélé en fondu quand
          le rideau se lève. */}
      <div
        className="nj-content"
        style={{
          visibility: status === "wave" || status === "logo" ? "hidden" : "visible",
          opacity: splashVisible && !contentRevealed ? 0 : 1,
        }}
      >
        {children}
      </div>
    </>
  );
}
