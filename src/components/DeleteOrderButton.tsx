"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const CONFIRM_WORD = "SUPPRIMER";

// Bouton de suppression d'une commande (page admin). Suppression définitive
// et irréversible (message vocal + QR code), donc confirmation par saisie
// d'un mot-clé plutôt qu'un simple window.confirm() — trop facile à valider
// par réflexe (retour client : suppression accidentelle d'une carte en
// voulant juste "faire de la place" dans la liste).
export default function DeleteOrderButton({ slug, label }: { slug: string; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    setOpen(false);
    setConfirmText("");
    setError("");
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "La suppression a échoué.");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Supprimer la carte ${label}`}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
        style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)" }}
        title="Supprimer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.7" strokeLinecap="round" width={13} height={13}>
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(28,20,16,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
              onClick={close}
            />

            <motion.div
              role="dialog" aria-modal="true"
              className="relative w-full sm:max-w-sm max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
              style={{ background: "white", boxShadow: "0 24px 80px rgba(28,20,16,0.35)" }}
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div style={{ height: 4, background: "linear-gradient(to right, #C0392B, #E08070, #C0392B)" }} />

              <div className="px-6 py-7">
                <h2 className="text-[17px] font-black leading-tight mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                  Supprimer définitivement ?
                </h2>
                <p className="text-[13px] leading-relaxed mb-1" style={{ color: "var(--ink-muted)" }}>
                  La carte <strong style={{ color: "var(--ink)" }}>{label}</strong> sera supprimée.
                </p>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#C0392B" }}>
                  Le message vocal et le QR code ne fonctionneront plus. Cette action est irréversible.
                </p>

                <label className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--ink-muted)" }}>
                  Tapez {CONFIRM_WORD} pour confirmer
                </label>
                <input
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_WORD}
                  className="w-full mt-2 px-4 py-3 rounded-xl text-[14px] outline-none"
                  style={{ border: "1.5px solid rgba(192,57,43,0.25)", color: "var(--ink)" }}
                />

                {error && <p className="text-[12px] mt-2" style={{ color: "#C0392B" }}>{error}</p>}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={close}
                    disabled={busy}
                    className="flex-1 py-3 rounded-xl font-bold text-[13px] transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--cream)", color: "var(--ink-muted)" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={remove}
                    disabled={busy || confirmText.trim().toUpperCase() !== CONFIRM_WORD}
                    className="flex-1 py-3 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "#C0392B" }}
                  >
                    {busy ? "Suppression…" : "Supprimer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
