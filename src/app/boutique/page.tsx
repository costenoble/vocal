"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Logo from "@/components/Logo";
import { PRODUCTS } from "@/lib/products";

const OCCASIONS = [
  "Naissance", "Mariage", "Anniversaire", "Famille",
  "Amitié", "Je t'aime", "Grand-parent", "Remerciement",
];

export default function BoutiquePage() {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const product = PRODUCTS[0];
  const SIZES = product.sizes;

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-5 py-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 text-[11px]" style={{ color: "var(--ink-muted)" }}>
          <Link href="/" style={{ color: "var(--ink-muted)" }}>Accueil</Link>
          <span>/</span>
          <span style={{ color: "var(--ink)" }}>Boutique</span>
        </div>

        {/* Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden aspect-square"
            style={{ background: "#F5EED5" }}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Placeholder if no image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ zIndex: -1 }}>
              <Logo size={80} />
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--gold)" }}>N&rsquo;OUBLIE JAMAIS</p>
            </div>

            {/* Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "var(--gold)", color: "white" }}>
              Édition limitée
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gold)" }}>
                Coffret cadeau · Carte vocale incluse
              </p>
              <h1 className="text-[36px] font-black leading-tight mb-3" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                {product.name}
              </h1>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-[42px] font-black" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                {product.price} €
              </span>
              <span className="text-[13px]" style={{ color: "var(--ink-muted)" }}>TTC · Livraison incluse</span>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: "rgba(184,134,26,0.15)" }} />

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
                  Tour de poignet
                </p>
                {selectedSize && (
                  <span className="text-[12px]" style={{ color: "var(--gold)" }}>{selectedSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{
                      background: selectedSize === size ? "var(--ink)" : "white",
                      color: selectedSize === size ? "white" : "var(--ink)",
                      border: selectedSize === size ? "1.5px solid transparent" : "1.5px solid rgba(28,20,16,0.12)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-[11px] mt-2" style={{ color: "var(--ink-muted)" }}>
                Mesurez votre poignet avec un ruban ou une ficelle pour trouver votre taille.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              {selectedSize ? (
                <Link
                  href={`/composer?product=${product.slug}&size=${encodeURIComponent(selectedSize)}`}
                  className="block w-full py-4 rounded-2xl font-bold text-white text-center text-[15px] tracking-wide transition-all"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 24px rgba(184,134,26,0.28)" }}
                >
                  Créer ma carte vocale
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-2xl font-bold text-[15px] tracking-wide cursor-not-allowed"
                  style={{ background: "rgba(28,20,16,0.06)", color: "rgba(28,20,16,0.35)" }}
                >
                  Choisissez une taille pour continuer
                </button>
              )}
              <p className="text-center text-[11px]" style={{ color: "var(--ink-muted)" }}>
                Paiement sécurisé · Stripe · Livraison 3-5 jours ouvrés
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: "rgba(184,134,26,0.15)" }} />

            {/* Includes */}
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--ink)" }}>
                Ce coffret comprend
              </p>
              <ul className="flex flex-col gap-2">
                {product.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-3 text-[13px]" style={{ color: "var(--ink-muted)" }}>
                    <svg viewBox="0 0 16 16" fill="none" width={14} height={14} style={{ flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="7" stroke="var(--gold)" strokeWidth="1.2" />
                      <path d="M5 8l2 2 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Occasions section */}
        <div className="mt-24">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--gold)" }}>Pour chaque moment</p>
            <h2 className="text-[32px] font-black" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
              À chaque personne son message.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {OCCASIONS.map((label) => (
              <div
                key={label}
                className="rounded-2xl p-5 text-center"
                style={{ background: "white", border: "1px solid rgba(184,134,26,0.10)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ink)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 rounded-3xl p-10 text-center" style={{ background: "white", border: "1px solid rgba(184,134,26,0.10)" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--gold)" }}>Comment ça marche</p>
          <h2 className="text-[28px] font-black mb-10" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            Simple. Unique. Précieux.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", label: "Choisissez votre taille", desc: "Sélectionnez votre tour de poignet pour un ajustement parfait." },
              { step: "02", label: "Créez votre carte vocale", desc: "Enregistrez votre message, personnalisez la carte et prévisualisez le résultat." },
              { step: "03", label: "Recevez votre coffret", desc: "Le bracelet et la carte imprimée avec son QR code arrivent chez vous sous 3 à 5 jours." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black"
                  style={{ background: "rgba(184,134,26,0.08)", color: "var(--gold)", border: "1.5px solid rgba(184,134,26,0.15)" }}>
                  {s.step}
                </div>
                <p className="text-[14px] font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{s.label}</p>
                <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer minimal */}
      <footer className="text-center py-10">
        <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
          N&rsquo;OUBLIE JAMAIS · Les mots du cœur méritent d&rsquo;être conservés.
        </p>
      </footer>
    </div>
  );
}
