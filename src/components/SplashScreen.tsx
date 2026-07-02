"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

// Full-screen intro: the brand logo fades in, holds, then the splash lifts
// like a curtain while the page content rises into place. Shown once per
// browser session.
export default function SplashScreen({ children }: { children: React.ReactNode }) {
  // null = not decided yet (SSR + first client paint), true = splash playing.
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("nj_splash_seen")) {
      setShow(false);
      return;
    }
    setShow(true);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      sessionStorage.setItem("nj_splash_seen", "1");
      setShow(false);
      document.body.style.overflow = "";
    }, 2600);
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
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
            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{ width: 480, height: 480, background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 65%)", filter: "blur(50px)" }}
            />

            <div className="relative flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                <Image
                  src="/logo.jpg"
                  alt="N'OUBLIE JAMAIS"
                  width={210}
                  height={208}
                  priority
                  // Le fond ivoire du JPG se fond dans le crème de la page,
                  // seuls les traits dorés restent visibles.
                  style={{ mixBlendMode: "multiply" }}
                />
              </motion.div>

              {/* Brand name — fades in under the logo */}
              <motion.div
                className="text-center mt-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
              >
                <h1 className="text-[18px] font-black tracking-[0.24em] uppercase" style={{ color: "var(--ink)" }}>
                  N&rsquo;OUBLIE JAMAIS
                </h1>
                <p className="text-[9px] font-bold tracking-[0.22em] uppercase mt-1" style={{ color: "var(--gold)" }}>
                  Un souvenir qui traverse le temps
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content — rises into place as the curtain lifts. No animation
          when the splash was already seen this session. */}
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
