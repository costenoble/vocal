"use client";

import { useState } from "react";

type Shipping = { france: number; europe: number; horsEurope: number };

function AmountInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "var(--ink-muted)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-4 py-3 pr-9 rounded-xl text-[15px] font-bold outline-none w-32"
          style={{ background: "#FFFDF9", border: "1.5px solid rgba(28,20,16,0.10)", color: "var(--ink)" }}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: "var(--ink-muted)" }}>€</span>
      </div>
    </div>
  );
}

export default function SettingsManager({ initialShipping }: { initialShipping: Shipping }) {
  const [france, setFrance] = useState(String(initialShipping.france));
  const [europe, setEurope] = useState(String(initialShipping.europe));
  const [horsEurope, setHorsEurope] = useState(String(initialShipping.horsEurope));
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const franceAmount = Number(france.replace(",", "."));
  const europeAmount = Number(europe.replace(",", "."));
  const horsEuropeAmount = Number(horsEurope.replace(",", "."));
  const valid = [franceAmount, europeAmount, horsEuropeAmount].every((n) => Number.isFinite(n) && n >= 0);

  const change = (setter: (v: string) => void) => (v: string) => { setter(v); setSaved(false); };

  const save = async () => {
    if (!valid) { setError("Montant invalide."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ france: franceAmount, europe: europeAmount, horsEurope: horsEuropeAmount }),
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
        Frais de livraison
      </h2>
      <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--ink-muted)" }}>
        Montant ajouté automatiquement au prix de l&rsquo;article selon la destination de la commande,
        affiché au client dès le panier. Mettez <strong>0</strong> pour désactiver un palier.
      </p>

      <div className="flex flex-wrap items-end gap-4 mb-2">
        <AmountInput label="France" value={france} onChange={change(setFrance)} />
        <AmountInput label="Europe — Belgique, Suisse, Luxembourg" value={europe} onChange={change(setEurope)} />
        <AmountInput label="Hors Europe — Canada, autres pays" value={horsEurope} onChange={change(setHorsEurope)} />
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
