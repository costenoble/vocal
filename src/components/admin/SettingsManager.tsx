"use client";

import { useState } from "react";

export default function SettingsManager({ initialShippingSurcharge }: { initialShippingSurcharge: number }) {
  const [value, setValue] = useState(String(initialShippingSurcharge));
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const amount = Number(value.replace(",", "."));
  const valid = Number.isFinite(amount) && amount >= 0;

  const save = async () => {
    if (!valid) { setError("Montant invalide."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingSurcharge: amount }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Erreur lors de l'enregistrement.");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl p-6" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
      <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
        Supplément de livraison hors France
      </h2>
      <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--ink-muted)" }}>
        Le prix affiché sur le site inclut la livraison pour la France uniquement. Ce montant est
        ajouté automatiquement au paiement dès que l&rsquo;adresse de livraison est dans un autre pays
        (Belgique, Suisse, Luxembourg, Canada, Autre). Mettez <strong>0</strong> pour désactiver.
      </p>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); }}
            className="px-4 py-3 pr-9 rounded-xl text-[15px] font-bold outline-none w-32"
            style={{ background: "#FFFDF9", border: "1.5px solid rgba(28,20,16,0.10)", color: "var(--ink)" }}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: "var(--ink-muted)" }}>€</span>
        </div>
        <button
          onClick={save}
          disabled={!valid || saving || saved}
          className="px-5 py-3 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" }}
        >
          {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
        </button>
      </div>

      {error && <p className="text-[12px] mt-2" style={{ color: "#C0392B" }}>{error}</p>}
      {!error && !valid && <p className="text-[12px] mt-2" style={{ color: "#C0392B" }}>Montant invalide.</p>}
    </div>
  );
}
