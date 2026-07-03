"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Bouton "Marquer comme expédiée" / "Annuler l'expédition" (page admin).
export default function MarkShippedButton({ slug, shipped }: { slug: string; shipped: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipped: !shipped }),
      });
      if (!res.ok) {
        alert("La mise à jour a échoué.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (shipped) {
    return (
      <button onClick={toggle} disabled={busy} className="text-[11px] underline disabled:opacity-40" style={{ color: "var(--ink-muted)" }}>
        Annuler l&rsquo;expédition
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="px-4 py-2.5 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
      style={{ background: "#16a34a", boxShadow: "0 3px 12px rgba(22,163,74,0.25)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
        <path d="M5 12l5 5L19 7" />
      </svg>
      {busy ? "…" : "Marquer expédiée"}
    </button>
  );
}
