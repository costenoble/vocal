import { nanoid } from "nanoid";

// Stockage fichiers : Supabase Storage, via l'API REST — aucune dépendance
// client, fonctionne sur n'importe quelle version de Node. Nécessite
// SUPABASE_URL + SUPABASE_API_KEY (clé secrète sb_secret_…, celle que
// l'intégration Hostinger injecte ; serveur uniquement).
const AUDIO_BUCKET = "audio";
const PRODUCTS_BUCKET = "products";

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_API_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_API_KEY manquants");
  }
  return { url: url.replace(/\/$/, ""), key };
}

function publicPrefix(bucket: string): string | null {
  const url = process.env.SUPABASE_URL;
  return url ? `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/` : null;
}

async function uploadToBucket(bucket: string, file: Blob, path: string, contentType: string): Promise<string> {
  const { url, key } = config();

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: file,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload Supabase échoué (${res.status}): ${body.slice(0, 200)}`);
  }

  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

async function deleteFromBucket(bucket: string, fileUrl: string): Promise<void> {
  try {
    const prefix = publicPrefix(bucket);
    if (!prefix || !fileUrl.startsWith(prefix)) return;
    const { url, key } = config();
    const path = fileUrl.slice(prefix.length);
    await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}`, apikey: key },
    });
  } catch {
    // Silently ignore deletion errors
  }
}

// ── Audio (messages vocaux) ───────────────────────────────────────────────────

// Sert aussi à valider qu'une URL audio nous appartient (voir /api/listen/reply).
export function audioPublicPrefix(): string | null {
  return publicPrefix(AUDIO_BUCKET);
}

export async function uploadAudio(file: Blob, originalName: string): Promise<string> {
  const ext = originalName.split(".").pop() || "webm";
  return uploadToBucket(AUDIO_BUCKET, file, `${nanoid(14)}.${ext}`, file.type || "audio/webm");
}

export async function deleteAudio(fileUrl: string): Promise<void> {
  return deleteFromBucket(AUDIO_BUCKET, fileUrl);
}

// ── Images produit (catalogue admin) ──────────────────────────────────────────

export async function uploadProductImage(file: Blob, originalName: string): Promise<string> {
  const ext = (originalName.split(".").pop() || "jpg").toLowerCase();
  return uploadToBucket(PRODUCTS_BUCKET, file, `${nanoid(14)}.${ext}`, file.type || "image/jpeg");
}

export async function deleteProductImage(fileUrl: string): Promise<void> {
  return deleteFromBucket(PRODUCTS_BUCKET, fileUrl);
}
