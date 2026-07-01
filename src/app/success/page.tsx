"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const boutiqueSlug = params.get("slug");
  const isBoutique = !!boutiqueSlug && params.get("boutique") === "1";

  type Status = "verifying" | "waiting" | "ready" | "error";
  const [status, setStatus] = useState<Status>("verifying");
  const [slug, setSlug] = useState<string>("");
  const [toName, setToName] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stripeSlugRef = useRef<string>("");

  useEffect(() => {
    // Boutique mode: the order already exists, no Stripe verification needed.
    if (isBoutique && boutiqueSlug) {
      setSlug(boutiqueSlug);
      setStatus("ready");
      return;
    }

    if (!sessionId) { setStatus("error"); return; }

    fetch(`/api/stripe/checkout?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) { setStatus("error"); return; }
        if (json.slug) stripeSlugRef.current = json.slug;
        setStatus("waiting");

        // Poll for the Message record (created by webhook, usually within 2s)
        let attempts = 0;
        pollRef.current = setInterval(async () => {
          attempts++;
          try {
            const res = await fetch(`/api/listen-link?session_id=${sessionId}`);
            const data = await res.json();
            if (data.ready && data.slug) {
              clearInterval(pollRef.current!);
              setSlug(data.slug);
              setToName(data.toName ?? "");
              setStatus("ready");
            } else if (attempts >= 15) {
              clearInterval(pollRef.current!);
              if (stripeSlugRef.current) setSlug(stripeSlugRef.current);
              setStatus("ready");
            }
          } catch {
            if (attempts >= 15) {
              clearInterval(pollRef.current!);
              if (stripeSlugRef.current) setSlug(stripeSlugRef.current);
              setStatus("ready");
            }
          }
        }, 2000);
      })
      .catch(() => setStatus("error"));

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sessionId, isBoutique, boutiqueSlug]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}>
          <Logo size={80} />
        </motion.div>

        {(status === "verifying" || status === "waiting") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
            <div>
              <p className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>
                {status === "verifying" ? "Vérification du paiement…" : "Création de votre carte…"}
              </p>
              <p className="text-[12px] mt-1" style={{ color: "var(--ink-muted)" }}>Quelques secondes suffiront.</p>
            </div>
          </motion.div>
        )}

        {status === "ready" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: EASE }} className="flex flex-col items-center gap-5 w-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 18 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 6px 24px rgba(184,134,26,0.32)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" width={28} height={28}>
                <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <div>
              <h1 className="text-[24px] font-black" style={{ color: "var(--ink)" }}>
                {isBoutique ? "Commande créée !" : "Votre carte est prête !"}
              </h1>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                {isBoutique
                  ? "Imprimez la carte (avec son QR code et son code d'accès) à glisser dans le coffret."
                  : toName
                  ? `${toName} peut maintenant écouter votre message en scannant le QR code.`
                  : "Votre destinataire peut écouter votre message en scannant le QR code."}
              </p>
            </div>

            {slug ? (
              <>
                {isBoutique && (
                  <a
                    href={`/api/pdf/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl font-bold text-white text-center text-[15px] block transition-all active:scale-95"
                    style={{ background: "var(--ink)" }}
                  >
                    Imprimer la carte →
                  </a>
                )}
                <Link
                  href={`/listen/${slug}`}
                  className="w-full py-4 rounded-2xl font-bold text-white text-center text-[15px] block transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 20px rgba(184,134,26,0.28)" }}
                >
                  {isBoutique ? "Voir la page d'écoute →" : "Voir ma carte d'écoute →"}
                </Link>
                <p className="text-[10px]" style={{ color: "rgba(28,20,16,0.3)" }}>
                  vocale.fr/listen/{slug}
                </p>
              </>
            ) : (
              <div className="rounded-2xl px-5 py-4 w-full" style={{ background: "white", border: "1px solid rgba(184,134,26,0.15)" }}>
                <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
                  Votre lien d&apos;écoute vous a été envoyé par email. Vérifiez votre boîte de réception.
                </p>
              </div>
            )}

            <Link href="/" className="text-[12px] font-semibold" style={{ color: "var(--ink-muted)", opacity: 0.5 }}>
              ← Retour à l&apos;accueil
            </Link>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            <p className="text-[14px]" style={{ color: "var(--ink-muted)" }}>Session introuvable ou expirée.</p>
            <Link href="/" className="text-[13px] font-semibold" style={{ color: "var(--gold)" }}>
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
