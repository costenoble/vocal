"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Logo from "@/components/Logo";
import ProductDetail from "@/components/ProductDetail";
import type { Product } from "@/lib/products";

type Status = "loading" | "found" | "not-found";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => { setProduct(json.product); setStatus("found"); })
      .catch(() => setStatus("not-found"));
  }, [params.slug]);

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="flex items-center gap-2 mb-10 text-[11px]" style={{ color: "var(--ink-muted)" }}>
          <Link href="/" style={{ color: "var(--ink-muted)" }}>Accueil</Link>
          <span>/</span>
          <Link href="/boutique" style={{ color: "var(--ink-muted)" }}>Boutique</Link>
          {product && <><span>/</span><span style={{ color: "var(--ink)" }}>{product.name}</span></>}
        </div>

        {status === "loading" && (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Chargement…</p>
          </div>
        )}

        {status === "not-found" && (
          <div className="py-24 text-center">
            <Logo size={64} />
            <p className="text-sm mt-4" style={{ color: "var(--ink-muted)" }}>Ce produit n&rsquo;est plus disponible.</p>
            <Link href="/boutique" className="text-[13px] font-semibold mt-3 inline-block" style={{ color: "var(--gold)" }}>
              ← Retour à la boutique
            </Link>
          </div>
        )}

        {status === "found" && product && <ProductDetail product={product} />}
      </div>

      <footer className="text-center py-10">
        <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
          N&rsquo;OUBLIE JAMAIS · Les mots du cœur méritent d&rsquo;être conservés.
        </p>
      </footer>
    </div>
  );
}
