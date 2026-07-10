"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import Logo from "@/components/Logo";
import BackButton from "@/components/BackButton";
import { useCart, removeFromCart, cartTotal, type CartItem } from "@/lib/cart";

const COUNTRIES = ["France", "Belgique", "Suisse", "Luxembourg", "Canada", "Autre"];

function CartRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "#F5EED5" }}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Logo size={32} /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{item.productName}</p>
        <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>
          {item.productSize ? `Taille ${item.productSize} · ` : ""}De {item.fromName} pour {item.toName}
        </p>
        <p className="text-[13px] font-black mt-0.5" style={{ color: "var(--gold)" }}>{item.price},00 €</p>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0"
        style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)" }}
        aria-label="Retirer cet article"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.7" strokeLinecap="round" width={13} height={13}>
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}

export default function CartPage() {
  const items = useCart();
  const total = cartTotal(items);

  const [email, setEmail] = useState("");
  const [ship, setShip] = useState({ fullName: "", address: "", complement: "", postalCode: "", city: "", country: "France" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (k: keyof typeof ship, v: string) => setShip((s) => ({ ...s, [k]: v }));

  const shippingValid =
    ship.fullName.trim() && ship.address.trim() && ship.postalCode.trim() && ship.city.trim() && ship.country.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const pay = async () => {
    if (!emailValid) { setError("Veuillez saisir un email valide pour recevoir la confirmation."); return; }
    if (!shippingValid) { setError("Veuillez compléter l'adresse de livraison."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          shipping: ship,
          items: items.map((i) => ({
            productSlug: i.productSlug,
            productSize: i.productSize,
            fromName: i.fromName,
            toName: i.toName,
            date: i.date,
            theme: i.theme,
            paper: i.paper,
            cardFont: i.cardFont,
            message: i.message,
            audioUrl: i.audioUrl,
          })),
        }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url; // redirection Stripe (le panier est vidé au retour /success)
      } else {
        setError(json.error || "Erreur lors du paiement. Réessayez.");
        setLoading(false);
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  const inputStyle = { background: "white", border: "1.5px solid rgba(28,20,16,0.10)", color: "var(--ink)" } as const;
  const inputCls = "w-full px-4 py-3 rounded-xl text-[14px] outline-none";
  const labelCls = "text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5 block";

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-5 py-14">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--ink-muted)" }}>
            <Link href="/" style={{ color: "var(--ink-muted)" }}>Accueil</Link>
            <span>/</span>
            <Link href="/boutique" style={{ color: "var(--ink-muted)" }}>Boutique</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>Panier</span>
          </div>
          <BackButton fallback="/boutique" />
        </div>

        <h1 className="text-[30px] font-black mb-8" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
          Votre panier
        </h1>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl py-16 text-center" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
            <Logo size={56} />
            <p className="text-sm mt-4 mb-6" style={{ color: "var(--ink-muted)" }}>Votre panier est vide pour le moment.</p>
            <Link href="/boutique" className="inline-block px-6 py-3 rounded-2xl font-bold text-[14px] text-white" style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))" }}>
              Visiter la boutique
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Articles */}
            <div className="rounded-3xl px-5" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
              <div className="divide-y" style={{ borderColor: "rgba(184,134,26,0.08)" }}>
                {items.map((i) => <CartRow key={i.id} item={i} />)}
              </div>
            </div>

            <Link href="/boutique" className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--gold-dark)" }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M8 3v10M3 8h10" /></svg>
              Ajouter un autre bijou
            </Link>

            {/* Email */}
            <div className="rounded-3xl p-6" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--gold)" }}>Votre email</h2>
              <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Pour recevoir la confirmation *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.fr" className={inputCls} style={inputStyle} />
            </div>

            {/* Livraison */}
            <div className="rounded-3xl p-6" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--gold)" }}>Adresse de livraison</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Nom complet *</label>
                  <input value={ship.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Prénom Nom" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Adresse *</label>
                  <input value={ship.address} onChange={(e) => setField("address", e.target.value)} placeholder="12 rue des Roses" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Complément</label>
                  <input value={ship.complement} onChange={(e) => setField("complement", e.target.value)} placeholder="Apt, bâtiment… (optionnel)" className={inputCls} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Code postal *</label>
                    <input value={ship.postalCode} onChange={(e) => setField("postalCode", e.target.value)} placeholder="75001" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Ville *</label>
                    <input value={ship.city} onChange={(e) => setField("city", e.target.value)} placeholder="Paris" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Pays *</label>
                  <select value={ship.country} onChange={(e) => setField("country", e.target.value)} className={`${inputCls} appearance-none`} style={{ ...inputStyle, cursor: "pointer" }}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Total + paiement */}
            <div className="rounded-3xl p-6" style={{ background: "#FFFDF9", border: "2px solid var(--gold)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px]" style={{ color: "var(--ink-muted)" }}>{items.length} article{items.length > 1 ? "s" : ""}</span>
                <span className="text-[14px]" style={{ color: "var(--ink-muted)" }}>Livraison incluse</span>
              </div>
              <div className="flex items-baseline justify-between mb-5">
                <span className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Total</span>
                <span className="text-[32px] font-black" style={{ color: "var(--gold)" }}>{total},00 €</span>
              </div>

              {error && <p className="text-[12px] font-semibold mb-3 text-center" style={{ color: "#C0392B" }}>{error}</p>}

              <button
                onClick={pay}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 20px rgba(184,134,26,0.28)" }}
              >
                {loading ? "Redirection…" : "Payer ma commande"}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <svg viewBox="0 0 16 16" fill="none" stroke="var(--ink-muted)" strokeWidth="1.2" width={11} height={11}><rect x="2" y="5" width="12" height="9" rx="1.5"/><path d="M5 5V3.5a3 3 0 016 0V5"/></svg>
                <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Paiement sécurisé par Stripe · CB · Apple Pay</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
