"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

const EASE = [0.22, 1, 0.36, 1] as const;
const SUBJECTS = ["Question avant achat", "Suivi de ma commande", "Problème avec ma carte", "Autre"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  // Bloque le scroll de la page derrière l'overlay + fermeture par Échap.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau. Réessayez.");
      setState("idle");
    }
  };

  const inputStyle = {
    background: "var(--cream)",
    border: "1px solid rgba(184,134,26,0.22)",
    color: "var(--ink)",
  } as const;
  const labelCls = "text-[11px] font-bold tracking-[0.12em] uppercase";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(28,20,16,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Panneau */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Formulaire de contact"
            className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{ background: "white", boxShadow: "0 24px 80px rgba(28,20,16,0.35)" }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div style={{ height: 4, background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.2)" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6" strokeLinecap="round" width={13} height={13}>
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            <div className="px-6 sm:px-8 py-8">
              {state === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center gap-4 py-6"
                >
                  <Logo size={64} />
                  <div
                    className="w-13 h-13 rounded-full flex items-center justify-center"
                    style={{ width: 52, height: 52, background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 20px rgba(184,134,26,0.3)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" width={24} height={24}>
                      <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                      Message envoyé ♥
                    </h2>
                    <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                      Merci {name.split(" ")[0]}. Nous vous répondons sous 24 h ouvrées, à l&rsquo;adresse {email}.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                    style={{ background: "var(--ink)" }}
                  >
                    Fermer
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Logo size={44} />
                    <div>
                      <h2 className="text-[19px] font-black leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                        Nous contacter
                      </h2>
                      <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>Réponse sous 24 h ouvrées</p>
                    </div>
                  </div>

                  <form onSubmit={send} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="ct-name" className={labelCls} style={{ color: "var(--ink-muted)" }}>Votre nom *</label>
                        <input
                          id="ct-name" required maxLength={80} value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Marie Dupont"
                          className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="ct-email" className={labelCls} style={{ color: "var(--ink-muted)" }}>Votre email *</label>
                        <input
                          id="ct-email" required type="email" maxLength={120} value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="marie@email.fr"
                          className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ct-subject" className={labelCls} style={{ color: "var(--ink-muted)" }}>Sujet</label>
                      <select
                        id="ct-subject" value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="px-3.5 py-3 rounded-xl text-[14px] outline-none appearance-none"
                        style={inputStyle}
                      >
                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ct-message" className={labelCls} style={{ color: "var(--ink-muted)" }}>Votre message *</label>
                      <textarea
                        id="ct-message" required maxLength={3000} rows={5} value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Bonjour, j'aurais une question concernant…"
                        className="px-3.5 py-3 rounded-xl text-[14px] outline-none resize-none leading-relaxed"
                        style={inputStyle}
                      />
                    </div>

                    {error && <p className="text-[12px] font-semibold" style={{ color: "#C0392B" }}>{error}</p>}

                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="w-full py-4 rounded-2xl font-bold text-[14px] text-white transition-all active:scale-[0.98] disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 18px rgba(184,134,26,0.28)" }}
                    >
                      {state === "sending" ? "Envoi en cours…" : "Envoyer mon message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
