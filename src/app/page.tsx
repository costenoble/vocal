"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/SiteHeader";
import { PRODUCTS } from "@/lib/products";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

const OCCASIONS = [
  "Je t'aime", "Joyeux anniversaire", "Merci",
  "Je suis fier de toi", "Ne baisse jamais les bras", "Bienvenue dans la famille",
  "Veux-tu m'épouser ?", "À nos grands-parents", "Pour un ami",
];

const STEPS = [
  { n: "01", title: "Choisissez votre bracelet NJ", desc: "Le modèle et la taille qui correspondent à votre proche." },
  { n: "02", title: "Personnalisez & enregistrez", desc: "Votre carte, vos mots, votre voix. Directement depuis votre téléphone." },
  { n: "03", title: "Nous livrons le coffret", desc: "Le bracelet et la carte avec son QR code, chez vous ou votre proche, sous 3 à 5 jours." },
];

const TESTIMONIALS = [
  {
    name: "Marie-Christine V.",
    context: "Fête des mères · Cadeau pour les 75 ans de sa mère",
    text: "Ma mère garde la carte sur sa table de nuit. Elle rescanne le QR code chaque soir. Un impact que je n'aurais jamais imaginé.",
  },
  {
    name: "Léa & Thomas M.",
    context: "Mariage · Messages pour leurs témoins",
    text: "Chacun de nos témoins a reçu une carte. Leur réaction au dîner de répétition était exactement l'émotion qu'on cherchait.",
  },
  {
    name: "Benjamin R.",
    context: "Départ · Message pour son équipe après 8 ans",
    text: "J'ai enregistré un message pour chaque personne. Une collègue m'a dit qu'elle l'avait écouté trois fois dans la soirée.",
  },
];

const FAQS = [
  {
    q: "Comment le destinataire écoute-t-il le message ?",
    a: "Il scanne le QR code de la carte avec l'appareil photo de son téléphone, saisit le code d'accès confidentiel, et le message se lance. Aucune application à installer.",
  },
  {
    q: "Le message est-il vraiment privé ?",
    a: "Oui. Chaque message est protégé par un code d'accès personnel imprimé sur la carte. Sans ce code, personne ne peut écouter le message, même avec le lien.",
  },
  {
    q: "Que contient le coffret livré ?",
    a: "Une enveloppe premium, le bracelet en pierre naturelle avec son médaillon N'OUBLIE JAMAIS, ses cartes élégantes et le QR code donnant accès au message vocal.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Votre coffret est expédié sous 3 à 5 jours ouvrés, avec suivi, à l'adresse de votre choix — chez vous ou directement chez votre proche.",
  },
  {
    q: "Le lien du message reste-t-il actif longtemps ?",
    a: "Le message reste accessible à vie. Votre proche pourra le réécouter pour toujours, même dans 20 ans.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "100%. Le paiement est traité par Stripe — utilisé par des millions d'entreprises. Nous ne stockons jamais vos données bancaires.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <SiteHeader />

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F0E8D8 0%, #F5EEE3 100%)" }}>
        <div style={{ height: 3, background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 500, height: 500, background: "radial-gradient(ellipse, rgba(184,134,26,0.10) 0%, transparent 65%)", filter: "blur(50px)" }} />
        <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: 300, height: 300, background: "radial-gradient(ellipse, rgba(184,134,26,0.07) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative max-w-5xl mx-auto px-6 pt-14 pb-6">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* ── LEFT : texte ── */}
            <div className="flex-1 flex flex-col items-start">

              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex items-center gap-3 mb-6"
              >
                <div style={{ width: 24, height: 1, background: "var(--gold)", opacity: 0.5 }} />
                <span className="text-[10px] font-black tracking-[0.28em] uppercase text-shimmer">Le bracelet à message vocal</span>
              </motion.div>

              {/* Logo NJ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.55, ease: EASE }}
                className="float-logo mb-5"
              >
                <Logo size={72} />
              </motion.div>

              {/* Headline — mot par mot */}
              <h1
                className="font-black leading-[1.05] tracking-tight mb-5 overflow-hidden"
                style={{ fontSize: "clamp(36px, 5.5vw, 58px)", fontFamily: "var(--font-playfair)", color: "var(--ink)" }}
              >
                {["Bien", "plus", "qu'un"].map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.09, duration: 0.55, ease: EASE }}
                    className="inline-block mr-[0.22em]"
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                {["bracelet."].map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.1, duration: 0.55, ease: EASE }}
                    className="inline-block mr-[0.22em]"
                    style={{ color: "var(--gold)", fontStyle: "italic" }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.68, duration: 0.5, ease: EASE }}
                className="text-[14px] leading-relaxed mb-8"
                style={{ color: "var(--ink-muted)", maxWidth: 340 }}
              >
                Un bracelet en pierre naturelle, sa carte et son message vocal. Une attention qui restera dans les mémoires.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.82, duration: 0.4 }}
                className="flex flex-col gap-3 w-full max-w-[300px]"
              >
                <Link
                  href="/boutique"
                  className="w-full py-4 rounded-2xl font-bold text-white text-[14px] tracking-wide text-center block transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 28px rgba(184,134,26,0.32)" }}
                >
                  Découvrir le bracelet
                </Link>
              </motion.div>
            </div>

            {/* ── RIGHT : smartphone mockup ── */}
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.9, ease: EASE }}
              className="shrink-0 flex flex-col items-center float-logo"
            >
              {/* Phone outer shell */}
              <div style={{
                width: 230,
                background: "linear-gradient(160deg, #2a2a2a, #111)",
                borderRadius: 40,
                padding: "14px 9px 18px",
                boxShadow: "0 40px 100px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)",
                position: "relative",
              }}>
                {/* Side buttons */}
                <div style={{ position: "absolute", left: -3, top: 80, width: 3, height: 28, background: "#333", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: -3, top: 116, width: 3, height: 44, background: "#333", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: -3, top: 168, width: 3, height: 44, background: "#333", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 60, background: "#333", borderRadius: "0 2px 2px 0" }} />

                {/* Screen */}
                <div style={{ background: "var(--cream)", borderRadius: 30, overflow: "hidden", position: "relative" }}>
                  {/* Notch */}
                  <div style={{ height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 2, position: "relative", zIndex: 2 }}>
                    <div style={{ width: 72, height: 20, background: "#111", borderRadius: "0 0 14px 14px", position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }} />
                    {/* Status bar */}
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px 0", position: "relative", zIndex: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#1a1a1a" }}>9:41</span>
                      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                        <svg viewBox="0 0 15 10" width={13} height={9} fill="#1a1a1a"><rect x="0" y="3" width="3" height="7" rx="0.5"/><rect x="4" y="2" width="3" height="8" rx="0.5"/><rect x="8" y="0" width="3" height="10" rx="0.5"/><rect x="12" y="1" width="3" height="9" rx="0.5"/></svg>
                        <svg viewBox="0 0 15 12" width={13} height={10} fill="#1a1a1a"><path d="M7.5 2C4.5 2 1.8 3.4 0 5.6l1.5 1.5C2.9 5.2 5.1 4 7.5 4s4.6 1.2 6 3.1L15 5.6C13.2 3.4 10.5 2 7.5 2zm0 4c-1.7 0-3.2.7-4.3 1.8l1.5 1.5C5.4 8.5 6.4 8 7.5 8s2.1.5 2.8 1.3l1.5-1.5C10.7 6.7 9.2 6 7.5 6zm0 4c-.8 0-1.5.3-2 .8L7.5 13l2-2.2c-.5-.5-1.2-.8-2-.8z"/></svg>
                        <svg viewBox="0 0 22 11" width={20} height={10} fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="#1a1a1a"/><rect x="2" y="2" width="13" height="7" rx="1.5" fill="#1a1a1a"/><path d="M20 3.5v4a2 2 0 000-4z" fill="#1a1a1a"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Screen content */}
                  <div style={{ padding: "10px 18px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    <Logo size={44} />
                    <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "var(--ink)", marginTop: 4, marginBottom: 2 }}>N&rsquo;OUBLIE JAMAIS</p>
                    <p style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: "0.14em", color: "var(--gold)", marginBottom: 8 }}>UN SOUVENIR QUI TRAVERSE LE TEMPS</p>

                    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(184,134,26,0.4))" }} />
                      <svg viewBox="0 0 24 24" fill="var(--gold)" width={10} height={10}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(184,134,26,0.4))" }} />
                    </div>

                    <p style={{ fontSize: 7, color: "var(--ink-muted)", marginBottom: 2 }}>Message de</p>
                    <p style={{ fontSize: 20, color: "var(--gold)", fontFamily: "var(--font-playfair)", fontWeight: 600, lineHeight: 1.1, marginBottom: 6 }}>Sophie</p>

                    <svg viewBox="0 0 24 24" fill="var(--gold)" width={11} height={11} style={{ marginBottom: 6 }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>

                    <p style={{ fontSize: 7, color: "var(--ink-muted)", marginBottom: 2 }}>Pour</p>
                    <p style={{ fontSize: 20, color: "var(--gold)", fontFamily: "var(--font-playfair)", fontWeight: 600, lineHeight: 1.1, marginBottom: 10 }}>Maman</p>

                    <p style={{ fontSize: 7, color: "var(--ink-muted)", marginBottom: 6 }}>Votre message</p>

                    {/* Waveform bars animées */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 36, width: "100%", justifyContent: "center", marginBottom: 8 }}>
                      {[35,65,48,82,56,90,42,72,88,52,68,95,46,78,62,86,50,74,44,92,66,58,80,46,70,84,54,62,76,48,82,56].map((h, i) => (
                        <div
                          key={i}
                          className="waveform-bar playing"
                          style={{
                            width: 3,
                            height: `${h}%`,
                            animationDelay: `${(i * 0.12) % 1.6}s`,
                            animationDuration: `${1.4 + (i % 6) * 0.18}s`,
                            borderRadius: 2,
                          }}
                        />
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ width: "100%", position: "relative", height: 3, background: "rgba(184,134,26,0.2)", borderRadius: 2, marginBottom: 4 }}>
                      <div style={{ width: "30%", height: "100%", background: "var(--gold)", borderRadius: 2 }} />
                      <div style={{ position: "absolute", top: "50%", left: "30%", transform: "translate(-50%,-50%)", width: 8, height: 8, background: "var(--gold)", borderRadius: "50%", boxShadow: "0 1px 4px rgba(184,134,26,0.5)" }} />
                    </div>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 7, color: "var(--ink-muted)" }}>00:28</span>
                      <span style={{ fontSize: 7, color: "var(--ink-muted)" }}>01:42</span>
                    </div>

                    {/* Play button */}
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(184,134,26,0.35)", marginBottom: 6 }}>
                      <svg viewBox="0 0 24 24" fill="white" width={16} height={16}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                    </div>
                    <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.16em", color: "var(--ink-muted)" }}>PAUSE</p>
                  </div>
                </div>
              </div>

              {/* Shadow under phone */}
              <div style={{ width: 140, height: 14, marginTop: 6, background: "rgba(0,0,0,0.15)", filter: "blur(12px)", borderRadius: "50%" }} />
            </motion.div>

          </div>
        </div>

      </section>

      {/* Wave hero → composer section */}
      <div aria-hidden style={{ background: "#F5EEE3", height: 72, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" width="100%" height="72"><path d="M0 40 C360 72 1080 0 1440 52 L1440 72 L0 72 Z" fill="var(--ink)" /></svg>
      </div>

      {/* ══════════════════════════════ CRÉEZ VOTRE CARTE ══════════════════════════════ */}
      <section className="px-5 py-16" style={{ background: "var(--ink)" }}>
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-10">
          {/* Header */}
          <div className="text-center">
            <Label light>Depuis chez vous</Label>
            <h2 className="mt-3 text-[28px] sm:text-[34px] font-black leading-tight" style={{ color: "var(--cream)", fontFamily: "var(--font-playfair)" }}>
              Créez un cadeau unique<br />en quelques minutes.
            </h2>
            <p className="mt-3 text-[13px]" style={{ color: "rgba(240,232,216,0.5)" }}>
              Choisissez, personnalisez, enregistrez. Nous livrons votre cadeau où qu&rsquo;il soit.
            </p>
          </div>

          {/* 4 steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {[
              { n: "01", icon: (<svg viewBox="0 0 24 24" width={22} height={22} fill="none"><circle cx="12" cy="12" r="8" stroke="var(--gold)" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" stroke="var(--gold)" strokeWidth="1.4"/></svg>), label: "Votre bracelet", desc: "Choisissez le modèle NJ" },
              { n: "02", icon: (<svg viewBox="0 0 24 24" width={22} height={22} fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--gold)" strokeWidth="1.6"/><path d="M3 9h18" stroke="var(--gold)" strokeWidth="1.6"/><path d="M7 13h5M7 16h3" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round"/></svg>), label: "Votre carte", desc: "Prénom, date, message" },
              { n: "03", icon: (<svg viewBox="0 0 24 24" width={22} height={22} fill="none"><rect x="9" y="2" width="6" height="13" rx="3" stroke="var(--gold)" strokeWidth="1.6"/><path d="M5 11a7 7 0 0 0 14 0" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 18v4M9 22h6" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round"/></svg>), label: "Votre voix", desc: "Enregistrez le message" },
              { n: "04", icon: (<svg viewBox="0 0 24 24" width={22} height={22} fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="var(--gold)" strokeWidth="1.6"/><path d="M9 22V12h6v10" stroke="var(--gold)" strokeWidth="1.6"/></svg>), label: "Livraison", desc: "Où qu'il se trouve" },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: EASE }}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: "rgba(240,232,216,0.05)", border: "1px solid rgba(240,232,216,0.08)" }}
              >
                <div className="flex items-center justify-between">
                  {s.icon}
                  <span className="text-[11px] font-black" style={{ color: "rgba(184,134,26,0.45)", fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: "var(--cream)" }}>{s.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(240,232,216,0.38)" }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32, duration: 0.45, ease: EASE }}
          >
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 8px 32px rgba(184,134,26,0.38)" }}
            >
              Commencer maintenant
              <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
            <p className="text-center text-[10px] mt-3" style={{ color: "rgba(240,232,216,0.25)" }}>
              Gratuit jusqu'au paiement · Aucun compte requis
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wave composer → occasions */}
      <div aria-hidden style={{ background: "var(--ink)", height: 64, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" width="100%" height="64"><path d="M0 30 C480 64 960 8 1440 48 L1440 64 L0 64 Z" fill="white" /></svg>
      </div>

      {/* ═══════════════════════════════ OCCASIONS ═══════════════════════════════ */}
      <section className="px-5 pt-4 pb-16" style={{ background: "white" }}>
        <div className="max-w-lg mx-auto">
          <Label>Pour dire…</Label>
          <h2 className="mt-2 mb-6 text-[22px] font-black leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            Ces mots qui méritent d&rsquo;être conservés.
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {OCCASIONS.map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.45, ease: EASE }}
                whileHover={{ y: -6, scale: 1.04, boxShadow: "0 10px 30px rgba(184,134,26,0.14)", transition: { duration: 0.2, ease: "easeOut" } }}
                className="rounded-2xl py-6 px-3 flex items-center justify-center text-center cursor-default min-h-[76px]"
                style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.14)" }}
              >
                <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════ CE QUE VOTRE PROCHE RECEVRA ═══════════════════════════════ */}
      <section className="px-5 py-16" style={{ background: "white" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Label>Le coffret</Label>
            <h2 className="mt-2 text-[24px] sm:text-[28px] font-black leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
              Ce que votre proche recevra.
            </h2>
            <p className="mt-3 text-[13px]" style={{ color: "var(--ink-muted)" }}>
              Un cadeau conçu pour transmettre une émotion sincère, dès l&rsquo;ouverture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { t: "Une enveloppe premium", d: "Soigneusement conçue pour sublimer votre cadeau dès son ouverture.", icon: (<path d="M3 6l9 6 9-6M3 6h18v12H3z" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round"/>) },
              { t: "Le bracelet & son médaillon", d: "En pierre naturelle, réglable, avec le médaillon exclusif N'OUBLIE JAMAIS.", icon: (<><circle cx="12" cy="12" r="8" stroke="var(--gold)" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="var(--gold)" strokeWidth="1.3"/></>) },
              { t: "Deux cartes élégantes", d: "Pensées pour accompagner votre message avec soin.", icon: (<><rect x="4" y="6" width="14" height="12" rx="1.5" stroke="var(--gold)" strokeWidth="1.5"/><rect x="7" y="3" width="14" height="12" rx="1.5" stroke="var(--gold)" strokeWidth="1.2" opacity="0.5"/></>) },
              { t: "Un QR code personnel", d: "Donnant accès à une page privée dédiée à votre cadeau.", icon: (<><rect x="4" y="4" width="7" height="7" rx="1" stroke="var(--gold)" strokeWidth="1.5"/><rect x="13" y="4" width="7" height="7" rx="1" stroke="var(--gold)" strokeWidth="1.5"/><rect x="4" y="13" width="7" height="7" rx="1" stroke="var(--gold)" strokeWidth="1.5"/><path d="M13 13h3v3M20 13v7M16 20h4" stroke="var(--gold)" strokeWidth="1.5"/></>) },
              { t: "Un message vocal privé", d: "À écouter à tout moment, protégé par un code d'accès confidentiel.", icon: (<><rect x="9" y="2" width="6" height="12" rx="3" stroke="var(--gold)" strokeWidth="1.5"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/></>) },
              { t: "Un souvenir durable", d: "Un cadeau pensé pour laisser une trace sincère, qui traverse le temps.", icon: (<path d="M12 21l-1.45-1.32C5.4 15 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2 1.1-1.2 2.8-2 4.5-2C19.6 3 22 5.4 22 8.5c0 3.5-3.4 6.5-8.55 11.18L12 21z" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round"/>) },
            ].map((item, i) => (
              <motion.div
                key={item.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
                className="rounded-2xl p-5 flex gap-4 items-start"
                style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.12)" }}
              >
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center" style={{ background: "rgba(184,134,26,0.08)" }}>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none">{item.icon}</svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{item.t}</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>{item.d}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[11px] mt-8" style={{ color: "var(--ink-muted)", opacity: 0.7 }}>
            Bracelet ou collier · À porter chaque jour, ou à conserver pour toujours.
          </p>
        </div>
      </section>

      <div aria-hidden style={{ background: "white", height: 56, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" width="100%" height="56"><path d="M0 24 C480 56 960 0 1440 42 L1440 56 L0 56 Z" fill="var(--cream)" /></svg>
      </div>

      {/* ═══════════════════════════════ HOW IT WORKS ═══════════════════════════════ */}
      <section id="comment-ca-marche" className="px-5 py-20 sm:py-24" style={{ background: "var(--cream)" }}>
        <div className="max-w-2xl mx-auto">
          <Label>Comment ça marche</Label>
          <h2 className="mt-3 mb-12" style={{ fontSize: "clamp(28px, 4.5vw, 40px)", fontWeight: 900, lineHeight: 1.12, color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            En 3 étapes. Moins de 10 minutes.
          </h2>
          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45, ease: EASE }}
                className="flex gap-5 sm:gap-7 pb-12"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-[17px] sm:text-[19px] shrink-0"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" : "white",
                      color: i === 0 ? "white" : "var(--gold)",
                      border: i !== 0 ? "1.5px solid rgba(184,134,26,0.35)" : "none",
                      boxShadow: i === 0 ? "0 4px 18px rgba(184,134,26,0.28)" : "none",
                    }}
                  >{step.n}</div>
                  {i < STEPS.length - 1 && <div className="flex-1 w-px mt-3" style={{ background: "rgba(184,134,26,0.18)", minHeight: 32 }} />}
                </div>
                <div className="pt-2.5 sm:pt-3.5">
                  <h3 className="text-[19px] sm:text-[22px] font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{step.title}</h3>
                  <p className="text-[15px] sm:text-[16px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </section>

      <div aria-hidden style={{ background: "var(--cream)", height: 56, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" width="100%" height="56"><path d="M0 16 C600 56 840 0 1440 38 L1440 56 L0 56 Z" fill="white" /></svg>
      </div>

      {/* ═══════════════════════════════ PRICING ═══════════════════════════════ */}
      <section id="tarifs" className="py-16 overflow-hidden" style={{ background: "white" }}>
        <div className="px-5 max-w-lg mx-auto mb-8">
          <Label>Nos formules</Label>
          <h2 className="mt-2 mb-1 text-[22px] font-black leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            Un prix juste. Un souvenir à vie.
          </h2>
          <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>Paiement unique · Aucun abonnement · Lien actif pour toujours</p>
        </div>

        <div className="px-5 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-3xl overflow-hidden flex flex-col"
            style={{ background: "#FFFDF9", border: "2px solid var(--gold)", boxShadow: "0 8px 40px rgba(184,134,26,0.14)" }}
          >
            <div className="py-2 text-center shrink-0" style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" }}>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white">Le coffret N&rsquo;OUBLIE JAMAIS</span>
            </div>

            <div className="p-7 flex flex-col gap-1">
              <h3 className="text-[20px] font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{PRODUCTS[0].name}</h3>
              <p className="text-[12px] mb-2" style={{ color: "var(--ink-muted)" }}>Bracelet + carte + message vocal privé</p>

              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-[40px] font-black leading-none" style={{ color: "var(--gold)" }}>{PRODUCTS[0].price}</span>
                <span className="text-[18px] font-bold" style={{ color: "var(--gold)" }}>€</span>
                <span className="text-[12px] ml-2" style={{ color: "var(--ink-muted)" }}>Livraison incluse</span>
              </div>

              <ul className="flex flex-col gap-3 mb-6">
                {PRODUCTS[0].details.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 10 10" width={11} height={11} fill="none" className="shrink-0 mt-0.5">
                      <path d="M1.5 5.5L3.5 7.5L8.5 2.5" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[13px] leading-snug" style={{ color: "var(--ink-muted)" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/boutique"
                className="w-full py-4 rounded-2xl font-bold text-[14px] tracking-wide transition-all active:scale-[0.98] text-center block text-white"
                style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 20px rgba(184,134,26,0.28)" }}
              >
                Commander le bracelet
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6 px-5 pb-4">
          <svg viewBox="0 0 16 16" fill="none" stroke="var(--ink-muted)" strokeWidth="1.2" width={11} height={11}><rect x="2" y="5" width="12" height="9" rx="1.5"/><path d="M5 5V3.5a3 3 0 016 0V5"/></svg>
          <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Paiement sécurisé par Stripe · CB · Apple Pay · Google Pay</p>
        </div>

      </section>

      <div aria-hidden style={{ background: "white", height: 56, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" width="100%" height="56"><path d="M0 38 C400 0 1000 56 1440 16 L1440 56 L0 56 Z" fill="var(--cream)" /></svg>
      </div>

      {/* ═══════════════════════════════ TESTIMONIALS ═══════════════════════════════ */}
      <section className="py-16 overflow-hidden" style={{ background: "var(--cream)" }}>
        <div className="px-5 max-w-lg mx-auto mb-8">
          <Label>Témoignages</Label>
          <h2 className="mt-2 text-[22px] font-black leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            Ils ont offert. Ils ont vu la réaction.
          </h2>
        </div>

        {/* Horizontal centered carousel — card width 272px */}
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            paddingLeft: "calc((100vw - 272px) / 2)",
            paddingRight: "calc((100vw - 272px) / 2)",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: EASE }}
              className="rounded-2xl p-5 flex flex-col shrink-0"
              style={{
                width: 272,
                scrollSnapAlign: "center",
                background: "white",
                border: "1px solid rgba(184,134,26,0.10)",
                boxShadow: "0 2px 16px rgba(184,134,26,0.05)",
              }}
            >
              <div className="flex gap-0.5 mb-3">{Array(5).fill(null).map((_, j) => <span key={j} style={{ color: "var(--gold)", fontSize: 12 }}>★</span>)}</div>
              <p className="text-[13px] leading-relaxed mb-4 flex-1" style={{ color: "var(--ink-light)", fontFamily: "var(--font-playfair)", fontStyle: "italic" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0" style={{ background: "rgba(184,134,26,0.12)", color: "var(--gold)" }}>{t.name[0]}</div>
                <div>
                  <p className="text-[12px] font-bold leading-none" style={{ color: "var(--ink)" }}>{t.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--ink-muted)" }}>{t.context}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      <div aria-hidden style={{ background: "var(--cream)", height: 56, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" width="100%" height="56"><path d="M0 12 C500 56 900 0 1440 44 L1440 56 L0 56 Z" fill="white" /></svg>
      </div>

      {/* ═══════════════════════════════ FAQ ═══════════════════════════════ */}
      <section id="faq" className="px-5 py-16" style={{ background: "white" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:gap-16">

            {/* Left: title sticky */}
            <div className="md:w-56 shrink-0 mb-8 md:mb-0 md:sticky md:top-28">
              <Label>Questions fréquentes</Label>
              <h2 className="mt-3 font-black leading-tight" style={{ fontSize: "clamp(28px, 4vw, 38px)", color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Tout ce que vous devez savoir.
              </h2>
              <div className="mt-4 w-8 h-0.5 rounded-full" style={{ background: "var(--gold)" }} />
            </div>

            {/* Right: accordion */}
            <div className="flex-1 flex flex-col divide-y" style={{ borderTop: "1px solid rgba(184,134,26,0.12)", borderBottom: "1px solid rgba(184,134,26,0.12)" }}>
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: EASE }}
                >
                  <button
                    className="w-full text-left py-5 flex items-start justify-between gap-4 group"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ borderLeft: openFaq === i ? "3px solid var(--gold)" : "3px solid transparent", paddingLeft: openFaq === i ? 14 : 0, transition: "padding 0.2s, border-color 0.2s" }}
                  >
                    <span className="text-[14px] font-semibold leading-snug flex-1" style={{ color: openFaq === i ? "var(--ink)" : "var(--ink-light)" }}>
                      {faq.q}
                    </span>
                    <motion.svg
                      viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      width={16} height={16} className="shrink-0 mt-0.5"
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="pb-5 text-[13px] leading-relaxed" style={{ color: "var(--ink-muted)", paddingLeft: 17 }}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

      </section>

      <div aria-hidden style={{ background: "white", height: 56, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" width="100%" height="56"><path d="M0 44 C360 0 1080 56 1440 14 L1440 56 L0 56 Z" fill="var(--cream)" /></svg>
      </div>

      {/* ═══════════════════════════════ FINAL CTA ═══════════════════════════════ */}
      <section className="px-5 py-20 relative overflow-hidden" style={{ background: "var(--cream)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(184,134,26,0.08) 0%, transparent 70%)" }} />
        <div className="relative max-w-lg mx-auto flex flex-col items-center text-center gap-4">
          <div className="float-logo"><Logo size={60} /></div>
          <p className="text-[9px] font-black tracking-[0.28em] uppercase text-shimmer">N&rsquo;OUBLIE JAMAIS</p>
          <h2 className="text-[26px] font-black leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            Prêt à offrir un souvenir qui dure toute une vie ?
          </h2>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-muted)", maxWidth: 270 }}>
            En moins de 10 minutes. Un message qui sera écouté pour toujours.
          </p>
          <Link
            href="/boutique"
            className="mt-2 w-full max-w-[280px] py-4 rounded-2xl font-bold text-white text-[14px] tracking-wide text-center block transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 24px rgba(184,134,26,0.28)" }}
          >
            Commander le bracelet
          </Link>
        </div>
      </section>

      {/* Wave cta → footer */}
      <div aria-hidden style={{ background: "var(--cream)", height: 56, lineHeight: 0, overflow: "hidden", margin: "0 8px", borderRadius: "0 0 0 0" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" width="100%" height="56">
          <path d="M0 20 C400 56 1000 0 1440 36 L1440 56 L0 56 Z" fill="var(--ink)" />
        </svg>
      </div>

      {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer style={{ background: "var(--ink)", color: "var(--cream)", borderRadius: "0 0 12px 12px", overflow: "hidden", margin: "0 8px 8px" }}>

        <div className="px-5 pt-12 pb-8 max-w-5xl mx-auto">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 mb-10">
            {/* Brand column */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Logo size={52} />
                <div>
                  <p className="text-[14px] font-black tracking-[0.22em] uppercase" style={{ color: "var(--cream)" }}>N&rsquo;OUBLIE JAMAIS</p>
                  <p className="text-[10px] tracking-[0.16em] uppercase mt-0.5" style={{ color: "var(--gold)" }}>La carte vocale</p>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: "rgba(250,246,239,0.6)", fontFamily: "var(--font-playfair)", fontStyle: "italic" }}>
                &ldquo;Un souvenir qui traverse le temps.&rdquo;
              </p>
              <div className="flex items-center gap-1.5">
                {Array(5).fill(null).map((_, i) => <span key={i} style={{ color: "var(--gold)", fontSize: 15 }}>★</span>)}
                <span className="text-[12px] ml-1.5 font-semibold" style={{ color: "rgba(250,246,239,0.5)" }}>4,9/5</span>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-4" style={{ color: "var(--gold)" }}>Navigation</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { href: "#comment-ca-marche", label: "Comment ça marche" },
                  { href: "#tarifs", label: "Nos formules" },
                  { href: "#faq", label: "Questions fréquentes" },
                  { href: "/listen/demo", label: "Écouter un exemple" },
                ].map((l) => (
                  <a key={l.label} href={l.href} className="text-[13px] transition-colors" style={{ color: "rgba(250,246,239,0.65)" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-4" style={{ color: "var(--gold)" }}>Légal & Contact</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { href: "/cgv", label: "Conditions générales de vente" },
                  { href: "/mentions-legales", label: "Mentions légales" },
                  { href: "/confidentialite", label: "Politique de confidentialité" },
                  { href: "mailto:contact@noubliez-jamais.fr", label: "Nous contacter" },
                ].map((l) => (
                  <a key={l.label} href={l.href} className="text-[13px] transition-colors" style={{ color: "rgba(250,246,239,0.65)" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(250,246,239,0.08)", marginBottom: 24 }} />

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px]" style={{ color: "rgba(250,246,239,0.35)" }}>
              © {new Date().getFullYear()} N&rsquo;OUBLIE JAMAIS · Tous droits réservés
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(250,246,239,0.05)", border: "1px solid rgba(250,246,239,0.08)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(250,246,239,0.4)" strokeWidth="1.5" width={13} height={13}><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20"/></svg>
              <span className="text-[11px]" style={{ color: "rgba(250,246,239,0.40)" }}>Paiement sécurisé par Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Label({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className="text-[9px] font-black tracking-[0.28em] uppercase"
      style={light ? { color: "var(--gold)" } : undefined}
    >
      {light ? children : <span className="text-shimmer">{children}</span>}
    </p>
  );
}
