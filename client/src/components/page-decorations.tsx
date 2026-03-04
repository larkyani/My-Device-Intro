import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Gamepad2, Heart, Star } from "lucide-react";


// ── Vertical serial number ────────────────────────────────────────────────
function SerialNumber() {
  return (
    <div
      className="fixed z-[3] pointer-events-none hidden sm:block"
      style={{
        right: 5,
        top: "50%",
        transform: "translateY(-50%)",
        writingMode: "vertical-rl",
        textOrientation: "mixed",
      }}
    >
      <span
        style={{
          fontFamily: "'Oxanium', 'M PLUS Rounded 1c', sans-serif",
          fontSize: "8.5px",
          letterSpacing: "0.24em",
          color: "rgba(148,163,184,0.30)",
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        VER. 1.0.2 / COLLECTION FILE SET
      </span>
    </div>
  );
}

// ── Background motifs with parallax ──────────────────────────────────────
interface MotifDef {
  type: "gamepad" | "heart" | "star";
  top: string;
  side: "left" | "right";
  sideValue: string;
  size: number;
  rotate: number;
  baseOpacity: number;
  delay: number;
}

const MOTIFS: MotifDef[] = [
  { type: "gamepad", top: "4%",  side: "left",  sideValue: "2.5%", size: 30, rotate: -14, baseOpacity: 0.26, delay: 0   },
  { type: "star",    top: "8%",  side: "right", sideValue: "3%",   size: 26, rotate:  12, baseOpacity: 0.28, delay: 0.6 },
  { type: "heart",   top: "18%", side: "left",  sideValue: "3%",   size: 22, rotate: -20, baseOpacity: 0.25, delay: 1.8 },
  { type: "star",    top: "24%", side: "right", sideValue: "2.5%", size: 28, rotate: -8,  baseOpacity: 0.24, delay: 2.4 },
  { type: "gamepad", top: "30%", side: "left",  sideValue: "2%",   size: 34, rotate:  6,  baseOpacity: 0.23, delay: 3.0 },
  { type: "star",    top: "36%", side: "right", sideValue: "3%",   size: 24, rotate:  20, baseOpacity: 0.26, delay: 0.3 },
  { type: "heart",   top: "42%", side: "left",  sideValue: "2.8%", size: 22, rotate: -15, baseOpacity: 0.25, delay: 1.2 },
  { type: "gamepad", top: "47%", side: "right", sideValue: "2.2%", size: 28, rotate: -10, baseOpacity: 0.24, delay: 2.2 },
  { type: "star",    top: "53%", side: "left",  sideValue: "2.5%", size: 30, rotate: -25, baseOpacity: 0.24, delay: 2.0 },
  { type: "gamepad", top: "64%", side: "left",  sideValue: "2%",   size: 32, rotate:  10, baseOpacity: 0.25, delay: 3.5 },
  { type: "star",    top: "70%", side: "right", sideValue: "3%",   size: 22, rotate: -5,  baseOpacity: 0.27, delay: 0.9 },
  { type: "heart",   top: "76%", side: "left",  sideValue: "2.5%", size: 24, rotate:  18, baseOpacity: 0.25, delay: 1.6 },
  { type: "gamepad", top: "80%", side: "right", sideValue: "2.5%", size: 26, rotate: -18, baseOpacity: 0.24, delay: 2.5 },
  { type: "star",    top: "85%", side: "left",  sideValue: "3%",   size: 28, rotate:  22, baseOpacity: 0.26, delay: 1.4 },
  { type: "gamepad", top: "97%", side: "left",  sideValue: "2.2%", size: 30, rotate:  -8, baseOpacity: 0.23, delay: 0.5 },
];

// アイコンごとに異なる視差係数 → スクロール時に奥行き差が出る
function BgMotif({
  motif,
  scrollY,
  index,
}: {
  motif: MotifDef;
  scrollY: MotionValue<number>;
  index: number;
}) {
  // index 0→0.06, 1→0.115, 2→0.17, 3→0.225 … と段階的に速度差
  const factor = 0.06 + (index % 4) * 0.055;
  const y = useTransform(scrollY, [0, 5000], [0, -5000 * factor]);

  const Icon = motif.type === "gamepad" ? Gamepad2 : motif.type === "star" ? Star : Heart;
  const lo = +(motif.baseOpacity * 0.55).toFixed(3);
  const hi = +(motif.baseOpacity * 1.45).toFixed(3);

  return (
    <motion.div
      className="absolute"
      style={{
        top: motif.top,
        [motif.side]: motif.sideValue,
        y,
        rotate: motif.rotate,
        color: motif.type === "gamepad" ? "#93c5fd" : motif.type === "star" ? "#c4b5fd" : "#f9a8d4",
      }}
      animate={{ opacity: [lo, hi, lo] }}
      transition={{
        duration: 5 + index * 0.9,
        repeat: Infinity,
        ease: "easeInOut",
        delay: motif.delay,
      }}
    >
      <Icon style={{ width: motif.size, height: motif.size }} />
    </motion.div>
  );
}

function BgMotifs() {
  const { scrollY } = useScroll();

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden hidden sm:block">
      {MOTIFS.map((m, i) => (
        <BgMotif key={i} motif={m} scrollY={scrollY} index={i} />
      ))}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────
export function PageDecorations() {
  return (
    <>
      <SerialNumber />
      <BgMotifs />
    </>
  );
}
