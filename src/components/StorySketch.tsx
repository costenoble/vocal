"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mini "dessin animé" : trois scènes en traits dorés (style du logo) qui se
// dessinent d'elles-mêmes, en boucle. Un filtre de turbulence donne aux
// traits un tremblé de croquis fait main ; après le tracé, la scène "vit"
// (cœur qui bat, ondes qui pulsent, pointillés qui défilent).

const GOLD = "#B8861A";
const SCENE_MS = 5200;

interface SketchPath {
  d: string;
  width?: number;
  /** Pointillés qui défilent (faisceau de scan) — révélé en fondu. */
  dashed?: boolean;
  fill?: boolean;
  /** Vie après le tracé : battement (cœur) ou pulsation (ondes). */
  pulse?: "beat" | "wave";
}

interface Scene {
  caption: string;
  paths: SketchPath[];
}

const SCENES: Scene[] = [
  {
    caption: "Elle enregistre trois mots, depuis son téléphone.",
    paths: [
      // Tête + épaules (profil gauche)
      { d: "M96,58 a24,26 0 1 0 0.1,0" },
      { d: "M62,150 Q66,118 96,112 Q126,118 130,150" },
      // Cheveux
      { d: "M76,52 Q94,30 118,48", width: 1.4 },
      // Téléphone tenu près du visage
      { d: "M138,64 h26 a6,6 0 0 1 6,6 v46 a6,6 0 0 1 -6,6 h-26 a6,6 0 0 1 -6,-6 v-46 a6,6 0 0 1 6,-6 Z" },
      // Ondes de voix qui sortent
      { d: "M184,78 q10,12 0,24", width: 1.4, pulse: "wave" },
      { d: "M196,68 q18,22 0,44", width: 1.4, pulse: "wave" },
      { d: "M208,58 q26,32 0,64", width: 1.4, pulse: "wave" },
      // Petites barres d'enregistrement
      { d: "M236,84 v12 M246,78 v24 M256,86 v9 M266,74 v32 M276,84 v13", width: 2, pulse: "wave" },
      // Étoile
      { d: "M262,44 c1.5,4.5 1.5,4.5 6,6 c-4.5,1.5 -4.5,1.5 -6,6 c-1.5,-4.5 -1.5,-4.5 -6,-6 c4.5,-1.5 4.5,-1.5 6,-6 Z", fill: true },
    ],
  },
  {
    caption: "Il scanne la carte glissée dans le coffret.",
    paths: [
      // Carte posée
      { d: "M56,74 h76 a6,6 0 0 1 6,6 v96 a6,6 0 0 1 -6,6 h-76 a6,6 0 0 1 -6,-6 v-96 a6,6 0 0 1 6,-6 Z" },
      // QR code stylisé (petits carrés)
      { d: "M72,104 h14 v14 h-14 Z", width: 1.4 },
      { d: "M102,104 h14 v14 h-14 Z", width: 1.4 },
      { d: "M72,134 h14 v14 h-14 Z", width: 1.4 },
      { d: "M104,136 h5 v5 h-5 Z M112,144 h5 v5 h-5 Z", width: 1.4 },
      // Cœur en haut de la carte
      { d: "M94,88 c-2,-4 -8,-3 -8,1.5 c0,3.5 4.5,6 8,9 c3.5,-3 8,-5.5 8,-9 c0,-4.5 -6,-5.5 -8,-1.5 Z", fill: true },
      // Téléphone qui scanne (au-dessus)
      { d: "M196,44 h40 a7,7 0 0 1 7,7 v72 a7,7 0 0 1 -7,7 h-40 a7,7 0 0 1 -7,-7 v-72 a7,7 0 0 1 7,-7 Z" },
      { d: "M208,54 h16", width: 1.4 },
      // Faisceau de scan (pointillés qui défilent)
      { d: "M192,118 L138,102", dashed: true, width: 1.4 },
      { d: "M192,130 L138,148", dashed: true, width: 1.4 },
      // Bip de reconnaissance
      { d: "M250,140 q8,8 0,16", width: 1.4, pulse: "wave" },
      { d: "M260,132 q14,16 0,32", width: 1.4, pulse: "wave" },
    ],
  },
  {
    caption: "Sa voix est là. Pour toujours.",
    paths: [
      // Main adulte (gauche) qui tend
      { d: "M34,128 Q78,106 116,116 Q128,120 136,128", width: 1.8 },
      { d: "M136,128 q4,4 2,9 M136,128 q7,2 9,7", width: 1.4 },
      // Main enfant (droite) qui tend
      { d: "M286,150 Q244,160 208,144 Q198,139 192,132", width: 1.8 },
      { d: "M192,132 q-4,-4 -2,-9 M192,132 q-7,-2 -9,-7", width: 1.4 },
      // Cœur au centre — il bat
      { d: "M163,92 c-5,-10 -20,-7 -20,4 c0,9 11,15 20,23 c9,-8 20,-14 20,-23 c0,-11 -15,-14 -20,-4 Z", width: 1.8, pulse: "beat" },
      // Ondes autour du cœur
      { d: "M128,84 q-10,20 0,40", width: 1.2, pulse: "wave" },
      { d: "M198,84 q10,20 0,40", width: 1.2, pulse: "wave" },
      // Étoiles
      { d: "M120,54 c1.5,4.5 1.5,4.5 6,6 c-4.5,1.5 -4.5,1.5 -6,6 c-1.5,-4.5 -1.5,-4.5 -6,-6 c4.5,-1.5 4.5,-1.5 6,-6 Z", fill: true },
      { d: "M212,48 c1,3 1,3 4,4 c-3,1 -3,1 -4,4 c-1,-3 -1,-3 -4,-4 c3,-1 3,-1 4,-4 Z", fill: true },
    ],
  },
];

function ScenePath({ p, index }: { p: SketchPath; index: number }) {
  const baseDelay = 0.15 + index * 0.22;

  // Pointillés : framer-motion pilote stroke-dasharray pour le tracé
  // progressif, incompatible avec un motif de tirets — on révèle donc en
  // fondu et on fait défiler les tirets en CSS.
  if (p.dashed) {
    return (
      <motion.path
        d={p.d}
        stroke={GOLD}
        strokeWidth={p.width ?? 1.6}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="4 6"
        style={{ animation: "nj-dash-march 0.7s linear infinite" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1] }}
        transition={{ delay: baseDelay, duration: 1.2, times: [0, 0.4, 0.7, 1] }}
      />
    );
  }

  const life =
    p.pulse === "beat"
      ? { scale: [1, 1.14, 1, 1.1, 1] }
      : p.pulse === "wave"
        ? { strokeOpacity: [1, 0.35, 1] }
        : {};

  const lifeTransition =
    p.pulse === "beat"
      ? { scale: { delay: baseDelay + 1.2, duration: 1.4, repeat: Infinity, ease: "easeInOut" as const } }
      : p.pulse === "wave"
        ? { strokeOpacity: { delay: baseDelay + 1.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" as const } }
        : {};

  return (
    <motion.path
      d={p.d}
      stroke={GOLD}
      strokeWidth={p.width ?? 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={{ pathLength: 0, opacity: 0, fill: "rgba(184,134,26,0)" }}
      animate={{
        pathLength: 1,
        opacity: 1,
        fill: p.fill ? "rgba(184,134,26,1)" : "rgba(184,134,26,0)",
        ...life,
      }}
      transition={{
        pathLength: { delay: baseDelay, duration: 0.7, ease: "easeInOut" },
        opacity: { delay: baseDelay, duration: 0.2 },
        fill: { delay: baseDelay + 0.35, duration: 0.4 },
        ...lifeTransition,
      }}
    />
  );
}

export default function StorySketch() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), SCENE_MS);
    return () => clearInterval(id);
  }, []);

  const current = SCENES[scene];

  return (
    <div className="flex flex-col items-center gap-5">
      <style>{`@keyframes nj-dash-march { to { stroke-dashoffset: -20; } }`}</style>

      {/* Toile du dessin */}
      <div
        className="w-full rounded-3xl overflow-hidden"
        style={{ background: "var(--cream)", border: "1px solid rgba(184,134,26,0.16)", boxShadow: "0 6px 30px rgba(184,134,26,0.08)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center px-5 pt-6 pb-7"
          >
            <svg viewBox="0 0 320 200" width="100%" style={{ maxWidth: 420 }} fill="none" aria-hidden>
              <defs>
                {/* Tremblé de croquis fait main */}
                <filter id="nj-sketch" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
                </filter>
              </defs>
              <g filter="url(#nj-sketch)">
                {current.paths.map((p, i) => (
                  <ScenePath key={i} p={p} index={i} />
                ))}
              </g>
            </svg>

            {/* Légende de la scène */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-[15px] sm:text-[17px] italic text-center mt-3"
              style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}
            >
              «&nbsp;{current.caption}&nbsp;»
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicateur : la pastille active se remplit sur la durée de la scène */}
      <div className="flex items-center gap-2">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => setScene(i)}
            aria-label={`Scène ${i + 1}`}
            className="rounded-full overflow-hidden transition-all"
            style={{
              width: scene === i ? 30 : 7,
              height: 7,
              background: "rgba(184,134,26,0.22)",
            }}
          >
            {scene === i && (
              <motion.div
                key={`fill-${scene}`}
                className="h-full rounded-full"
                style={{ background: GOLD }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SCENE_MS / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
