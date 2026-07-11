"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SEEN_KEY = "nj_orders_seen_ts";
const POLL_MS = 15_000;

// Cloche de notification des nouvelles commandes payées :
// - badge avec le nombre de commandes reçues depuis la dernière consultation
// - alerte temps réel (notification navigateur + son) quand le dashboard est
//   ouvert et qu'une commande arrive
// - rafraîchit automatiquement la liste des commandes (router.refresh) sans
//   rechargement complet de la page.
export default function OrderBell({ initialTimestamps }: { initialTimestamps: number[] }) {
  const router = useRouter();
  const [timestamps, setTimestamps] = useState<number[]>(initialTimestamps);
  const [seenTs, setSeenTs] = useState<number | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const maxKnownRef = useRef<number>(initialTimestamps[0] ?? 0);

  useEffect(() => {
    if (typeof Notification === "undefined") setPermission("unsupported");
    else setPermission(Notification.permission);

    const stored = localStorage.getItem(SEEN_KEY);
    if (stored) {
      setSeenTs(Number(stored));
    } else {
      const now = initialTimestamps[0] ?? Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setSeenTs(now);
    }
  }, [initialTimestamps]);

  const beep = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } catch { /* audio bloqué avant interaction — sans gravité */ }
  }, []);

  // Polling : détecte les nouvelles commandes et met la page à jour toute seule.
  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/admin/orders/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const ts: number[] = data.timestamps ?? [];
        setTimestamps(ts);
        const newMax = ts[0] ?? 0;
        if (newMax > maxKnownRef.current) {
          maxKnownRef.current = newMax;
          beep();
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const who = data.latest ? `${data.latest.fromName} → ${data.latest.toName}` : "";
            new Notification("Nouvelle commande N'OUBLIE JAMAIS", { body: who, icon: "/icon.png" });
          }
          // Recharge les données serveur (la nouvelle commande apparaît dans
          // la liste) sans recharger toute la page.
          router.refresh();
        }
      } catch { /* réseau — on réessaiera au prochain tick */ }
    };
    const id = setInterval(() => { if (!stop) poll(); }, POLL_MS);
    return () => { stop = true; clearInterval(id); };
  }, [beep, router]);

  const newCount = seenTs === null ? 0 : timestamps.filter((t) => t > seenTs).length;
  const needsPermission = permission === "default" || permission === "denied";

  const acknowledge = () => {
    // Demande l'autorisation de notifier (geste utilisateur requis), marque
    // comme vu, et fait défiler vers la liste des commandes à préparer.
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().then((p) => setPermission(p)).catch(() => {});
    }
    const now = Date.now();
    localStorage.setItem(SEEN_KEY, String(now));
    setSeenTs(now);
    document.getElementById("commandes-a-expedier")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={acknowledge}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95"
      style={{ background: "white", border: "1.5px solid rgba(28,20,16,0.10)" }}
      aria-label={newCount > 0 ? `${newCount} nouvelle(s) commande(s)` : "Notifications"}
      title={
        needsPermission
          ? "Cliquez pour activer les notifications de nouvelles commandes"
          : newCount > 0
            ? `${newCount} nouvelle(s) commande(s)`
            : "Notifications activées"
      }
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width={19} height={19}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {newCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-black text-white"
          style={{ background: "#C0392B", boxShadow: "0 2px 6px rgba(192,57,43,0.4)" }}
        >
          {newCount}
        </span>
      )}
      {/* Pastille ambrée : notifications pas encore activées */}
      {newCount === 0 && needsPermission && permission !== "unsupported" && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "var(--gold)", border: "1.5px solid white" }} />
      )}
    </button>
  );
}
