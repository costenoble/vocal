"use client";

import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Logo size={80} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(184,134,26,0.10)", border: "1.5px solid rgba(184,134,26,0.25)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={2} width={24} height={24}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="text-xl font-black" style={{ color: "var(--ink)" }}>Paiement annulé</h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Votre commande n&apos;a pas été finalisée. Aucun montant n&apos;a été débité.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col gap-3 w-full">
          <Link
            href="/#tarifs"
            className="w-full py-4 rounded-2xl font-bold text-white text-center text-sm block transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" }}
          >
            Réessayer
          </Link>
          <Link href="/" className="text-sm font-medium" style={{ color: "var(--ink-muted)" }}>
            ← Retour à l&apos;accueil
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
