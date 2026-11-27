import { useEffect, useRef } from "react";
import appIcon from "@/assets/refer/airtel-app-icon.png";

/**
 * Hero for the Refer screen: the Airtel app icon inside a ring of scattered dots.
 * A soft glowing cluster drifts slowly round the ring, and the ring itself turns very slowly.
 */
const SIZE = 280;
const RINGS = [
  { r: 84, n: 44 },
  { r: 98, n: 52 },
  { r: 112, n: 60 },
  { r: 126, n: 68 },
];
const LAP_MS = 20000; // one lap of the glowing cluster
const SPIN_MS = 120000; // one lap of the whole ring

type Dot = { a: number; r: number; s: number; tw: number };

function makeDots(): Dot[] {
  // Seeded so the pattern is the same on every load.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots: Dot[] = [];
  for (const ring of RINGS) {
    for (let i = 0; i < ring.n; i++) {
      if (rnd() < 0.18) continue; // gaps make it feel hand-scattered
      dots.push({
        a: (i / ring.n) * Math.PI * 2 + (rnd() - 0.5) * 0.08,
        r: ring.r + (rnd() - 0.5) * 7,
        s: 0.9 + rnd() * 0.9,
        tw: rnd() * Math.PI * 2,
      });
    }
  }
  return dots;
}

export function HeroRadial() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    const dots = makeDots();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = SIZE / 2;
    let raf = 0;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const spin = (t / SPIN_MS) * Math.PI * 2;
      const head = -Math.PI / 2 + (t / LAP_MS) * Math.PI * 2;
      for (const d of dots) {
        const a = d.a + spin;
        // Angular distance to the glowing cluster, 0…π.
        const diff =Math.abs(((a - head) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        const glow = Math.max(0, 1 - diff / 0.55) ** 2;
        const twinkle = 0.75 + 0.25 * Math.sin(t / 900 + d.tw);
        const x = c + Math.cos(a) * d.r;
        const y = c + Math.sin(a) * d.r;
        const rad = d.s * (1 + glow * 1.6);
        if (glow > 0.05) {
          ctx.shadowColor = `rgba(227,33,33,${0.65 * glow})`;
          ctx.shadowBlur = 10 * glow;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = glow > 0.05 ? `rgba(${227 - 20 * glow},${60 - 30 * glow},${70 - 30 * glow},${0.35 + 0.65 * glow})` : `rgba(196,120,124,${0.32 * twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (still) {
      draw(0);
      return;
    }
    const start = performance.now();
    const loop = (now: number) => {
      draw(now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }} data-testid="hero-radial">
      <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden />
      {/* Soft light behind the icon */}
      <div className="absolute left-1/2 top-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0)_70%)]" aria-hidden />
      <img
        src={appIcon}
        alt="Airtel app"
        className="absolute left-1/2 top-1/2 size-[96px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_14px_22px_rgba(227,33,33,0.28)]"
        draggable={false}
      />
    </div>
  );
}
