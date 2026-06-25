interface LogoProps {
  size?: number;
}

export default function Logo({ size = 110 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Circle border ── */}
      <circle cx="110" cy="110" r="96" stroke="#B8861A" strokeWidth="1.3" />

      {/* ════════════════════════════════
          ADULT FIGURE — left, bending right/forward
          ════════════════════════════════ */}

      {/* Head */}
      <ellipse cx="76" cy="46" rx="11" ry="13" stroke="#B8861A" strokeWidth="1.4" />
      {/* Hair on top */}
      <path d="M65 42 Q72 28 87 35" stroke="#B8861A" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Ear hint */}
      <path d="M65 47 Q62 50 64 54" stroke="#B8861A" strokeWidth="1.1" fill="none" strokeLinecap="round" />

      {/* Neck */}
      <path d="M76 59 L76 66" stroke="#B8861A" strokeWidth="1.4" strokeLinecap="round" />

      {/* Collar */}
      <path d="M68 66 Q76 62 84 66" stroke="#B8861A" strokeWidth="1.1" fill="none" strokeLinecap="round" />

      {/* Back / spine — bends forward toward child */}
      <path
        d="M68 66 Q62 80 58 94 Q54 108 56 120 Q58 132 60 144"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />

      {/* Chest / front torso */}
      <path
        d="M84 66 Q90 76 94 88 Q98 100 96 112"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />

      {/* Left arm — reaching down/forward to child's hand */}
      <path
        d="M86 74 Q102 88 114 104 Q122 114 126 124"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Adult's hand / fingers */}
      <path d="M126 124 Q129 128 128 132" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M126 124 Q131 126 132 130" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Right arm (back side, close to body) */}
      <path
        d="M70 70 Q62 80 58 90"
        stroke="#B8861A" strokeWidth="1.3" fill="none" strokeLinecap="round"
      />

      {/* Left leg */}
      <path
        d="M56 120 Q54 134 55 148 Q56 158 56 166"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Left foot */}
      <path d="M56 166 Q54 170 60 171 Q64 171 66 169" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Right leg */}
      <path
        d="M96 112 Q96 126 95 140 Q93 152 92 162"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Right foot */}
      <path d="M92 162 Q90 166 96 167 Q100 167 102 165" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* ════════════════════════════════
          CHILD FIGURE — right side, reaching UP
          ════════════════════════════════ */}

      {/* Head (rounder, child proportions) */}
      <ellipse cx="152" cy="130" rx="10" ry="11" stroke="#B8861A" strokeWidth="1.4" />
      {/* Child hair */}
      <path d="M142 126 Q151 115 162 122" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Ear hint */}
      <path d="M142 132 Q139 135 141 139" stroke="#B8861A" strokeWidth="1.1" fill="none" strokeLinecap="round" />

      {/* Child neck */}
      <path d="M152 141 L152 147" stroke="#B8861A" strokeWidth="1.3" strokeLinecap="round" />

      {/* Child body */}
      <path
        d="M144 147 Q140 158 138 168 Q136 176 136 182"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      <path
        d="M160 147 Q164 158 166 168 Q167 176 166 182"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />

      {/* Child's left arm — reaching up toward adult */}
      <path
        d="M144 150 Q136 140 130 130"
        stroke="#B8861A" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Child's hand / fingers */}
      <path d="M130 130 Q127 126 128 122" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M130 130 Q125 129 124 125" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Child's right arm (open/out) */}
      <path
        d="M160 150 Q168 142 172 136"
        stroke="#B8861A" strokeWidth="1.3" fill="none" strokeLinecap="round"
      />

      {/* Child legs */}
      <path d="M136 182 Q134 186 140 187" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M166 182 Q168 186 162 187" stroke="#B8861A" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* ── NJ monogram ── */}
      <text
        x="108"
        y="118"
        textAnchor="middle"
        fontSize="26"
        fill="#B8861A"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="500"
        letterSpacing="3"
      >
        NJ
      </text>

      {/* ── 4-pointed sparkles ── */}
      {/* Large sparkle — upper right */}
      <Star cx={163} cy={62} r={8} />
      {/* Small sparkle — mid right */}
      <Star cx={178} cy={88} r={5} />
      {/* Tiny sparkle — top center-right */}
      <Star cx={148} cy={46} r={3.5} />
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const i = r * 0.28;
  const d = `M${cx},${cy - r} C${cx + i},${cy - i} ${cx + i},${cy - i} ${cx + r},${cy} C${cx + i},${cy + i} ${cx + i},${cy + i} ${cx},${cy + r} C${cx - i},${cy + i} ${cx - i},${cy + i} ${cx - r},${cy} C${cx - i},${cy - i} ${cx - i},${cy - i} ${cx},${cy - r}Z`;
  return <path d={d} fill="#B8861A" />;
}
