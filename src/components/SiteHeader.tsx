"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

// Navigation client (pas de rechargement complet, donc pas de splash) tout en
// gardant les animations d'entrée des liens du menu.
const MotionLink = motion.create(Link);

// Ancres préfixées par "/" : depuis une autre page (ex. /boutique), le lien
// ramène à l'accueil sur la bonne section ; depuis l'accueil, simple scroll.
const NAV_LINKS = [
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#tarifs", label: "Nos formules" },
  { href: "/#faq", label: "Questions fréquentes" },
  { href: "/boutique", label: "Commander" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(250,246,239,0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(184,134,26,0.12)" : "1px solid transparent",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={64} />
            <span className="text-[10px] font-black tracking-[0.22em] uppercase" style={{ color: "var(--ink)" }}>
              N&rsquo;OUBLIE JAMAIS
            </span>
          </Link>

          {/* Hamburger — 2 bars */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col justify-center items-end gap-1.5 w-8 h-8 shrink-0"
            aria-label="Ouvrir le menu"
          >
            {/* Bar 1 — full */}
            <span
              className="block rounded-full transition-all duration-300"
              style={{ height: 1.5, width: 24, background: "var(--ink)" }}
            />
            {/* Bar 2 — shorter, right-aligned for asymmetric style */}
            <span
              className="block rounded-full transition-all duration-300"
              style={{ height: 1.5, width: 16, background: "var(--gold)" }}
            />
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-20" />

      {/* ── Overlay + panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-60"
              style={{ background: "rgba(28,20,16,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
            />

            {/* Slide panel from right */}
            <motion.div
              className="fixed top-2 right-2 bottom-2 z-70 flex flex-col overflow-hidden"
              style={{ width: "min(320px, 88vw)", background: "var(--ink)", borderRadius: 12 }}
              initial={{ x: "calc(100% + 12px)" }}
              animate={{ x: 0 }}
              exit={{ x: "calc(100% + 12px)" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
            >
              <div className="flex flex-col flex-1 overflow-y-auto px-7 py-8 gap-0">
                {/* Header row: logo + close */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-2.5">
                    <Logo size={30} />
                    <div>
                      <p className="text-[9px] font-black tracking-[0.22em] uppercase" style={{ color: "rgba(250,246,239,0.9)" }}>N&rsquo;OUBLIE JAMAIS</p>
                      <p className="text-[8px] tracking-widest" style={{ color: "var(--gold)" }}>La carte vocale</p>
                    </div>
                  </div>

                  {/* Close button */}
                  <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ border: "1px solid rgba(250,246,239,0.12)" }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="rgba(250,246,239,0.7)" strokeWidth="1.5" strokeLinecap="round" width={14} height={14}>
                      <path d="M3 3l10 10M13 3L3 13" />
                    </svg>
                  </button>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 flex-1">
                  {NAV_LINKS.map((l, i) => (
                    <MotionLink
                      key={l.href}
                      href={l.href}
                      onClick={close}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                      className="flex items-center justify-between py-4 group"
                      style={{ borderBottom: "1px solid rgba(250,246,239,0.07)" }}
                    >
                      <span
                        className="text-[18px] font-black transition-colors"
                        style={{ color: "rgba(250,246,239,0.85)", fontFamily: "var(--font-playfair)" }}
                      >
                        {l.label}
                      </span>
                      <svg viewBox="0 0 16 16" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" width={14} height={14} style={{ opacity: 0.6 }}>
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </MotionLink>
                  ))}
                </nav>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.35 }}
                  className="mt-8"
                >
                  <Link
                    href="/boutique"
                    onClick={close}
                    className="block w-full py-4 rounded-2xl font-bold text-white text-center text-[14px] tracking-wide"
                    style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 20px rgba(184,134,26,0.25)" }}
                  >
                    Commander ma carte
                  </Link>
                  <p className="text-center text-[10px] mt-3" style={{ color: "rgba(250,246,239,0.3)" }}>
                    Paiement sécurisé · Accès immédiat
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
