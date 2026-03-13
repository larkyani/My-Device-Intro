import { useEffect, useRef } from "react";

/** Pastel pixel-art star colors */
const COLORS = [
  "#FFE566", // pastel yellow
  "#A8D8FF", // sky blue
  "#FFB3D9", // cherry blossom pink
  "#B8FFFE", // pale cyan
  "#D4BBFF", // lavender
];

interface Star {
  x: number;
  y: number;
  color: string;
  opacity: number;
  vx: number;
  vy: number;
  size: number; // pixel block size
  birth: number;
  lifetime: number;
}

/**
 * Draw a retro pixel-art cross-star.
 * Shape (each # = size×size px block):
 *         #
 *      ## # ##
 *         #
 * Corner sparks add a twinkling feel.
 */
function drawPixelStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  alpha: number
) {
  ctx.globalAlpha = alpha * 0.88;
  ctx.fillStyle = color;

  const s = size;
  const px = Math.round(cx - s / 2);
  const py = Math.round(cy - s / 2);

  // Center
  ctx.fillRect(px, py, s, s);
  // Arms
  ctx.fillRect(px - s * 2, py, s, s);
  ctx.fillRect(px + s * 2, py, s, s);
  ctx.fillRect(px, py - s * 2, s, s);
  ctx.fillRect(px, py + s * 2, s, s);

  // Corner sparkles (half size)
  const hs = Math.max(1, Math.round(s * 0.6));
  ctx.globalAlpha = alpha * 0.45;
  ctx.fillRect(px - s * 2, py - s * 2, hs, hs);
  ctx.fillRect(px + s * 2 + s - hs, py - s * 2, hs, hs);
  ctx.fillRect(px - s * 2, py + s * 2 + s - hs, hs, hs);
  ctx.fillRect(px + s * 2 + s - hs, py + s * 2 + s - hs, hs, hs);

  ctx.globalAlpha = 1;
}

export function StarScrollEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars: Star[] = [];
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let raf: number | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const dy = Math.abs(window.scrollY - lastScrollY);
      const vel = (dy / dt) * 16; // normalize to ~pixels per frame

      lastScrollY = window.scrollY;
      lastScrollTime = now;

      // Star count scales with scroll velocity (1 to 4)
      const count = Math.min(Math.round(vel * 0.22) + 1, 4);

      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          opacity: 1,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(Math.random() * 0.5 + 0.2), // drift upward
          size: Math.random() > 0.45 ? 2 : 3,
          birth: now,
          lifetime: 1100 + Math.random() * 900,
        });
      }

      // Cap total star count
      if (stars.length > 40) stars.splice(0, stars.length - 40);

      startAnimation();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        const age = now - s.birth;

        if (age >= s.lifetime) {
          stars.splice(i, 1);
          continue;
        }

        // Ease-out fade
        const t = age / s.lifetime;
        s.opacity = Math.pow(1 - t, 1.4);

        s.x += s.vx;
        s.y += s.vy;

        drawPixelStar(ctx, s.x, s.y, s.size, s.color, s.opacity);
      }

      raf = stars.length > 0 ? requestAnimationFrame(animate) : null;
    };

    const startAnimation = () => {
      if (raf === null) raf = requestAnimationFrame(animate);
    };

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 6, imageRendering: "pixelated" }}
    />
  );
}
