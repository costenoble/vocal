"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Link from "next/link";
import { THEMES, getTheme, type ThemeId } from "@/lib/themes";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
type RecordState = "idle" | "requesting" | "recording" | "uploading" | "done";

interface Shipping {
  fullName: string;
  address: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
}

interface CardData {
  fromName: string;
  toName: string;
  date: string;
  occasion: string;
  theme: ThemeId;
  paper: string;
  cardFont: string;
  message: string;
  shipping: Shipping;
}

const PAPERS = [
  { id: "ivoire", name: "Ivoire mat",    desc: "Douceur intemporelle", bg: "#F5EED5", text: "#1C1410", accent: "#8B6510", shimmer: false },
  { id: "nacre",  name: "Blanc nacré",   desc: "Élégance lumineuse",   bg: "#F9F8F3", text: "#1C1410", accent: "#8B6510", shimmer: true  },
  { id: "lin",    name: "Lin naturel",   desc: "Chaleur organique",    bg: "#DFD0B4", text: "#2A1B0E", accent: "#6B4C1E", shimmer: false },
  { id: "noir",   name: "Noir velouté",  desc: "Luxe absolu",          bg: "#18120C", text: "#F0E8D8", accent: "#D4A832", shimmer: false },
] as const;

const CARD_FONTS = [
  { id: "playfair", name: "Classique",  family: "var(--font-playfair)",      italic: true  },
  { id: "inter",    name: "Moderne",    family: "var(--font-inter), sans-serif", italic: false },
  { id: "script",   name: "Signature", family: "'Brush Script MT', 'Segoe Script', cursive", italic: false },
] as const;

const OCCASIONS = ["Mariage", "Anniversaire", "Naissance", "Diplôme", "Retraite", "Pour toujours", "Deuil", "Autre"];

const PLANS = [
  { id: "carte", name: "La Carte", price: 14.9, tagline: "Un souvenir unique, pour toujours.", features: ["1 carte vocale personnalisée", "QR code unique", "Page d'écoute premium", "PDF imprimable", "Lien actif à vie"], highlight: false },
  { id: "coffret", name: "Le Coffret", price: 34.9, tagline: "Parfait pour une famille ou un événement.", features: ["5 cartes vocales", "5 QR codes uniques", "5 pages d'écoute", "5 PDF imprimables", "Support prioritaire"], highlight: true },
];

const fmtTime = (s: number) =>
  !isFinite(s) || isNaN(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ── Audio Player — HTML5 native, no Web Audio API ─────────────────────────────
function AudioPlayer({ src, accent = "var(--gold)" }: { src: string; accent?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = async () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { try { await ref.current.play(); setPlaying(true); } catch { /* denied */ } }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    ref.current.currentTime = ratio * (ref.current.duration || 0);
    setProgress(ratio);
  };

  const staticBars = Array.from({ length: 36 }, (_, i) =>
    14 + Math.abs(Math.sin(i * 0.85 + 1.4) * 22 + Math.cos(i * 0.45) * 8)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <audio
        ref={ref} src={src}
        onLoadedMetadata={() => setDuration(ref.current?.duration ?? 0)}
        onTimeUpdate={() => {
          const el = ref.current;
          if (!el || !el.duration) return;
          setElapsed(el.currentTime);
          setProgress(el.currentTime / el.duration);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); setElapsed(0); }}
      />

      {/* Static waveform bars */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2.5, height: 44 }}>
        {staticBars.map((h, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 99, height: h,
            background: i / 36 <= progress ? accent : `${accent}33`,
            minWidth: 2, maxWidth: 7,
            transition: "background 0.08s",
          }} />
        ))}
      </div>

      {/* Seek */}
      <div onClick={seek} style={{ height: 3, borderRadius: 99, background: `${accent}20`, cursor: "pointer", position: "relative" }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${progress * 100}%`, background: accent }} />
        {progress > 0 && (
          <div style={{ position: "absolute", top: "50%", left: `${progress * 100}%`, transform: "translate(-50%, -50%)", width: 11, height: 11, borderRadius: "50%", background: "white", border: `2px solid ${accent}` }} />
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={toggle}
          style={{ width: 36, height: 36, borderRadius: "50%", background: accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 3px 10px ${accent}44` }}
          aria-label={playing ? "Pause" : "Lire"}
        >
          {playing
            ? <svg viewBox="0 0 24 24" fill="white" width={11} height={11}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            : <svg viewBox="0 0 24 24" fill="white" width={12} height={12}><path d="M8 5.14v14l11-7-11-7z"/></svg>
          }
        </button>
        <span style={{ fontSize: 11, fontWeight: 600, color: accent, fontVariantNumeric: "tabular-nums" }}>{fmtTime(elapsed)}</span>
        <span style={{ fontSize: 11, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums", marginLeft: "auto", opacity: 0.5 }}>{duration > 0 ? fmtTime(duration) : "--:--"}</span>
      </div>
    </div>
  );
}

// ── Theme Selector ────────────────────────────────────────────────────────────
function ThemeSelector({ selected, onChange }: { selected: ThemeId; onChange: (id: ThemeId) => void }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-muted)" }}>
        Design de la page d&apos;écoute
      </p>
      <div className="grid grid-cols-4 gap-2">
        {THEMES.map((th) => {
          const active = selected === th.id;
          return (
            <button
              key={th.id}
              type="button"
              onClick={() => onChange(th.id as ThemeId)}
              className="rounded-xl overflow-hidden transition-all"
              style={{
                border: `2px solid ${active ? th.accent : "rgba(28,20,16,0.07)"}`,
                boxShadow: active ? `0 0 0 3px ${th.accent}22` : "none",
                transform: active ? "scale(1.04)" : "scale(1)",
                transition: "all 0.2s ease",
                background: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <div style={{ height: 48, background: th.pageBg, position: "relative" }}>
                <div style={{ position: "absolute", top: "20%", left: "14%", right: "14%", bottom: "14%", background: th.cardBg, borderRadius: 5, border: `1px solid ${th.cardBorder}` }}>
                  <div style={{ position: "absolute", top: "22%", left: "15%", right: "15%", display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ height: 2.5, borderRadius: 99, background: th.accent, opacity: 0.5 }} />
                    <div style={{ height: 2, borderRadius: 99, background: th.accent, opacity: 0.25, width: "65%" }} />
                  </div>
                </div>
                {active && (
                  <div style={{ position: "absolute", top: 5, right: 5, width: 13, height: 13, borderRadius: "50%", background: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 10 10" fill="none" width={7} height={7}><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
              <div style={{ padding: "4px 2px", background: "white", textAlign: "center" }}>
                <p style={{ fontSize: 8.5, fontWeight: 700, color: active ? th.accent : "var(--ink-muted)", lineHeight: 1 }}>{th.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Live card preview (updated in real time) ──────────────────────────────────
function CardPreview({ card, audioSrc }: { card: CardData; audioSrc?: string }) {
  const t = getTheme(card.theme);
  return (
    <div style={{ borderRadius: 22, overflow: "hidden", border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
      <div style={{ background: t.pageBg, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <Logo size={40} />
          <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: t.text, marginTop: 6 }}>N&apos;OUBLIE JAMAIS</p>
          <p style={{ fontSize: 7, letterSpacing: "0.18em", color: t.accent, marginTop: 2 }}>La carte vocale</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t.textMuted, marginBottom: 2 }}>De</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: t.accent, fontFamily: "var(--font-playfair)", lineHeight: 1.2 }}>
              {card.fromName || <span style={{ opacity: 0.3 }}>…</span>}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill={t.heartFill} width={14} height={14}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div style={{ width: 1, height: 10, background: `${t.accent}33` }} />
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t.textMuted, marginBottom: 2 }}>Pour</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: t.accent, fontFamily: "var(--font-playfair)", lineHeight: 1.2 }}>
              {card.toName || <span style={{ opacity: 0.3 }}>…</span>}
            </p>
          </div>
        </div>

        {card.date && (
          <div style={{ padding: "4px 12px", borderRadius: 99, background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: t.accent }}>{card.date}</span>
          </div>
        )}

        {card.occasion && (
          <span style={{ fontSize: 10, color: t.textMuted }}>{card.occasion}</span>
        )}

        <div style={{ height: 1, width: "100%", background: `linear-gradient(to right, transparent, ${t.accent}33, transparent)` }} />

        <div style={{ width: "100%", borderRadius: 12, border: `1px solid ${t.accentBorder}`, background: t.cardBg, padding: 12 }}>
          {audioSrc
            ? <AudioPlayer src={audioSrc} accent={t.accent} />
            : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.35 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" width={13} height={13} fill="none"><rect x="9" y="2" width="6" height="13" rx="3" fill={t.accent}/><path d="M5 11a7 7 0 0 0 14 0" stroke={t.accent} strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontSize: 10, color: t.textMuted }}>Votre message audio apparaîtra ici</p>
              </div>
            )
          }
        </div>

        <p style={{ fontSize: 8, letterSpacing: "0.1em", color: t.textMuted, opacity: 0.4 }}>APERÇU · PAGE D&apos;ÉCOUTE</p>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--ink-muted)" }}>{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const filled = value.length > 0;
  return (
    <input
      type="text" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none"
      style={{
        background: "white",
        border: `1.5px solid ${filled ? "var(--gold)" : "rgba(28,20,16,0.10)"}`,
        color: "var(--ink)",
        boxShadow: filled ? "0 0 0 3px rgba(184,134,26,0.08)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    />
  );
}

// ── Navigation inline ─────────────────────────────────────────────────────────
function Nav({ onPrev, onNext, prevLabel = "Retour", nextLabel = "Continuer", nextDisabled, showNext = true }: {
  onPrev?: () => void; onNext?: () => void; prevLabel?: string; nextLabel?: string; nextDisabled?: boolean; showNext?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: "1px solid rgba(28,20,16,0.06)" }}>
      {onPrev
        ? <button onClick={onPrev} className="text-[13px] transition-opacity hover:opacity-70" style={{ color: "rgba(28,20,16,0.38)" }}>← {prevLabel}</button>
        : <div />
      }
      {showNext && onNext && (
        <button
          onClick={onNext} disabled={nextDisabled}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ background: "var(--ink)", boxShadow: nextDisabled ? "none" : "0 2px 12px rgba(28,20,16,0.16)" }}
        >
          {nextLabel}
          <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
        </button>
      )}
    </div>
  );
}

// ── Fake QR Code ─────────────────────────────────────────────────────────────
function FakeQR({ size = 80, fg = "#1C1410" }: { size?: number; fg?: string }) {
  const c = size / 21;
  const rows = [
    "111111100101011111111",
    "100000101010110000001",
    "101110101110110111001",
    "101110100011010111001",
    "101110100101010111001",
    "100000101100110000001",
    "111111101010111111111",
    "000000001001000000000",
    "101011110110101001101",
    "011010001010100110010",
    "110111101001110111101",
    "010010001101001010001",
    "111001100100111001110",
    "000000001011000010100",
    "111111100110111111100",
    "100000101010100000101",
    "101110100111110110101",
    "101110101001001011101",
    "101110100110110110011",
    "100000101010001001001",
    "111111101101101111110",
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rows.map((row, ri) =>
        row.split("").map((cell, ci) =>
          cell === "1" ? <rect key={`${ri}-${ci}`} x={ci * c} y={ri * c} width={c} height={c} fill={fg} /> : null
        )
      )}
    </svg>
  );
}

// ── Shared card helpers ───────────────────────────────────────────────────────
function HeartLine({ accent }: { accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
      <div style={{ flex: 1, height: 0.5, background: accent, opacity: 0.45 }} />
      <svg viewBox="0 0 16 16" fill={accent} width={8} height={8} style={{ opacity: 0.7, flexShrink: 0 }}>
        <path d="M8 14l-1-0.9C3.5 10.2 1 8.1 1 5.5 1 3.4 2.7 2 4.5 2c1.2 0 2.4.6 3.5 1.7C9.1 2.6 10.3 2 11.5 2 13.3 2 15 3.4 15 5.5c0 2.6-2.5 4.7-6 8.6L8 14z"/>
      </svg>
      <div style={{ flex: 1, height: 0.5, background: accent, opacity: 0.45 }} />
    </div>
  );
}

// ── Card Recto ────────────────────────────────────────────────────────────────
function CardRecto({ card, paper, font }: { card: CardData; paper: typeof PAPERS[number]; font: typeof CARD_FONTS[number] }) {
  return (
    <div style={{
      background: paper.bg,
      aspectRatio: "105 / 148",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      boxShadow: paper.id === "noir"
        ? "0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)"
        : "0 16px 48px rgba(28,20,16,0.16), 0 4px 12px rgba(28,20,16,0.08)",
      overflow: "hidden",
    }}>
      {/* Border inset */}
      <div style={{ position: "absolute", inset: 7, border: `0.5px solid ${paper.accent}`, opacity: 0.4, pointerEvents: "none", zIndex: 1 }} />
      {/* Shimmer */}
      {paper.shimmer && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0)40%,rgba(255,255,255,0.22)55%,rgba(255,255,255,0)70%)", pointerEvents: "none", zIndex: 2 }} />}

      {/* Logo */}
      <div style={{ zIndex: 3, marginTop: 4 }}>
        <Logo size={52} />
      </div>

      {/* Brand name */}
      <div style={{ textAlign: "center", zIndex: 3 }}>
        <p style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", color: paper.text, fontFamily: "var(--font-inter), sans-serif", lineHeight: 1 }}>
          N&apos;OUBLIE JAMAIS
        </p>
        <div style={{ height: 0.5, background: paper.accent, opacity: 0.35, marginTop: 4 }} />
      </div>

      {/* Heart divider */}
      <div style={{ width: "72%", zIndex: 3 }}>
        <HeartLine accent={paper.accent} />
      </div>

      {/* Text block */}
      <div style={{ textAlign: "center", zIndex: 3 }}>
        <p style={{ fontSize: 8.5, color: paper.text, opacity: 0.65, fontFamily: "var(--font-playfair)", lineHeight: 1.5 }}>
          Certains messages<br />ne s&apos;oublient pas.
        </p>
        <p style={{
          fontSize: 10,
          fontFamily: font.id === "script" ? "'Brush Script MT','Segoe Script',cursive" : "var(--font-playfair)",
          fontStyle: "italic",
          color: paper.accent,
          marginTop: 3,
        }}>
          Ils se portent.
        </p>
      </div>

      {/* QR Code */}
      <div style={{ zIndex: 3, padding: 4, background: paper.id === "noir" ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)", borderRadius: 4 }}>
        <FakeQR size={62} fg="#1C1410" />
      </div>

      {/* Scan hint */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, zIndex: 3 }}>
        <svg viewBox="0 0 24 24" width={11} height={11} fill="none">
          <rect x="5" y="2" width="14" height="20" rx="3" stroke={paper.accent} strokeWidth="1.4"/>
          <rect x="9" y="18" width="6" height="1.5" rx="0.75" fill={paper.accent}/>
        </svg>
        <p style={{ fontSize: 7, color: paper.text, opacity: 0.5, fontFamily: "var(--font-inter), sans-serif", letterSpacing: "0.04em" }}>
          Scannez pour écouter votre message
        </p>
      </div>

      {/* Bottom heart */}
      <div style={{ width: "60%", zIndex: 3, paddingBottom: 4 }}>
        <HeartLine accent={paper.accent} />
      </div>
    </div>
  );
}

// ── Card Verso ────────────────────────────────────────────────────────────────
function CardVerso({ card, paper, font }: { card: CardData; paper: typeof PAPERS[number]; font: typeof CARD_FONTS[number] }) {
  const nameStyle = {
    fontSize: 18,
    fontFamily: font.id === "script" ? "'Brush Script MT','Segoe Script',cursive" : font.id === "inter" ? "var(--font-inter), sans-serif" : "var(--font-playfair)",
    fontStyle: font.id === "inter" ? "normal" : "italic",
    color: paper.accent,
    lineHeight: 1.2,
  };
  const labelStyle = {
    fontSize: 7,
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: paper.text,
    opacity: 0.38,
    fontFamily: "var(--font-inter), sans-serif",
  };

  return (
    <div style={{
      background: paper.bg,
      aspectRatio: "105 / 148",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      boxShadow: paper.id === "noir"
        ? "0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)"
        : "0 16px 48px rgba(28,20,16,0.16), 0 4px 12px rgba(28,20,16,0.08)",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 7, border: `0.5px solid ${paper.accent}`, opacity: 0.4, pointerEvents: "none", zIndex: 1 }} />

      {/* Top heart */}
      <div style={{ width: "65%", zIndex: 3, paddingTop: 4 }}>
        <HeartLine accent={paper.accent} />
      </div>

      {/* De / fromName */}
      <div style={{ textAlign: "center", zIndex: 3 }}>
        <p style={labelStyle}>Message de</p>
        <p style={nameStyle}>{card.fromName || "Sophie"}</p>
      </div>

      <div style={{ width: "50%", zIndex: 3 }}>
        <HeartLine accent={paper.accent} />
      </div>

      {/* Pour / toName */}
      <div style={{ textAlign: "center", zIndex: 3 }}>
        <p style={labelStyle}>Pour</p>
        <p style={nameStyle}>{card.toName || "Maman"}</p>
      </div>

      <div style={{ width: "50%", zIndex: 3 }}>
        <HeartLine accent={paper.accent} />
      </div>

      {/* Date */}
      {card.date && (
        <div style={{ textAlign: "center", zIndex: 3 }}>
          <p style={labelStyle}>Créé le</p>
          <p style={{ fontSize: 9, fontFamily: "var(--font-playfair)", fontStyle: "italic", color: paper.text, opacity: 0.7 }}>{card.date}</p>
        </div>
      )}

      {/* Logo small */}
      <div style={{ zIndex: 3 }}>
        <Logo size={32} />
      </div>

      {/* Message perso ou quote par défaut */}
      <div style={{ textAlign: "center", zIndex: 3, padding: "0 4px" }}>
        {card.message ? (
          <p style={{
            fontSize: 7.5,
            fontFamily: font.id === "script" ? "'Brush Script MT','Segoe Script',cursive" : "var(--font-playfair)",
            fontStyle: "italic",
            color: paper.text,
            opacity: 0.7,
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
          }}>
            {card.message}
          </p>
        ) : (
          <p style={{ fontSize: 7, color: paper.text, opacity: 0.35, fontFamily: "var(--font-playfair)", fontStyle: "italic", lineHeight: 1.6 }}>
            Votre message personnel<br />apparaîtra ici.
          </p>
        )}
        <p style={{
          fontSize: 10,
          marginTop: 5,
          fontFamily: font.id === "script" ? "'Brush Script MT','Segoe Script',cursive" : "var(--font-playfair)",
          fontStyle: "italic",
          color: paper.accent,
        }}>
          N&apos;oublie jamais.
        </p>
      </div>

      {/* Bottom heart */}
      <div style={{ zIndex: 3, paddingBottom: 4 }}>
        <svg viewBox="0 0 16 16" fill={paper.accent} width={10} height={10} style={{ opacity: 0.6 }}>
          <path d="M8 14l-1-0.9C3.5 10.2 1 8.1 1 5.5 1 3.4 2.7 2 4.5 2c1.2 0 2.4.6 3.5 1.7C9.1 2.6 10.3 2 11.5 2 13.3 2 15 3.4 15 5.5c0 2.6-2.5 4.7-6 8.6L8 14z"/>
        </svg>
      </div>
    </div>
  );
}

// ── Physical Card (recto + verso, rendu Canva) ────────────────────────────────
function PhysicalCard({ card }: { card: CardData }) {
  const paper = PAPERS.find(p => p.id === card.paper) ?? PAPERS[0];
  const font = CARD_FONTS.find(f => f.id === card.cardFont) ?? CARD_FONTS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Canvas neutral — comme Canva */}
      <div style={{
        background: "#DEDAD5",
        borderRadius: 12,
        padding: "20px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {/* Labels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(28,20,16,0.4)", textAlign: "center", fontFamily: "var(--font-inter), sans-serif" }}>Recto</p>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(28,20,16,0.4)", textAlign: "center", fontFamily: "var(--font-inter), sans-serif" }}>Verso</p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <CardRecto card={card} paper={paper} font={font} />
          <CardVerso card={card} paper={paper} font={font} />
        </div>
      </div>

      {/* Spec */}
      <p style={{ fontSize: 9.5, textAlign: "center", color: "rgba(28,20,16,0.3)", fontFamily: "var(--font-inter), sans-serif", padding: "10px 0 0" }}>
        Format A6 · 105 × 148 mm · 350g · Recto-verso
      </p>
    </div>
  );
}

// ── Paper Selector ────────────────────────────────────────────────────────────
function PaperSelector({ selected, onChange }: { selected: string; onChange: (id: string) => void }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-muted)" }}>Papier</p>
      <div className="grid grid-cols-4 gap-2">
        {PAPERS.map((p) => {
          const active = selected === p.id;
          return (
            <button key={p.id} type="button" onClick={() => onChange(p.id)}
              className="rounded-xl overflow-hidden flex flex-col transition-all"
              style={{ border: `2px solid ${active ? p.accent : "rgba(28,20,16,0.08)"}`, boxShadow: active ? `0 0 0 3px ${p.accent}22` : "none", transform: active ? "scale(1.04)" : "scale(1)", background: "none", padding: 0, cursor: "pointer" }}
            >
              <div style={{ height: 36, background: p.bg, position: "relative" }}>
                {active && <div style={{ position: "absolute", top: 4, right: 4, width: 12, height: 12, borderRadius: "50%", background: p.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 10 10" fill="none" width={7} height={7}><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>}
              </div>
              <div style={{ padding: "3px 2px 4px", background: "white", textAlign: "center" }}>
                <p style={{ fontSize: 8, fontWeight: 700, color: active ? p.accent : "var(--ink-muted)", lineHeight: 1 }}>{p.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Font Selector ─────────────────────────────────────────────────────────────
function FontSelector({ selected, onChange, paperAccent = "var(--gold)" }: { selected: string; onChange: (id: string) => void; paperAccent?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-muted)" }}>Police</p>
      <div className="grid grid-cols-3 gap-2">
        {CARD_FONTS.map((f) => {
          const active = selected === f.id;
          return (
            <button key={f.id} type="button" onClick={() => onChange(f.id)}
              className="py-3 px-2 rounded-xl transition-all text-center"
              style={{ background: active ? "var(--ink)" : "white", border: `1.5px solid ${active ? "transparent" : "rgba(28,20,16,0.09)"}`, cursor: "pointer" }}
            >
              <p style={{ fontSize: 16, fontFamily: f.id === "script" ? "'Brush Script MT','Segoe Script',cursive" : f.family, fontStyle: f.italic ? "italic" : "normal", color: active ? paperAccent : "var(--ink)", lineHeight: 1, marginBottom: 3 }}>Aa</p>
              <p style={{ fontSize: 9, fontWeight: 600, color: active ? "rgba(240,232,216,0.6)" : "var(--ink-muted)" }}>{f.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Composer ─────────────────────────────────────────────────────────────
export default function ComposerClient() {
  const [step, setStep] = useState<WizardStep>(1);
  const [card, setCard] = useState<CardData>({ fromName: "", toName: "", date: "", occasion: "", theme: "classique", paper: "ivoire", cardFont: "playfair", message: "", shipping: { fullName: "", address: "", complement: "", postalCode: "", city: "", country: "France" } });
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [audioObjectUrl, setAudioObjectUrl] = useState("");
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState("");
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(28).fill(3));
  const [recordError, setRecordError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrlRef = useRef("");

  const step1Valid = card.fromName.trim().length > 0 && card.toName.trim().length > 0;
  const step2Valid = audioObjectUrl.length > 0;

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => () => {
    cleanup();
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, [cleanup]);

  const startRecording = async () => {
    setRecordState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);

      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mrRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setAudioObjectUrl(url);
        setRecordState("uploading");
        try {
          const fd = new FormData();
          fd.append("audio", blob, "message.webm");
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const json = await res.json();
          setUploadedAudioUrl(json.audioUrl ?? url);
        } catch {
          setUploadedAudioUrl(url);
        }
        setRecordState("done");
      };

      mr.start(100);
      setRecordState("recording");
      setRecordingSecs(0);
      timerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000);

      const tick = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        setBars(Array.from({ length: 28 }, (_, i) => Math.max(3, (data[Math.floor(i * data.length / 28)] / 255) * 52)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRecordError(
        msg.includes("Permission") || msg.includes("NotAllowed") || msg.includes("denied")
          ? "Accès au microphone refusé. Autorisez-le dans les réglages de votre navigateur."
          : !navigator.mediaDevices
          ? "Microphone indisponible. Vérifiez que le site est ouvert en HTTPS ou localhost."
          : "Impossible d'accéder au microphone. Vérifiez qu'aucune autre app ne l'utilise."
      );
      setRecordState("idle");
    }
  };

  const stopRecording = () => {
    mrRef.current?.stop();
    cleanup();
  };

  const resetRecording = () => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = ""; }
    setAudioObjectUrl("");
    setUploadedAudioUrl("");
    setRecordState("idle");
    setRecordingSecs(0);
    setBars(Array(28).fill(3));
  };

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, fromName: card.fromName, toName: card.toName, date: card.date, occasion: card.occasion, audioUrl: uploadedAudioUrl, theme: card.theme }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else { setCheckoutError("Erreur lors du paiement. Réessayez."); setCheckoutLoading(null); }
    } catch {
      setCheckoutError("Erreur réseau. Vérifiez votre connexion.");
      setCheckoutLoading(null);
    }
  };

  const goNext = () => setStep(s => Math.min(6, s + 1) as WizardStep);
  const goPrev = () => setStep(s => Math.max(1, s - 1) as WizardStep);

  const setShipping = (field: keyof Shipping, value: string) =>
    setCard(c => ({ ...c, shipping: { ...c.shipping, [field]: value } }));

  const { fullName, address, postalCode, city, country } = card.shipping;
  const step5Valid = fullName.trim().length > 0 && address.trim().length > 0 && postalCode.trim().length > 0 && city.trim().length > 0 && country.trim().length > 0;

  const setCardField = (field: keyof CardData, value: string) =>
    setCard(c => ({ ...c, [field]: value }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 flex items-center"
        style={{ height: 48, background: "rgba(240,232,216,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(184,134,26,0.08)" }}
      >
        <div className="w-full max-w-5xl mx-auto px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <Logo size={22} />
            <span className="text-[9px] font-black tracking-[0.22em] uppercase hidden sm:block" style={{ color: "var(--ink)" }}>
              N&apos;OUBLIE JAMAIS
            </span>
          </Link>

          {/* Step indicator — dots */}
          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4, 5, 6] as WizardStep[]).map((s) => (
              <div
                key={s}
                className="rounded-full transition-all duration-300"
                style={{
                  height: 5,
                  width: step === s ? 18 : 5,
                  background: step > s ? "var(--gold)" : step === s ? "var(--ink)" : "rgba(28,20,16,0.15)",
                }}
              />
            ))}
          </div>

          <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
            {["Votre carte", "Enregistrement", "Carte physique", "Aperçu web", "Livraison", "Formule"][step - 1]}
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-5 py-10">

        {/* STEP 1 — Personnalisation */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--gold)" }}>Étape 1 · Votre carte</p>
              <h1 className="text-[32px] sm:text-[40px] font-black leading-[1.06]" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Personnalisez<br />votre carte.
              </h1>
              <p className="text-[14px] mt-2" style={{ color: "var(--ink-muted)" }}>
                Ces informations s&apos;afficheront sur votre page d&apos;écoute.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              {/* Form */}
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="De la part de *">
                    <Input value={card.fromName} onChange={v => setCardField("fromName", v)} placeholder="Votre prénom" />
                  </Field>
                  <Field label="Pour *">
                    <Input value={card.toName} onChange={v => setCardField("toName", v)} placeholder="Destinataire" />
                  </Field>
                </div>

                <Field label="Date ou occasion">
                  <Input value={card.date} onChange={v => setCardField("date", v)} placeholder="ex : Notre mariage · 25 juin 2026" />
                </Field>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-muted)" }}>Type d&apos;occasion</p>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => {
                      const active = card.occasion === o;
                      return (
                        <button
                          key={o} type="button"
                          onClick={() => setCardField("occasion", active ? "" : o)}
                          className="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all"
                          style={{
                            background: active ? "var(--ink)" : "white",
                            color: active ? "white" : "var(--ink-muted)",
                            border: `1.5px solid ${active ? "transparent" : "rgba(28,20,16,0.09)"}`,
                          }}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ThemeSelector selected={card.theme} onChange={id => setCard(c => ({ ...c, theme: id }))} />

                {/* Mobile preview */}
                <div className="lg:hidden pt-2">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--ink-muted)" }}>Aperçu</p>
                  <CardPreview card={card} />
                </div>
              </div>

              {/* Desktop sticky preview */}
              <div className="hidden lg:block sticky top-16">
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3 text-center" style={{ color: "var(--ink-muted)" }}>Aperçu en temps réel</p>
                <CardPreview card={card} />
              </div>
            </div>

            <Nav
              onPrev={undefined}
              onNext={goNext}
              nextDisabled={!step1Valid}
              prevLabel=""
              nextLabel="Continuer"
            />
            <div className="mt-4 text-center">
              <Link href="/" className="text-[12px]" style={{ color: "rgba(28,20,16,0.3)" }}>Annuler</Link>
            </div>
          </motion.div>
        )}

        {/* STEP 2 — Enregistrement */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-10 max-w-sm">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--gold)" }}>Étape 2 · Votre message</p>
              <h1 className="text-[32px] sm:text-[40px] font-black leading-[1.06]" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Enregistrez<br />votre message.
              </h1>
              {card.toName && (
                <p className="text-[14px] mt-2" style={{ color: "var(--ink-muted)" }}>
                  <strong style={{ color: "var(--ink)" }}>{card.toName}</strong> l&apos;écoutera pour toujours.
                </p>
              )}
            </div>

            <div className="w-full max-w-md">
              {/* Idle */}
              {recordState === "idle" && (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-end justify-center gap-1 h-14 w-full max-w-xs">
                    {Array.from({ length: 28 }, (_, i) => (
                      <div key={i} className="rounded-full" style={{ width: 4, height: 3 + Math.abs(Math.sin(i * 0.9) * 5), background: "rgba(28,20,16,0.08)", flex: 1 }} />
                    ))}
                  </div>
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                    style={{ background: "linear-gradient(145deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 10px 36px rgba(184,134,26,0.38)" }}
                  >
                    <svg viewBox="0 0 24 24" width={28} height={28} fill="none">
                      <rect x="9" y="2" width="6" height="13" rx="3" fill="white"/>
                      <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 18v4M9 22h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <p className="text-[14px]" style={{ color: "var(--ink-muted)" }}>Appuyer pour commencer</p>
                  {recordError && (
                    <p className="text-[12px] text-center px-4" style={{ color: "#C0392B", maxWidth: 280 }}>{recordError}</p>
                  )}
                </div>
              )}

              {/* Requesting */}
              {recordState === "requesting" && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                  <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>Autorisation du microphone…</p>
                </div>
              )}

              {/* Recording */}
              {recordState === "recording" && (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-end justify-center gap-1 h-14 w-full max-w-xs">
                    {bars.map((h, i) => (
                      <div key={i} className="rounded-full" style={{ width: 4, height: h, background: "#C0392B", transition: "height 55ms", flex: 1 }} />
                    ))}
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute rounded-full animate-ping opacity-15" style={{ inset: 0, background: "#C0392B", animationDuration: "1.4s" }} />
                    <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center" style={{ background: "rgba(192,57,43,0.07)", border: "2px solid rgba(192,57,43,0.18)" }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C0392B" }} />
                        <span className="text-[9px] font-bold tracking-widest" style={{ color: "#C0392B" }}>REC</span>
                      </div>
                      <span className="text-[26px] font-black tabular-nums" style={{ color: "var(--ink)" }}>
                        {fmtTime(recordingSecs)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={stopRecording}
                    className="px-8 py-3.5 rounded-full font-bold text-[14px] text-white active:scale-95 transition-transform"
                    style={{ background: "#C0392B", boxShadow: "0 5px 20px rgba(192,57,43,0.34)" }}
                  >
                    Arrêter l&apos;enregistrement
                  </button>
                </div>
              )}

              {/* Uploading */}
              {recordState === "uploading" && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                  <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>Sauvegarde en cours…</p>
                </div>
              )}

              {/* Done */}
              {recordState === "done" && audioObjectUrl && (
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 5px 18px rgba(184,134,26,0.30)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                      <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>

                  <p className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>Message enregistré</p>

                  <div className="w-full rounded-2xl p-5" style={{ background: "white", boxShadow: "0 4px 20px rgba(28,20,16,0.07)" }}>
                    <AudioPlayer src={audioObjectUrl} accent="var(--gold)" />
                  </div>

                  <button
                    onClick={resetRecording}
                    className="text-[12px] px-4 py-1.5 rounded-full"
                    style={{ border: "1.5px solid rgba(28,20,16,0.10)", color: "var(--ink-muted)" }}
                  >
                    Ré-enregistrer
                  </button>
                </div>
              )}
            </div>

            <div className="w-full max-w-md">
              <Nav onPrev={goPrev} onNext={goNext} nextDisabled={!step2Valid} prevLabel="Retour" nextLabel="Continuer" />
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Carte physique */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mb-8 text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--gold)" }}>Étape 3 · Carte physique</p>
              <h1 className="text-[32px] sm:text-[40px] font-black leading-[1.06]" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Voici la carte<br />que recevra {card.toName || "votre destinataire"}.
              </h1>
              <p className="text-[14px] mt-2" style={{ color: "var(--ink-muted)" }}>
                Choisissez le papier et la police. La carte sera envoyée par courrier avec le QR code intégré.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start max-w-4xl mx-auto">
              {/* Selectors */}
              <div className="flex flex-col gap-6">
                <PaperSelector
                  selected={card.paper}
                  onChange={id => setCard(c => ({ ...c, paper: id }))}
                />
                <FontSelector
                  selected={card.cardFont}
                  onChange={id => setCard(c => ({ ...c, cardFont: id }))}
                  paperAccent={(PAPERS.find(p => p.id === card.paper) ?? PAPERS[0]).accent}
                />

                {/* Message écrit */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-muted)" }}>
                    Message écrit <span style={{ opacity: 0.45, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span>
                  </p>
                  <textarea
                    value={card.message}
                    onChange={e => setCard(c => ({ ...c, message: e.target.value }))}
                    placeholder={"Ex : Tu es la plus belle chose qui me soit arrivée.\nJe t'aime, pour toujours."}
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-[13px] outline-none resize-none"
                    style={{
                      background: "white",
                      border: `1.5px solid ${card.message ? "var(--gold)" : "rgba(28,20,16,0.10)"}`,
                      color: "var(--ink)",
                      fontFamily: "var(--font-playfair)",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                      boxShadow: card.message ? "0 0 0 3px rgba(184,134,26,0.08)" : "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  />
                  <p className="text-[10px] mt-1 text-right" style={{ color: "rgba(28,20,16,0.28)" }}>{card.message.length}/200</p>
                </div>

                <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: "rgba(184,134,26,0.06)", border: "1px solid rgba(184,134,26,0.12)" }}>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" stroke="var(--gold)" strokeWidth="1.5"/>
                    <path d="M12 8v4M12 16h.01" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    La carte est imprimée sur papier 350g et envoyée directement chez votre destinataire en 3 à 5 jours ouvrés.
                  </p>
                </div>
              </div>

              {/* Live card preview — style Canva */}
              <div className="sticky top-16">
                <PhysicalCard card={card} />
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <Nav onPrev={goPrev} onNext={goNext} prevLabel="Retour" nextLabel="Aperçu de la page web" />
            </div>
          </motion.div>
        )}

        {/* STEP 4 — Aperçu web */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--gold)" }}>Étape 4 · Aperçu web</p>
              <h1 className="text-[32px] sm:text-[40px] font-black leading-[1.06]" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                La page d&apos;écoute<br />de votre carte.
              </h1>
              <p className="text-[14px] mt-2" style={{ color: "var(--ink-muted)" }}>
                C&apos;est ce que <strong style={{ color: "var(--ink)" }}>{card.toName || "votre destinataire"}</strong> verra après avoir scanné le QR code.
              </p>
            </div>

            <div className="w-full max-w-sm">
              <CardPreview card={card} audioSrc={audioObjectUrl} />
            </div>

            <div className="w-full max-w-sm">
              <Nav onPrev={goPrev} onNext={goNext} prevLabel="Retour" nextLabel="Adresse de livraison" />
            </div>
          </motion.div>
        )}

        {/* STEP 5 — Livraison */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--gold)" }}>Étape 5 · Livraison</p>
              <h1 className="text-[32px] sm:text-[40px] font-black leading-[1.06]" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Où envoyer<br />la carte ?
              </h1>
              <p className="text-[14px] mt-2" style={{ color: "var(--ink-muted)" }}>
                Votre carte sera expédiée directement chez votre destinataire.
              </p>
            </div>

            <div className="w-full max-w-md flex flex-col gap-5">

              {/* Récapitulatif expéditeur */}
              <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(184,134,26,0.08)" }}>
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
                    <path d="M3 8l9 6 9-6" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="2" y="6" width="20" height="13" rx="2" stroke="var(--gold)" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Carte de</p>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                    {card.fromName} <span style={{ color: "var(--gold)" }}>♥</span> pour {card.toName}
                  </p>
                </div>
              </div>

              {/* Formulaire adresse */}
              <Field label="Nom complet du destinataire *">
                <Input
                  value={card.shipping.fullName}
                  onChange={v => setShipping("fullName", v)}
                  placeholder={`${card.toName || "Prénom Nom"}`}
                />
              </Field>

              <Field label="Adresse *">
                <Input
                  value={card.shipping.address}
                  onChange={v => setShipping("address", v)}
                  placeholder="12 rue des Roses"
                />
              </Field>

              <Field label="Complément d'adresse">
                <Input
                  value={card.shipping.complement}
                  onChange={v => setShipping("complement", v)}
                  placeholder="Apt, bâtiment, étage… (optionnel)"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Code postal *">
                  <Input
                    value={card.shipping.postalCode}
                    onChange={v => setShipping("postalCode", v)}
                    placeholder="75001"
                  />
                </Field>
                <Field label="Ville *">
                  <Input
                    value={card.shipping.city}
                    onChange={v => setShipping("city", v)}
                    placeholder="Paris"
                  />
                </Field>
              </div>

              <Field label="Pays *">
                <select
                  value={card.shipping.country}
                  onChange={e => setShipping("country", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none appearance-none"
                  style={{
                    background: "white",
                    border: "1.5px solid rgba(28,20,16,0.10)",
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  {["France", "Belgique", "Suisse", "Luxembourg", "Canada", "Autre"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              {/* Info délai */}
              <div className="rounded-2xl p-4 flex gap-3 items-center" style={{ background: "rgba(184,134,26,0.05)", border: "1px solid rgba(184,134,26,0.10)" }}>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="var(--gold)" strokeWidth="1.5"/>
                  <path d="M12 7v5l3 3" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
                  Livraison en <strong style={{ color: "var(--ink)" }}>3 à 5 jours ouvrés</strong> · Suivi d&apos;envoi inclus · Emballage soigné
                </p>
              </div>

              <Nav onPrev={goPrev} onNext={goNext} nextDisabled={!step5Valid} prevLabel="Retour" nextLabel="Choisir ma formule" />
            </div>
          </motion.div>
        )}

        {/* STEP 6 — Formule */}
        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mb-8 text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--gold)" }}>Étape 6 · Votre formule</p>
              <h1 className="text-[32px] sm:text-[40px] font-black leading-[1.06]" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
                Choisissez<br />votre formule.
              </h1>
              <p className="text-[14px] mt-2" style={{ color: "var(--ink-muted)" }}>
                Paiement sécurisé · Accès immédiat après confirmation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="flex-1 rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: plan.highlight ? "var(--ink)" : "white",
                    border: plan.highlight ? "none" : "1.5px solid rgba(28,20,16,0.09)",
                    boxShadow: plan.highlight ? "0 16px 50px rgba(28,20,16,0.20)" : "0 3px 16px rgba(28,20,16,0.05)",
                  }}
                >
                  {plan.highlight && (
                    <div className="py-2 text-center" style={{ background: "linear-gradient(90deg, var(--gold-light), var(--gold-dark))" }}>
                      <span className="text-[9px] font-black tracking-[0.22em] uppercase text-white">Le plus populaire</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1 gap-1">
                    <p className="text-[20px] font-black" style={{ color: plan.highlight ? "var(--cream)" : "var(--ink)", fontFamily: "var(--font-playfair)" }}>{plan.name}</p>
                    <p className="text-[11px] mb-5" style={{ color: plan.highlight ? "rgba(240,232,216,0.4)" : "var(--ink-muted)" }}>{plan.tagline}</p>

                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-[36px] font-black leading-none" style={{ color: plan.highlight ? "var(--cream)" : "var(--ink)" }}>
                        {plan.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-[15px] font-semibold" style={{ color: plan.highlight ? "rgba(240,232,216,0.55)" : "var(--ink-muted)" }}>€</span>
                    </div>

                    <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[12px]" style={{ color: plan.highlight ? "rgba(240,232,216,0.6)" : "var(--ink-muted)" }}>
                          <svg viewBox="0 0 12 12" width={10} height={10} fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkoutLoading !== null}
                      className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all active:scale-95 disabled:opacity-50"
                      style={plan.highlight
                        ? { background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", color: "white", boxShadow: "0 3px 16px rgba(184,134,26,0.28)" }
                        : { background: "var(--ink)", color: "var(--cream)" }
                      }
                    >
                      {checkoutLoading === plan.id
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                            Redirection…
                          </span>
                        : `Choisir — ${plan.price.toFixed(2).replace(".", ",")} €`
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {checkoutError && (
              <p className="text-center text-[12px] mt-4" style={{ color: "#C0392B" }}>{checkoutError}</p>
            )}

            {/* Récap livraison */}
            {card.shipping.fullName && (
              <div className="max-w-lg mx-auto mt-6 rounded-2xl p-4 flex gap-3 items-start" style={{ background: "white", border: "1px solid rgba(184,134,26,0.10)" }}>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="var(--gold)" strokeWidth="1.5"/>
                  <path d="M9 22V12h6v10" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--ink-muted)" }}>Livraison à</p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{card.shipping.fullName}</p>
                  <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>
                    {card.shipping.address}{card.shipping.complement ? `, ${card.shipping.complement}` : ""}<br />
                    {card.shipping.postalCode} {card.shipping.city} · {card.shipping.country}
                  </p>
                </div>
              </div>
            )}

            <p className="text-center text-[11px] mt-6" style={{ color: "rgba(28,20,16,0.28)" }}>
              Paiement sécurisé · Stripe · Visa · Mastercard · Apple Pay
            </p>

            <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid rgba(28,20,16,0.06)" }}>
              <button onClick={goPrev} className="text-[12px]" style={{ color: "rgba(28,20,16,0.35)" }}>← Retour</button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
