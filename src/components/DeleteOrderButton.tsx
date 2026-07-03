"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Bouton de suppression d'une commande (page admin), avec confirmation.
export default function DeleteOrderButton({ slug, label }: { slug: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!window.confirm(`Supprimer définitivement la carte « ${label} » ?\n\nLe message vocal et le QR code ne fonctionneront plus.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "La suppression a échoué.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={remove}
      disabled={busy}
      aria-label={`Supprimer la carte ${label}`}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
      style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)" }}
      title="Supprimer"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.7" strokeLinecap="round" width={13} height={13}>
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
