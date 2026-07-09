import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin-auth";
import { deleteProductImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Mise à jour d'un produit existant (édition, activation/désactivation).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim().slice(0, 100);
  if (typeof body.category === "string") data.category = body.category.trim().slice(0, 40);
  if (typeof body.tagline === "string") data.tagline = body.tagline.trim().slice(0, 160);
  if (typeof body.description === "string") data.description = body.description.trim().slice(0, 2000);
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
    }
    data.price = price;
  }
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl.trim();
  if (typeof body.reference === "string") data.reference = body.reference.trim().slice(0, 60);
  if (Array.isArray(body.images)) data.images = body.images.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 8);
  if (Array.isArray(body.sizes)) data.sizes = body.sizes.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 20);
  if (Array.isArray(body.details)) data.details = body.details.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 20);
  if (body.stock !== undefined) {
    data.stock = body.stock === null || body.stock === "" ? null : Math.max(0, Math.floor(Number(body.stock)));
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) data.sortOrder = Number(body.sortOrder);

  try {
    const product = await prisma.product.update({ where: { slug }, data });
    return NextResponse.json({ ok: true, product });
  } catch {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }
}

// Suppression définitive — refusée si des commandes existantes y font
// référence (on désactive plutôt que de casser l'historique).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;

  const usedByOrders = await prisma.message.count({ where: { productSlug: slug } });
  if (usedByOrders > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${usedByOrders} commande(s) référencent ce produit. Désactivez-le plutôt.` },
      { status: 409 }
    );
  }

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  if (product.imageUrl) await deleteProductImage(product.imageUrl);
  await prisma.product.delete({ where: { slug } });

  return NextResponse.json({ ok: true });
}
