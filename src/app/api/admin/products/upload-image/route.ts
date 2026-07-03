import { NextRequest, NextResponse } from "next/server";
import { uploadProductImage } from "@/lib/storage";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucune image" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse (max 8 Mo)" }, { status: 413 });
    }

    const baseType = (file.type || "").split(";")[0].trim().toLowerCase();
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
    if (!ALLOWED_TYPES.has(baseType) || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "Format non supporté (JPG, PNG, WebP uniquement)" }, { status: 415 });
    }

    const imageUrl = await uploadProductImage(file, `image.${ext}`);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("[admin/products/upload-image]", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
