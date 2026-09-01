import type { Metadata } from "next";
import ComposerClient from "./ComposerClient";

export const metadata: Metadata = {
  title: "Composer votre carte",
  description: "Créez votre carte vocale personnalisée en quelques minutes.",
};

export default function ComposerPage() {
  return <ComposerClient />;
}
