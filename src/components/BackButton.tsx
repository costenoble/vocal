"use client";

import { useRouter } from "next/navigation";

// Flèche de retour vers la page précédente (historique du navigateur), avec
// un repli optionnel si l'utilisateur est arrivé directement sur la page.
export default function BackButton({ fallback = "/", label = "Retour" }: { fallback?: string; label?: string }) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
      style={{ color: "var(--ink-muted)" }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
        <path d="M10 12L6 8l4-4" />
      </svg>
      {label}
    </button>
  );
}
