import { put, del } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadAudio(
  file: Blob,
  originalName: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "webm";
  const filename = `audio/${nanoid(14)}.${ext}`;

  const { url } = await put(filename, file, {
    access: "public",
    contentType: file.type || "audio/webm",
  });

  return url;
}

export async function deleteAudio(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // Silently ignore deletion errors
  }
}
