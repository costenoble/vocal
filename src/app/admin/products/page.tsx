import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { isAdminSession } from "@/lib/admin-auth";
import { getAllProductsAdmin } from "@/lib/products";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await isAdminSession())) {
    redirect("/admin");
  }

  const products = await getAllProductsAdmin();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Logo size={48} />
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-widest uppercase" style={{ color: "var(--ink)" }}>
              Catalogue produits
            </h1>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>N&rsquo;OUBLIE JAMAIS</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95"
            style={{ background: "white", color: "var(--ink-muted)", border: "1.5px solid rgba(28,20,16,0.10)" }}
          >
            Retour au dashboard
          </Link>
        </div>

        <ProductsManager initialProducts={products} />
      </div>
    </div>
  );
}
