import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

// ── サイトコンテンツ設定 — ここを編集するだけでWelcome画面のテキストが変わります ──
const SITE_CONFIG = {
  name:        "ぽんらめ",
  catchphrase: "My favorites, My style.",
  description: "私の『好き』を詰め込んだデジタルコレクションファイル。",
};

// ── ホバーでふんわり白が濃くなるガラスボタン ─────────────────────────────
function HoverGlassButton({
  onClick, borderColor, hoverBorderColor, shadowColor, textColor, children,
}: {
  onClick: () => void;
  borderColor: string;
  hoverBorderColor: string;
  shadowColor: string;
  textColor: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-8 py-3.5 text-sm font-display tracking-widest uppercase rounded-full focus:outline-none"
      style={{
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, ${shadowColor.replace("0.18", "0.22")} 100%)`
          : "rgba(255,255,255,0.68)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1.5px solid ${hovered ? hoverBorderColor : borderColor}`,
        color: textColor,
        boxShadow: hovered
          ? `0 8px 28px ${shadowColor.replace("0.18", "0.35")}, inset 0 1px 0 rgba(255,255,255,0.95)`
          : `0 4px 20px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.9)`,
        transform: hovered ? "translateY(-2px)" : "translateY(0px)",
        transition: "background 0.35s ease, border-color 0.35s ease, transform 0.3s ease, box-shadow 0.35s ease",
      }}
    >
      {children}
    </button>
  );
}

// ── Main section ──────────────────────────────────────────────────────────
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // セクション内スクロール量を取得
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // コンテンツ全体: スクロールで上へ・縮小・フェードアウト
  const contentY     = useTransform(scrollYProgress, [0, 0.55], [0, -45],  { ease: (t) => 1 - Math.pow(1 - t, 3) });
  const contentScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.94], { ease: (t) => 1 - Math.pow(1 - t, 3) });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  // blur は useMotionTemplate で文字列補間
  const blurVal  = useTransform(scrollYProgress, [0, 0.45], [0, 4]);
  const filterStyle = useMotionTemplate`blur(${blurVal}px)`;

  // Scroll indicator: 少し早めに消える
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >

      {/* Background dot grid + center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(224,242,254,0.55) 0%, transparent 62%),
            radial-gradient(rgba(174,198,255,0.13) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "100% 100%, 40px 40px",
        }}
      />

      {/* ── Content — スクロールで奥へ溶けていく ── */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20 pb-20"
        style={{
          y: contentY,
          scale: contentScale,
          opacity: contentOpacity,
          filter: filterStyle,
          willChange: "transform, opacity, filter",
        }}
      >

        {/* Subtitle: ✨ COLLECTION FILE SET ✨ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div
            className="h-px flex-1 max-w-[72px]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(244,114,182,0.55))" }}
          />
          <span className="terminal-label">✨ Collection File Set ✨</span>
          <div
            className="h-px flex-1 max-w-[72px]"
            style={{ background: "linear-gradient(90deg, rgba(56,189,248,0.55), transparent)" }}
          />
        </motion.div>

        {/* ── Main title ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="mb-12"
        >
          {/* Intermittent idle: 1s motion → 3s still → repeat (total 4s cycle) */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 1,
              repeatDelay: 3,
              repeat: Infinity,
              ease: "easeOut",
            }}
          >
            <h1
              className="font-display leading-tight"
              style={{ fontSize: "clamp(3.0rem, 10.5vw, 8.2rem)", fontWeight: 900 }}
            >
              <span className="hero-title-text">Welcome to</span>
              <br />
              {/* 🔖 光の呼吸 — ふわっと光り、3秒静止 */}
              <motion.span
                style={{ display: "inline" }}
                animate={{
                  filter: [
                    "drop-shadow(0 0 0px rgba(147,197,253,0))",
                    "drop-shadow(0 0 28px rgba(147,197,253,0.85))",
                    "drop-shadow(0 0 0px rgba(147,197,253,0))",
                  ],
                }}
                transition={{
                  duration: 1,
                  repeatDelay: 3,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              >
                <span className="hero-title-text">my file🔖</span>
              </motion.span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Catchphrase */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 400,
            letterSpacing: "0.35em",
            color: "rgba(148,163,184,0.75)",
            marginBottom: "1.2rem",
          }}
        >
          {SITE_CONFIG.catchphrase}
        </motion.p>

        {/* Sub description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-slate-400 mx-auto leading-relaxed whitespace-nowrap"
          style={{ fontSize: "0.95rem", letterSpacing: "0.04em" }}
        >
          {SITE_CONFIG.description}
        </motion.p>

        {/* ── CTA Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <HoverGlassButton
            onClick={() => document.getElementById("setup")?.scrollIntoView({ behavior: "smooth" })}
            borderColor="rgba(147,197,253,0.5)"
            hoverBorderColor="rgba(147,197,253,0.75)"
            shadowColor="rgba(147,197,253,0.18)"
            textColor="#0369a1"
          >
            My Setup
          </HoverGlassButton>
          <HoverGlassButton
            onClick={() => document.getElementById("games")?.scrollIntoView({ behavior: "smooth" })}
            borderColor="rgba(249,168,212,0.5)"
            hoverBorderColor="rgba(249,168,212,0.75)"
            shadowColor="rgba(249,168,212,0.18)"
            textColor="#9d174d"
          >
            My Games
          </HoverGlassButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator — vertical animated line ── */}
      <motion.button
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.9 }}
        style={{ opacity: scrollIndicatorOpacity, filter: "none" }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 group focus:outline-none"
      >
        <span className="font-display text-[9px] tracking-[0.45em] uppercase text-slate-400 group-hover:text-sky-500 transition-colors duration-300">
          Scroll
        </span>
        <div
          className="w-px h-10 rounded-full overflow-hidden"
          style={{ background: "rgba(203,213,225,0.4)" }}
        >
          <motion.div
            className="w-full rounded-full"
            style={{
              height: "48%",
              background: "linear-gradient(to bottom, #f472b6, #818cf8, #38bdf8)",
            }}
            animate={{ y: ["-100%", "220%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.button>
    </section>
  );
}
