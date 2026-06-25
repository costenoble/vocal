"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    // Verify session on client side
    fetch(`/api/stripe/checkout?session_id=${sessionId}`)
      .then((r) => (r.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}>
          <Logo size={90} />
        </motion.div>

        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Vérification du paiement…</p>
          </motion.div>
        )}

        {status === "ok" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: EASE }} className="flex flex-col items-center gap-5 w-full">
            {/* Check icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 24px rgba(184,134,26,0.3)" }}
            >
              <svg viewBox="0 0 24 24" fill="white" width={28} height={28}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
            </motion.div>

            <div>
              <h1 className="text-2xl font-black" style={{ color: "var(--ink)" }}>Paiement confirmé !</h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                Merci pour votre commande. Créez maintenant votre carte vocale personnalisée.
              </p>
            </div>

            <Link
              href={`/create?session_id=${sessionId}`}
              className="w-full py-4 rounded-2xl font-bold text-white text-center text-base block transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 20px rgba(184,134,26,0.28)" }}
            >
              Créer ma carte maintenant →
            </Link>

            <p className="text-xs" style={{ color: "var(--ink-muted)", opacity: 0.6 }}>
              Un email de confirmation vous a été envoyé.
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Session introuvable ou expirée.</p>
            <Link href="/" className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
              ← Retour à l&apos;accueil
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
