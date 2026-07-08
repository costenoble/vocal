"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import type { Product } from "@/lib/products";
import { categoryLabel } from "@/lib/categories";

const REASSURANCE = [
  { icon: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>, t: "Paiement sécurisé", d: "Stripe · CB, Apple Pay" },
  { icon: <><rect x="1" y="6" width="14" height="12" rx="1.5" /><path d="M15 10h4l3 3v5h-7zM5.5 21a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM18 21a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" /></>, t: "Livraison 3-5 jours", d: "Suivie, en France" },
  { icon: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" /></>, t: "Retour 14 jours", d: "Satisfait ou remboursé" },
];

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const hasSizes = product.sizes.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden aspect-square"
        style={{ background: "#F5EED5" }}
      >
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Logo size={80} />
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--gold)" }}>N&rsquo;OUBLIE JAMAIS</p>
          </div>
        )}

        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: "var(--gold)", color: "white" }}>
          {categoryLabel(product.category)}
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
          {product.tagline && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--gold)" }}>
              {product.tagline}
            </p>
          )}
          <h1 className="text-[36px] font-black leading-tight mb-3" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            {product.name}
          </h1>
          {product.description && (
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-[42px] font-black" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
            {product.price} €
          </span>
          <span className="text-[13px]" style={{ color: "var(--ink-muted)" }}>TTC · Livraison incluse</span>
        </div>

        <div className="h-px w-full" style={{ background: "rgba(184,134,26,0.15)" }} />

        {hasSizes && (
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
              {product.sizes.map((size) => (
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
        )}

        <div className="flex flex-col gap-3">
          {!hasSizes || selectedSize ? (
            <Link
              href={`/composer?product=${product.slug}${selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ""}`}
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

          <div className="grid grid-cols-3 gap-2 mt-1">
            {REASSURANCE.map((r) => (
              <div key={r.t} className="rounded-xl px-2.5 py-3 flex flex-col items-center text-center gap-1.5" style={{ background: "white", border: "1px solid rgba(184,134,26,0.10)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>{r.icon}</svg>
                <p className="text-[11px] font-bold leading-tight" style={{ color: "var(--ink)" }}>{r.t}</p>
                <p className="text-[10px] leading-tight" style={{ color: "var(--ink-muted)" }}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>

        {product.details.length > 0 && (
          <>
            <div className="h-px w-full" style={{ background: "rgba(184,134,26,0.15)" }} />
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
          </>
        )}
      </motion.div>
    </div>
  );
}
