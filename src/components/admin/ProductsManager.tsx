"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { categoryLabel } from "@/lib/categories";
import ProductFormModal from "@/components/admin/ProductFormModal";

export default function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const onSaved = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.slug === product.slug);
      return exists ? prev.map((p) => (p.slug === product.slug ? product : p)) : [...prev, product];
    });
    setModalOpen(false);
  };

  const toggleActive = async (p: Product) => {
    setBusySlug(p.slug);
    try {
      const res = await fetch(`/api/admin/products/${p.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (res.ok) {
        const { product } = await res.json();
        setProducts((prev) => prev.map((x) => (x.slug === p.slug ? product : x)));
      }
    } finally {
      setBusySlug(null);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ?`)) return;
    setBusySlug(p.slug);
    try {
      const res = await fetch(`/api/admin/products/${p.slug}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Suppression impossible.");
        return;
      }
      setProducts((prev) => prev.filter((x) => x.slug !== p.slug));
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
          {products.length} produit{products.length > 1 ? "s" : ""} — visibles automatiquement sur la boutique dès qu&rsquo;activés.
        </p>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 16px rgba(184,134,26,0.28)" }}
        >
          + Ajouter un produit
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl py-14 text-center" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Aucun produit pour l&rsquo;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div
              key={p.slug}
              className="rounded-2xl overflow-hidden flex items-center gap-4 p-3"
              style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)", opacity: busySlug === p.slug ? 0.6 : 1 }}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--cream)" }}>
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--gold)" strokeWidth="1.4" opacity={0.4}>
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-bold truncate" style={{ color: "var(--ink)" }}>{p.name}</p>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ background: "rgba(184,134,26,0.10)", color: "var(--gold-dark)" }}>
                    {categoryLabel(p.category)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: p.active ? "rgba(22,163,74,0.12)" : "rgba(28,20,16,0.08)", color: p.active ? "#16a34a" : "var(--ink-muted)" }}
                  >
                    {p.active ? "Actif" : "Masqué"}
                  </span>
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-muted)" }}>
                  {p.reference ? `${p.reference} · ` : ""}{p.price.toFixed(2).replace(".", ",")} €
                  {" · "}
                  {p.stock === null
                    ? "stock illimité"
                    : p.stock > 0
                      ? <span style={{ color: p.stock <= 3 ? "#C0392B" : "var(--ink-muted)" }}>{p.stock} en stock</span>
                      : <span style={{ color: "#C0392B", fontWeight: 700 }}>Rupture de stock</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(p)}
                  disabled={busySlug === p.slug}
                  className="px-3 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-95"
                  style={{ background: "var(--cream)", color: "var(--ink-muted)" }}
                >
                  {p.active ? "Masquer" : "Activer"}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="px-3 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-95"
                  style={{ background: "var(--cream)", color: "var(--gold-dark)" }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => remove(p)}
                  disabled={busySlug === p.slug}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)" }}
                  aria-label={`Supprimer ${p.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.7" strokeLinecap="round" width={13} height={13}>
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
