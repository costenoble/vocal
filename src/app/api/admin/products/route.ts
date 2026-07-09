import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin-auth";
import { getAllProductsAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Liste complète (actifs + inactifs) pour l'admin.
export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const products = await getAllProductsAdmin();
  return NextResponse.json({ products });
}

// Création d'un nouveau produit.
export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim().slice(0, 100);
  const price = Number(body.price);

  if (!name || !isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Nom et prix (> 0) requis" }, { status: 400 });
  }

  const baseSlug = slugify(body.slug || name) || "produit";
  let slug = baseSlug;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const sizes = Array.isArray(body.sizes)
    ? body.sizes.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 20)
    : [];
  const details = Array.isArray(body.details)
    ? body.details.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 20)
    : [];

  const images = Array.isArray(body.images)
    ? body.images.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 8)
    : [];
  const stockRaw = body.stock;
  const stock =
    stockRaw === null || stockRaw === "" || stockRaw === undefined
      ? null
      : Math.max(0, Math.floor(Number(stockRaw)));

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      reference: String(body.reference ?? "").trim().slice(0, 60),
      category: String(body.category ?? "bracelet").trim().slice(0, 40) || "bracelet",
      tagline: String(body.tagline ?? "").trim().slice(0, 160),
      description: String(body.description ?? "").trim().slice(0, 2000),
      price,
      imageUrl: String(body.imageUrl ?? "").trim(),
      images,
      sizes,
      details,
      stock: Number.isFinite(stock as number) ? stock : null,
      active: body.active !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    },
  });

  return NextResponse.json({ ok: true, product });
}
