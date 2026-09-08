import fs from "node:fs";
import path from "node:path";

let logoDataUrl: string | null = null;

export function getLogoDataUrl() {
  if (!logoDataUrl) {
    const buffer = fs.readFileSync(path.join(process.cwd(), "public/logo.png"));
    logoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return logoDataUrl;
}
