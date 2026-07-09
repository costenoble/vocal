"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { CATEGORY_OPTIONS } from "@/lib/categories";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  open: boolean;
  product: Product | null; // null = création
  onClose: () => void;
  onSaved: (product: Product) => void;
}

function slugPreview(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductFormModal({ open, product, onClose, onSaved }: Props) {
  const isEdit = !!product;

  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizesText, setSizesText] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Recharge le formulaire à chaque ouverture / changement de produit édité.
  useEffect(() => {
    if (!open) return;
    setName(product?.name ?? "");
    setReference(product?.reference ?? "");
    setCategory(product?.category ?? CATEGORY_OPTIONS[0].value);
    setTagline(product?.tagline ?? "");
    setDescription(product?.description ?? "");
    setPrice(product ? String(product.price) : "");
    setStock(product && product.stock !== null && product.stock !== undefined ? String(product.stock) : "");
    setSizesText(product?.sizes.join(", ") ?? "");
    setDetailsText(product?.details.join("\n") ?? "");
    setActive(product?.active ?? true);
    setImageUrl(product?.imageUrl ?? "");
    setImages(product?.images ?? []);
    setError("");
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  const doUpload = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/admin/products/upload-image", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Échec de l'upload");
    return json.imageUrl as string;
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      setImageUrl(await doUpload(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  // Photos additionnelles (galerie de la fiche produit).
  const uploadGalleryImages = async (files: FileList) => {
    setUploadingGallery(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 8)) urls.push(await doUpload(f));
      setImages((prev) => [...prev, ...urls].slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const priceNum = Number(price.replace(",", "."));
    if (!name.trim() || !isFinite(priceNum) || priceNum <= 0) {
      setError("Le nom et un prix valide (> 0) sont requis.");
      return;
    }

    const payload = {
      name: name.trim(),
      reference: reference.trim(),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      price: priceNum,
      imageUrl,
      images,
      stock: stock.trim() === "" ? null : Math.max(0, Math.floor(Number(stock))),
      sizes: sizesText.split(",").map((s) => s.trim()).filter(Boolean),
      details: detailsText.split("\n").map((s) => s.trim()).filter(Boolean),
      active,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/products/${product!.slug}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur lors de l'enregistrement");
      onSaved(json.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { background: "var(--cream)", border: "1px solid rgba(184,134,26,0.22)", color: "var(--ink)" } as const;
  const labelCls = "text-[11px] font-bold tracking-[0.1em] uppercase";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(28,20,16,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          <motion.div
            role="dialog" aria-modal="true"
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{ background: "white", boxShadow: "0 24px 80px rgba(28,20,16,0.35)" }}
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div style={{ height: 4, background: "linear-gradient(to right, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.2)" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6" strokeLinecap="round" width={13} height={13}>
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            <div className="px-6 sm:px-8 py-8">
              <h2 className="text-[19px] font-black leading-tight mb-1" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                {isEdit ? "Modifier le produit" : "Nouveau produit"}
              </h2>
              {name && (
                <p className="text-[12px] mb-6" style={{ color: "var(--ink-muted)" }}>
                  {isEdit ? product!.slug : `URL : /boutique/${slugPreview(name) || "…"}`}
                </p>
              )}
              {!name && <div className="mb-6" />}

              <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Image */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Photo</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.2)" }}>
                      {imageUrl ? (
                        <Image src={imageUrl} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="var(--gold)" strokeWidth="1.4" opacity={0.4}>
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-95 disabled:opacity-50"
                        style={{ background: "var(--cream)", color: "var(--gold-dark)", border: "1px solid rgba(184,134,26,0.3)" }}
                      >
                        {uploading ? "Envoi…" : imageUrl ? "Changer la photo" : "Choisir une photo"}
                      </button>
                      <p className="text-[10px]" style={{ color: "var(--ink-muted)" }}>JPG, PNG ou WebP · 8 Mo max</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                    />
                  </div>
                </div>

                {/* Galerie — photos supplémentaires (vue portée, gros plan…) */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Photos supplémentaires (galerie)</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {images.map((url) => (
                      <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(184,134,26,0.2)" }}>
                        <Image src={url} alt="" fill className="object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(url)} aria-label="Retirer" className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(28,20,16,0.7)" }}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" width={9} height={9}><path d="M3 3l10 10M13 3L3 13" /></svg>
                        </button>
                      </div>
                    ))}
                    {images.length < 8 && (
                      <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery} className="w-16 h-16 rounded-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50" style={{ background: "var(--cream)", border: "1.5px dashed rgba(184,134,26,0.4)" }}>
                        {uploadingGallery ? (
                          <span className="text-[9px]" style={{ color: "var(--gold-dark)" }}>Envoi…</span>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6" strokeLinecap="round" width={18} height={18}><path d="M12 5v14M5 12h14" /></svg>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--ink-muted)" }}>Jusqu&rsquo;à 8 photos · vue portée, gros plan, détails…</p>
                  <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) uploadGalleryImages(e.target.files); e.target.value = ""; }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Nom *</label>
                    <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bracelet Améthyste" className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Prix (€) *</label>
                    <input required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="35" className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Référence</label>
                    <input maxLength={60} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex : BR-AME-001" className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Stock disponible</label>
                    <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Illimité si vide" className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Catégorie</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3.5 py-3 rounded-xl text-[14px] outline-none appearance-none" style={inputStyle}>
                    {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    {/* Conserve une valeur héritée non listée (ex. ancien "bracelet") */}
                    {!CATEGORY_OPTIONS.some((c) => c.value === category) && category && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Accroche courte</label>
                  <input maxLength={160} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Coffret cadeau · Carte vocale incluse" className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Description</label>
                  <textarea rows={3} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Un bracelet en pierre d'améthyste naturelle…" className="px-3.5 py-3 rounded-xl text-[14px] outline-none resize-none leading-relaxed" style={inputStyle} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Tailles disponibles</label>
                  <input value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="15 cm, 16 cm, 17 cm, 18 cm" className="px-3.5 py-3 rounded-xl text-[14px] outline-none" style={inputStyle} />
                  <p className="text-[10px]" style={{ color: "var(--ink-muted)" }}>Séparées par des virgules. Laisser vide si non applicable.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls} style={{ color: "var(--ink-muted)" }}>Le coffret comprend</label>
                  <textarea rows={4} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} placeholder={"Bracelet en pierre naturelle\nMédaillon exclusif\nCarte vocale personnalisée"} className="px-3.5 py-3 rounded-xl text-[13px] outline-none resize-none leading-relaxed" style={inputStyle} />
                  <p className="text-[10px]" style={{ color: "var(--ink-muted)" }}>Une ligne par élément.</p>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
                  <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>Visible sur la boutique</span>
                </label>

                {error && <p className="text-[12px] font-semibold" style={{ color: "#C0392B" }}>{error}</p>}

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full py-4 rounded-2xl font-bold text-[14px] text-white transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 18px rgba(184,134,26,0.28)" }}
                >
                  {saving ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le produit"}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
