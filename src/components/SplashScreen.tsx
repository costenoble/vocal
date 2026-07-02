"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

const BRAND = "N'OUBLIE JAMAIS";

// ── Phase 1 : onde vocale dorée qui pulse ─────────────────────────────────────
function WavePhase() {
  const bars = [16, 30, 46, 62, 46, 30, 16];
  return (
    <motion.div
      className="flex items-center justify-center gap-2"
      style={{ height: 80 }}
      exit={{ opacity: 0, scale: 0.55, filter: "blur(5px)" }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 6, height: h, background: "linear-gradient(180deg, var(--gold-light), var(--gold-dark))", transformOrigin: "center" }}
          initial={{ scaleY: 0.15, opacity: 0 }}
          animate={{ scaleY: [0.15, 1, 0.35, 0.9, 0.25, 1], opacity: 1 }}
          transition={{
            scaleY: { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.09 },
            opacity: { duration: 0.3, delay: i * 0.06 },
          }}
        />
      ))}
    </motion.div>
  );
}

// ── Étincelle dorée ────────────────────────────────────────────────────────────
function Sparkle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="absolute pointer-events-none"
      style={{ left: x, top: y, fill: "var(--gold)" }}
      initial={{ scale: 0, opacity: 0, rotate: -30 }}
      animate={{ scale: [0, 1, 0.6, 1, 0], opacity: [0, 1, 0.7, 1, 0], rotate: 25 }}
      transition={{ duration: 1.8, delay, ease: "easeInOut" }}
    >
      <path d="M12 2 C13.2 8 16 10.8 22 12 C16 13.2 13.2 16 12 22 C10.8 16 8 13.2 2 12 C8 10.8 10.8 8 12 2 Z" />
    </motion.svg>
  );
}

// ── Phase 2 : logo + reflet métallique + lettres ──────────────────────────────
function LogoPhase() {
  return (
    <motion.div className="relative flex flex-col items-center" exit={{ opacity: 1 }}>
      {/* Étincelles autour du logo */}
      <Sparkle x="-14%" y="12%" size={16} delay={1.15} />
      <Sparkle x="102%" y="30%" size={12} delay={1.4} />
      <Sparkle x="-6%" y="72%" size={10} delay={1.65} />
      <Sparkle x="94%" y="80%" size={14} delay={1.9} />

      {/* Logo — apparition en douceur + halo pulsant */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.82, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: EASE }}
      >
        {/* Halo : dégradé radial seul, sans filter (le blur animé faisait
            ramer le rendu) */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ inset: "-30%", background: "radial-gradient(ellipse, rgba(212,168,50,0.20) 0%, transparent 62%)" }}
          animate={{ opacity: [0.3, 0.9, 0.5] }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <Image src="/logo.png" alt="N'OUBLIE JAMAIS" width={216} height={215} priority />

        {/* Reflet lumineux qui balaye uniquement les traits dorés
            (le logo lui-même sert de masque) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            WebkitMaskImage: "url(/logo.png)",
            maskImage: "url(/logo.png)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        >
          {/* Déplacement en transform (x) et non en `left` : composité GPU,
              aucun recalcul de layout par frame */}
          <motion.div
            className="absolute top-0 bottom-0 left-0"
            style={{ width: "55%", background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)", willChange: "transform" }}
            initial={{ x: "-110%" }}
            animate={{ x: "300%" }}
            transition={{ delay: 0.75, duration: 1.05, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Marque — lettre par lettre */}
      <div className="mt-4 flex" aria-label={BRAND}>
        {BRAND.split("").map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="text-[19px] font-black uppercase"
            style={{ color: "var(--ink)", letterSpacing: "0.24em" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.045, duration: 0.5, ease: EASE }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </div>

      {/* Tagline */}
      <motion.p
        className="text-[9px] font-bold tracking-[0.26em] uppercase mt-2"
        style={{ color: "var(--gold)" }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.55, ease: EASE }}
      >
        Un souvenir qui traverse le temps
      </motion.p>
    </motion.div>
  );
}

// ── Splash : onde vocale → logo révélé → rideau qui se lève ──────────────────
// Joué à chaque chargement complet de la page (les navigations internes via
// <Link> ne le redéclenchent pas).
export default function SplashScreen({ children }: { children: React.ReactNode }) {
  // null = pas encore décidé (SSR + premier rendu client)
  const [show, setShow] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"wave" | "logo">("wave");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setShow(true);
    document.body.style.overflow = "hidden";

    const finish = () => {
      setShow(false);
      document.body.style.overflow = "";
      // Arrivée avec une ancre (#faq…) : le scroll natif a été bloqué pendant
      // le splash, on rejoue la navigation vers la section après le rideau.
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
    };

    // Accessibilité : animation raccourcie si l'utilisateur préfère
    // les mouvements réduits.
    if (reducedMotion) {
      setPhase("logo");
      const t = setTimeout(finish, 1600);
      return () => { clearTimeout(t); document.body.style.overflow = ""; };
    }

    const t1 = setTimeout(() => setPhase("logo"), 1300);
    const t2 = setTimeout(finish, 3900);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const splashPlayed = show !== null && !show;

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-999 flex flex-col items-center justify-center"
            style={{ background: "var(--cream)" }}
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.85, ease: CURTAIN_EASE }}
          >
            {/* Halo ambiant */}
            <div
              className="absolute pointer-events-none"
              style={{ width: 520, height: 520, background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 65%)", filter: "blur(50px)" }}
            />

            <AnimatePresence mode="wait">
              {phase === "wave" ? (
                <motion.div key="wave">
                  <WavePhase />
                </motion.div>
              ) : (
                <motion.div key="logo">
                  <LogoPhase />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu du site — monte en fondu quand le rideau se lève.
          Aucune animation si le splash a déjà été vu cette session. */}
      <motion.div
        initial={false}
        animate={splashPlayed ? { opacity: 1, y: 0 } : show ? { opacity: 0, y: 28 } : {}}
        transition={{ duration: 0.8, ease: EASE, delay: splashPlayed ? 0.05 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
