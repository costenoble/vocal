"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Logo from "@/components/Logo";
import ProductDetail from "@/components/ProductDetail";
import type { Product } from "@/lib/products";
import { isPurchasable, formatPrice } from "@/lib/product-utils";
import { categoryLabel, sortCategories } from "@/lib/categories";

const OCCASIONS = [
  "Naissance", "Mariage", "Anniversaire", "Famille",
  "Amitié", "Je t'aime", "Grand-parent", "Remerciement",
];

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/boutique/${product.slug}`}
      className="rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
      style={{ background: "white", border: "1px solid rgba(184,134,26,0.14)", boxShadow: "0 3px 16px rgba(184,134,26,0.06)" }}
    >
      <div className="relative aspect-square" style={{ background: "#F5EED5" }}>
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Logo size={48} />
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ background: "var(--gold)", color: "white" }}>
          {categoryLabel(product.category)}
        </div>
        {!isPurchasable(product) && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(28,20,16,0.42)" }}>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white" style={{ background: "rgba(28,20,16,0.85)" }}>
              Rupture de stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <p className="text-[14px] font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>{product.name}</p>
        {product.tagline && <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>{product.tagline}</p>}
        <p className="text-[16px] font-black mt-1" style={{ color: "var(--gold)" }}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default function BoutiquePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((json) => setProducts(json.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  // Catégories réellement présentes dans le catalogue → onglets de filtre.
  const categories = products
    ? sortCategories([...new Set(products.map((p) => (p.category || "").toLowerCase()).filter(Boolean))])
    : [];
  const showTabs = categories.length > 1;
  const visibleProducts = products
    ? products.filter((p) => activeCat === "all" || (p.category || "").toLowerCase() === activeCat)
    : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="flex items-center gap-2 mb-10 text-[11px]" style={{ color: "var(--ink-muted)" }}>
          <Link href="/" style={{ color: "var(--ink-muted)" }}>Accueil</Link>
          <span>/</span>
          <span style={{ color: "var(--ink)" }}>Boutique</span>
        </div>

        {products === null ? (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Chargement…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <Logo size={64} />
            <p className="text-sm mt-4" style={{ color: "var(--ink-muted)" }}>Notre boutique ouvre très bientôt.</p>
          </div>
        ) : products.length === 1 ? (
          <ProductDetail product={products[0]} />
        ) : (
          <>
            <div className="mb-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--gold)" }}>Nos collections</p>
              <h1 className="text-[32px] font-black" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Chaque pierre, une histoire.
              </h1>
            </div>

            {/* Onglets de filtre par collection */}
            {showTabs && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {[{ value: "all", label: "Tous" }, ...categories.map((c) => ({ value: c, label: categoryLabel(c) }))].map((tab) => {
                  const active = activeCat === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveCat(tab.value)}
                      className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                      style={{
                        background: active ? "var(--ink)" : "white",
                        color: active ? "white" : "var(--ink-muted)",
                        border: active ? "1.5px solid transparent" : "1.5px solid rgba(28,20,16,0.12)",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            <motion.div
              key={activeCat}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {visibleProducts.map((p) => <ProductCard key={p.slug} product={p} />)}
            </motion.div>
          </>
        )}

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
              { step: "01", label: "Choisissez votre modèle", desc: "Sélectionnez la pièce et la taille qui vous correspondent." },
              { step: "02", label: "Créez votre carte vocale", desc: "Enregistrez votre message, personnalisez la carte et prévisualisez le résultat." },
              { step: "03", label: "Recevez votre coffret", desc: "Le bijou et la carte imprimée avec son QR code arrivent chez vous sous 3 à 5 jours." },
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

      <footer className="text-center py-10">
        <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
          N&rsquo;OUBLIE JAMAIS · Les mots du cœur méritent d&rsquo;être conservés.
        </p>
      </footer>
    </div>
  );
}
