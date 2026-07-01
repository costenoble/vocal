"use client";

import { motion } from "framer-motion";

interface LogoDrawProps {
  size?: number;
  /** Total draw duration in seconds (strokes). Default ~2.2s. */
  duration?: number;
  color?: string;
}

// Ordered stroke list — drawn in a natural sequence (circle → adult → child).
// Mirrors src/components/Logo.tsx exactly, but each stroke animates its pathLength.
const STROKES: { d: string; w: number }[] = [
  // Adult figure
  { d: "M65 42 Q72 28 87 35", w: 1.3 },
  { d: "M65 47 Q62 50 64 54", w: 1.1 },
  { d: "M76 59 L76 66", w: 1.4 },
  { d: "M68 66 Q76 62 84 66", w: 1.1 },
  { d: "M68 66 Q62 80 58 94 Q54 108 56 120 Q58 132 60 144", w: 1.4 },
  { d: "M84 66 Q90 76 94 88 Q98 100 96 112", w: 1.4 },
  { d: "M86 74 Q102 88 114 104 Q122 114 126 124", w: 1.4 },
  { d: "M126 124 Q129 128 128 132", w: 1.2 },
  { d: "M126 124 Q131 126 132 130", w: 1.2 },
  { d: "M70 70 Q62 80 58 90", w: 1.3 },
  { d: "M56 120 Q54 134 55 148 Q56 158 56 166", w: 1.4 },
  { d: "M56 166 Q54 170 60 171 Q64 171 66 169", w: 1.2 },
  { d: "M96 112 Q96 126 95 140 Q93 152 92 162", w: 1.4 },
  { d: "M92 162 Q90 166 96 167 Q100 167 102 165", w: 1.2 },
  // Child figure
  { d: "M142 126 Q151 115 162 122", w: 1.2 },
  { d: "M142 132 Q139 135 141 139", w: 1.1 },
  { d: "M152 141 L152 147", w: 1.3 },
  { d: "M144 147 Q140 158 138 168 Q136 176 136 182", w: 1.4 },
  { d: "M160 147 Q164 158 166 168 Q167 176 166 182", w: 1.4 },
  { d: "M144 150 Q136 140 130 130", w: 1.4 },
  { d: "M130 130 Q127 126 128 122", w: 1.2 },
  { d: "M130 130 Q125 129 124 125", w: 1.2 },
  { d: "M160 150 Q168 142 172 136", w: 1.3 },
  { d: "M136 182 Q134 186 140 187", w: 1.2 },
  { d: "M166 182 Q168 186 162 187", w: 1.2 },
];

const SPARKS: { cx: number; cy: number; r: number }[] = [
  { cx: 163, cy: 62, r: 8 },
  { cx: 178, cy: 88, r: 5 },
  { cx: 148, cy: 46, r: 3.5 },
];

function sparkPath(cx: number, cy: number, r: number) {
  const i = r * 0.28;
  return `M${cx},${cy - r} C${cx + i},${cy - i} ${cx + i},${cy - i} ${cx + r},${cy} C${cx + i},${cy + i} ${cx + i},${cy + i} ${cx},${cy + r} C${cx - i},${cy + i} ${cx - i},${cy + i} ${cx - r},${cy} C${cx - i},${cy - i} ${cx - i},${cy - i} ${cx},${cy - r}Z`;
}

export default function LogoDraw({ size = 160, duration = 2.2, color = "#B8861A" }: LogoDrawProps) {
  // Distribute the draw across all strokes (+ circle + heads).
  const total = STROKES.length + 3; // + circle + 2 heads
  const per = duration / total;
  const strokeTransition = (i: number) => ({
    pathLength: { delay: i * per * 0.6, duration: per * 3, ease: "easeInOut" as const },
  });

  return (
    <svg viewBox="0 0 220 220" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Circle border */}
      <motion.circle
        cx="110" cy="110" r="96" stroke={color} strokeWidth="1.3" fill="none"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: duration * 0.9, ease: "easeInOut" }, opacity: { duration: 0.4 } }}
      />

      {/* Adult head */}
      <motion.ellipse
        cx="76" cy="46" rx="11" ry="13" stroke={color} strokeWidth="1.4" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={strokeTransition(1)}
      />
      {/* Child head */}
      <motion.ellipse
        cx="152" cy="130" rx="10" ry="11" stroke={color} strokeWidth="1.4" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={strokeTransition(14)}
      />

      {/* All strokes */}
      {STROKES.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          stroke={color}
          strokeWidth={s.w}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={strokeTransition(i)}
        />
      ))}

      {/* NJ monogram — fades in once strokes are mostly drawn */}
      <motion.text
        x="108" y="118" textAnchor="middle" fontSize="26" fill={color}
        fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="500" letterSpacing="3"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: duration * 0.72, duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: "108px 110px" }}
      >
        NJ
      </motion.text>

      {/* Sparkles — pop in at the very end */}
      {SPARKS.map((s, i) => (
        <motion.path
          key={`sp-${i}`}
          d={sparkPath(s.cx, s.cy, s.r)}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: duration * 0.82 + i * 0.12, type: "spring", stiffness: 400, damping: 14 }}
          style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
        />
      ))}
    </svg>
  );
}
