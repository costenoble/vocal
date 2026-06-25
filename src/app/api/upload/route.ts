import { NextRequest, NextResponse } from "next/server";
import { uploadAudio } from "@/lib/storage";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier audio" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 50MB)" }, { status: 413 });
    }

    const audioUrl = await uploadAudio(file, file.name || "recording.webm");

    return NextResponse.json({ audioUrl, audioPath: audioUrl, size: file.size });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
