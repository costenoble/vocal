import type { Metadata } from "next";
import ComposerClient from "./ComposerClient";

export const metadata: Metadata = {
  title: "Composer votre carte — N'OUBLIE JAMAIS",
  description: "Créez votre carte vocale personnalisée en quelques minutes.",
};

export default function ComposerPage() {
  return <ComposerClient />;
}
