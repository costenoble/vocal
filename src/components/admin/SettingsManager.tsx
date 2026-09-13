"use client";

import { useState } from "react";

type Shipping = { france: number; europe: number; horsEurope: number };

function AmountRow({
  title, caption, value, onChange,
}: { title: string; caption: string; value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: "#FFFDF9", border: "1.5px solid rgba(28,20,16,0.08)" }}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>{title}</p>
        <p className="text-[12px] truncate" style={{ color: "var(--ink-muted)" }}>{caption}</p>
      </div>
      <div className="relative shrink-0">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3.5 py-2.5 pr-8 rounded-xl text-[15px] font-bold outline-none w-[92px] text-right"
          style={{ background: "white", border: "1.5px solid rgba(28,20,16,0.12)", color: "var(--ink)" }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold" style={{ color: "var(--ink-muted)" }}>€</span>
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
    <div className="rounded-3xl p-5 sm:p-6" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
      <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
        Frais de livraison
      </h2>
      <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--ink-muted)" }}>
        Montant ajouté automatiquement au prix de l&rsquo;article selon la destination de la commande,
        affiché au client dès le panier. Mettez <strong>0</strong> pour désactiver un palier.
      </p>

      <div className="flex flex-col gap-2.5 mb-5">
        <AmountRow title="France" caption="Livraison en France" value={france} onChange={change(setFrance)} />
        <AmountRow title="Europe" caption="Belgique, Suisse, Luxembourg" value={europe} onChange={change(setEurope)} />
        <AmountRow title="Hors Europe" caption="Canada et autres pays" value={horsEurope} onChange={change(setHorsEurope)} />
      </div>

      {error && <p className="text-[12px] mb-3" style={{ color: "#C0392B" }}>{error}</p>}
      {!error && !valid && <p className="text-[12px] mb-3" style={{ color: "#C0392B" }}>Montant invalide.</p>}

      <button
        onClick={save}
        disabled={!valid || saving || saved}
        className="w-full py-3.5 rounded-xl font-bold text-[14px] text-white transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" }}
      >
        {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
      </button>
    </div>
  );
}
