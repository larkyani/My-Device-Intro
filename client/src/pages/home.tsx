import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { SetupSection } from "@/components/setup-section";
import { GamesSection } from "@/components/games-section";
import { SnsSection } from "@/components/sns-section";
import { StarScrollEffect } from "@/components/star-scroll";
import { PageDecorations } from "@/components/page-decorations";

/**
 * Ambient background orbs with mouse magnet tracking.
 * Each orb floats on its own cycle AND subtly follows the cursor.
 */
function AmbientLayer() {
  // Raw mouse position motion values (initialized to screen center)
  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 720
  );
  const mouseY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 450
  );

  // Smooth spring — slow & weighted for a dreamy feel
  const springCfg = { stiffness: 22, damping: 18, mass: 1.6 };
  const springX = useSpring(mouseX, springCfg);
  const springY = useSpring(mouseY, springCfg);

  // Each orb has a different sensitivity → parallax depth illusion
  const W = typeof window !== "undefined" ? window.innerWidth : 1440;
  const H = typeof window !== "undefined" ? window.innerHeight : 900;

  const aX = useTransform(springX, (v) => ((v / W) - 0.5) *  60);
  const aY = useTransform(springY, (v) => ((v / H) - 0.5) *  40);
  const bX = useTransform(springX, (v) => ((v / W) - 0.5) * -48);
  const bY = useTransform(springY, (v) => ((v / H) - 0.5) * -36);
  const cX = useTransform(springX, (v) => ((v / W) - 0.5) *  32);
  const cY = useTransform(springY, (v) => ((v / H) - 0.5) *  24);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Orb A — sky blue, top-left */}
      <motion.div
        className="absolute"
        style={{ x: aX, y: aY, top: -180, left: -120 }}
      >
        <motion.div
          animate={{ x: [0, 80, 40, 0], y: [0, 55, -25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 720, height: 720, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(174,198,255,0.40) 0%, transparent 68%)",
            filter: "blur(70px)",
          }}
        />
      </motion.div>

      {/* Orb B — cherry blossom pink, bottom-right */}
      <motion.div
        className="absolute"
        style={{ x: bX, y: bY, bottom: -120, right: -100 }}
      >
        <motion.div
          animate={{ x: [0, -65, -20, 0], y: [0, -50, 32, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{
            width: 640, height: 640, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,182,193,0.32) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
      </motion.div>

      {/* Orb C — pale violet, center wanderer */}
      <motion.div
        className="absolute"
        style={{ x: cX, y: cY, top: "38%", left: "52%" }}
      >
        <motion.div
          animate={{ x: [0, 50, -32, 0], y: [0, -42, 52, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 9 }}
          style={{
            width: 480, height: 480, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,167,255,0.24) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
        />
      </motion.div>
    </div>
  );
}


export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed ambient orbs + star scroll */}
      <AmbientLayer />
      <StarScrollEffect />

      {/* Page-wide decorations: corner accents, serial number, bg motifs */}
      <PageDecorations />

      {/* Sticky nav */}
      <Header />

      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <SetupSection />
        <GamesSection />
        <SnsSection />
      </main>
    </div>
  );
}
