import { NextRequest, NextResponse } from "next/server";
import { uploadAudio } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB ≈ largement assez pour 5 min d'audio
const ALLOWED_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
]);
const ALLOWED_EXTENSIONS = new Set(["webm", "mp4", "m4a", "mp3", "ogg", "wav", "aac"]);

export async function POST(req: NextRequest) {
  try {
    const { ok, retryAfterSeconds } = rateLimit(`upload:${clientIp(req)}`, 10, 60 * 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Trop d'envois. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier audio" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 15MB)" }, { status: 413 });
    }

    const baseType = (file.type || "").split(";")[0].trim().toLowerCase();
    const ext = (file.name?.split(".").pop() || "webm").toLowerCase();
    if (!ALLOWED_TYPES.has(baseType) || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "Format non supporté (audio uniquement)" }, { status: 415 });
    }

    const audioUrl = await uploadAudio(file, `recording.${ext}`);

    return NextResponse.json({ audioUrl, audioPath: audioUrl, size: file.size });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
