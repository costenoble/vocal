"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Bouton d'archivage d'une commande (page admin). N'efface plus rien : la
// commande disparaît juste de la liste principale, le message vocal et le
// QR code du client continuent de fonctionner (retour client : une carte
// avait été supprimée par erreur en voulant juste désencombrer la liste).
export default function DeleteOrderButton({ slug, label }: { slug: string; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    setOpen(false);
    setError("");
  };

  const archive = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "L'archivage a échoué.");
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
        aria-label={`Archiver la carte ${label}`}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
        style={{ background: "rgba(28,20,16,0.05)", border: "1px solid rgba(28,20,16,0.12)" }}
        title="Archiver"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
          <rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 13h4" />
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
              <div style={{ height: 4, background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />

              <div className="px-6 py-7">
                <h2 className="text-[17px] font-black leading-tight mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                  Archiver cette carte ?
                </h2>
                <p className="text-[13px] leading-relaxed mb-1" style={{ color: "var(--ink-muted)" }}>
                  La carte <strong style={{ color: "var(--ink)" }}>{label}</strong> sera retirée de cette liste.
                </p>
                <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--ink-muted)" }}>
                  Le message vocal et le QR code du client continueront de fonctionner normalement — rien n&rsquo;est supprimé.
                </p>

                {error && <p className="text-[12px] mb-3" style={{ color: "#C0392B" }}>{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={close}
                    disabled={busy}
                    className="flex-1 py-3 rounded-xl font-bold text-[13px] transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--cream)", color: "var(--ink-muted)" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={archive}
                    disabled={busy}
                    className="flex-1 py-3 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--ink)" }}
                  >
                    {busy ? "Archivage…" : "Archiver"}
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
