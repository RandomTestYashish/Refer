import { useEffect, useRef, type RefObject } from "react";
import appIcon from "@/assets/refer/airtel-app-icon.png";

/**
 * Hero for the Refer screen: the Airtel app icon inside a ring of scattered dots.
 * One clock drives everything so it stays in sync:
 *  - a soft glow drifts round the ring (one lap = LAP_MS) in the same reds as the title,
 *  - the logo does a small settling bounce every quarter lap,
 *  - when the glow passes the bottom (closest to the title) a light sheen runs across the title amount.
 */
const SIZE = 280;
const RINGS = [
  { r: 80, n: 56 },
  { r: 90, n: 64 },
  { r: 100, n: 72 },
  { r: 110, n: 80 },
  { r: 120, n: 88 },
  { r: 130, n: 96 },
];
const LAP_MS = 20000; // one lap of the glow
const SPIN_MS = 120000; // one lap of the whole ring
const BOUNCE_EVERY = LAP_MS / 4;
const SPREAD = 1.1; // radians the glow covers on each side

// Title colours (₹5,000): #E32121 → #7D1212
const RED = [227, 33, 33];
const DEEP = [125, 18, 18];

type Dot = { a: number; r: number; s: number; tw: number };

function makeDots(): Dot[] {
  // Seeded so the pattern is the same on every load.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dots: Dot[] = [];
  for (const ring of RINGS) {
    for (let i = 0; i < ring.n; i++) {
      if (rnd() < 0.22) continue; // gaps make it feel hand-scattered
      dots.push({
        a: (i / ring.n) * Math.PI * 2 + (rnd() - 0.5) * 0.07,
        r: ring.r + (rnd() - 0.5) * 6,
        s: 0.7 + rnd() * 0.7,
        tw: rnd() * Math.PI * 2,
      });
    }
  }
  return dots;
}

const wrap = (x: number) => ((x % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI; // → -π…π

/** Small settling bounce: up, down, a smaller hop, rest. τ in ms since the bounce started. */
function bounce(τ: number) {
  const s = τ / 1000;
  if (s > 1.4) return { y: 0, sx: 1, sy: 1 };
  const y = -8 * Math.exp(-3.4 * s) * Math.abs(Math.sin(Math.PI * 2.2 * s));
  // A touch of squash only at the moments it meets the ground.
  const squash = y > -0.6 && s > 0.1 ? 0.03 * Math.exp(-3 * s) : 0;
  return { y, sx: 1 + squash, sy: 1 - squash };
}

export function HeroRadial({ syncRef }: { syncRef?: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

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
        const diff = Math.abs(wrap(a - head));
        // Smooth falloff, so the glow fades in and out instead of popping.
        const k = Math.max(0, 1 - diff / SPREAD);
        const glow = k * k * (3 - 2 * k);
        const twinkle = 0.8 + 0.2 * Math.sin(t / 1100 + d.tw);
        const x = c + Math.cos(a) * d.r;
        const y = c + Math.sin(a) * d.r;
        const rad = d.s * (1 + glow * 0.7);
        if (glow > 0.04) {
          // Leading edge in the bright red, tail in the deep red, like the title gradient.
          const lead = wrap(a - head) > 0 ? 0 : 1;
          const mix = (lead * 0.6 + (1 - glow) * 0.4);
          const col = RED.map((v, i) => Math.round(v + (DEEP[i] - v) * mix));
          ctx.shadowColor = `rgba(${RED.join(",")},${0.35 * glow})`;
          ctx.shadowBlur = 6 * glow;
          ctx.fillStyle = `rgba(${col.join(",")},${0.22 + 0.58 * glow * twinkle})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(200,130,134,${0.26 * twinkle})`;
        }
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Logo: gentle bounce every quarter lap.
      const logo = logoRef.current;
      if (logo) {
        const b = bounce(t % BOUNCE_EVERY);
        logo.style.transform = `translate(-50%, calc(-50% + ${b.y.toFixed(2)}px)) scale(${b.sx.toFixed(3)}, ${b.sy.toFixed(3)})`;
      }

      // Title: sheen sweeps across while the glow passes the bottom of the ring.
      const title = syncRef?.current;
      if (title) {
        const p = wrap(head - Math.PI / 2) / SPREAD; // -1…1 while passing the bottom
        const pos = p < -1 ? 100 : p > 1 ? 0 : 50 - p * 50;
        title.style.setProperty("--sheen", `${pos.toFixed(1)}%`);
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
  }, [syncRef]);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }} data-testid="hero-radial">
      <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden />
      {/* Soft light behind the icon */}
      <div className="absolute left-1/2 top-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0)_70%)]" aria-hidden />
      <img
        ref={logoRef}
        src={appIcon}
        alt="Airtel app"
        className="absolute left-1/2 top-1/2 size-[96px] origin-bottom drop-shadow-[0_14px_22px_rgba(227,33,33,0.28)] will-change-transform"
        style={{ transform: "translate(-50%, -50%)" }}
        draggable={false}
        data-testid="hero-logo"
      />
    </div>
  );
}
