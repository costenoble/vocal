"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoDraw from "@/components/LogoDraw";

// Full-screen intro: the logo draws itself stroke by stroke, then the splash
// fades away to reveal the page. Shown once per browser session.
export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("nj_splash_seen")) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      sessionStorage.setItem("nj_splash_seen", "1");
      setShow(false);
      document.body.style.overflow = "";
    }, 3200);
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{ background: "var(--cream)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{ width: 480, height: 480, background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 65%)", filter: "blur(50px)" }}
          />

          <div className="relative flex flex-col items-center">
            <LogoDraw size={180} duration={2.3} />

            {/* Brand name — fades in as strokes finish */}
            <motion.div
              className="text-center mt-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
  );
}
