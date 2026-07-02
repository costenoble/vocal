import { nanoid } from "nanoid";

// Stockage audio : Supabase Storage (bucket public "audio"), via l'API REST —
// aucune dépendance client, fonctionne sur n'importe quelle version de Node.
// Nécessite SUPABASE_URL + SUPABASE_API_KEY (clé secrète sb_secret_…, celle
// que l'intégration Hostinger injecte ; serveur uniquement, jamais exposée
// au client — l'upload passe par /api/upload).
const BUCKET = "audio";

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_API_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_API_KEY manquants");
  }
  return { url: url.replace(/\/$/, ""), key };
}

// Préfixe public des fichiers du bucket — sert aussi à valider qu'une URL
// audio nous appartient (voir /api/listen/reply).
export function audioPublicPrefix(): string | null {
  const url = process.env.SUPABASE_URL;
  return url ? `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/` : null;
}

export async function uploadAudio(
  file: Blob,
  originalName: string
): Promise<string> {
  const { url, key } = config();
  const ext = originalName.split(".").pop() || "webm";
  const path = `${nanoid(14)}.${ext}`;

  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": file.type || "audio/webm",
      "x-upsert": "false",
    },
    body: file,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload Supabase échoué (${res.status}): ${body.slice(0, 200)}`);
  }

  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function deleteAudio(fileUrl: string): Promise<void> {
  try {
    const prefix = audioPublicPrefix();
    if (!prefix || !fileUrl.startsWith(prefix)) return;
    const { url, key } = config();
    const path = fileUrl.slice(prefix.length);
    await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}`, apikey: key },
    });
  } catch {
    // Silently ignore deletion errors
  }
}
