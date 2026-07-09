"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Bouton "Marquer comme expédiée" avec saisie optionnelle d'un numéro de suivi
// (qui déclenche l'email d'expédition au client), et "Annuler l'expédition".
export default function MarkShippedButton({ slug, shipped }: { slug: string; shipped: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");

  const send = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { alert("La mise à jour a échoué."); return; }
      const json = await res.json().catch(() => ({}));
      if (json.emailSent) {
        // petit retour visuel
        console.info("Email de suivi envoyé au client.");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (shipped) {
    return (
      <button onClick={() => send({ shipped: false })} disabled={busy} className="text-[11px] underline disabled:opacity-40" style={{ color: "var(--ink-muted)" }}>
        Annuler l&rsquo;expédition
      </button>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        disabled={busy}
        className="px-4 py-2.5 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
        style={{ background: "#16a34a", boxShadow: "0 3px 12px rgba(22,163,74,0.25)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
          <path d="M5 12l5 5L19 7" />
        </svg>
        Marquer expédiée
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl p-3 flex flex-col gap-2" style={{ background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.20)" }}>
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#15803d" }}>Numéro de suivi (optionnel)</p>
      <div className="flex gap-2">
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Ex : 6A12345678901"
          className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: "white", border: "1px solid rgba(28,20,16,0.12)", color: "var(--ink)" }}
        />
        <input
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          placeholder="Transporteur"
          className="w-28 px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: "white", border: "1px solid rgba(28,20,16,0.12)", color: "var(--ink)" }}
        />
      </div>
      <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
        {tracking.trim() ? "Un email avec ce suivi sera envoyé au client." : "Sans numéro, le client ne recevra pas d'email de suivi."}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => send({ shipped: true, trackingNumber: tracking.trim(), carrier: carrier.trim() })}
          disabled={busy}
          className="px-4 py-2.5 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "#16a34a" }}
        >
          {busy ? "…" : "Confirmer l'expédition"}
        </button>
        <button onClick={() => setExpanded(false)} disabled={busy} className="text-[12px]" style={{ color: "var(--ink-muted)" }}>
          Annuler
        </button>
      </div>
    </div>
  );
}
