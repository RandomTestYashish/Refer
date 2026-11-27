import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import appIcon from "@/assets/refer/airtel-app-icon.png";

/**
 * Hero for the Refer screen.
 * A large ring of scattered dots is centred on the Airtel app icon. It is wider than the screen and runs
 * up behind the header, so only part of it is visible; the lower part fades out before the title.
 * One clock drives every movement so they stay in sync:
 *  - a soft glow drifts round the ring (one lap = LAP_MS) in the title reds,
 *  - every BEAT the icon does a small settling bounce, a shine crosses the icon, then the title amount.
 *  - the light behind the icon breathes with the same beat.
 */
export const HERO_TOP = 72; // header height; the hero starts under the overlaid header
const ICON = 112;
const ICON_CY = 84; // icon centre, measured from the bottom of the header
const HERO_H = ICON_CY + ICON / 2 + 30; // space below the icon before the title
const CANVAS_H = HERO_TOP + HERO_H + 40;
const R_MIN = 92;
const R_MAX = 268;
const R_STEP = 11;
const LAP_MS = 24000;
const SPIN_MS = 160000;
const BEAT = 6000;
const SPREAD = 1.0;

// Title colours (₹5,000): #E32121 → #7D1212
const RED = [227, 33, 33];
const DEEP = [125, 18, 18];

type Dot = { a: number; r: number; s: number; tw: number };

function makeDots(): Dot[] {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dots: Dot[] = [];
  for (let r = R_MIN; r <= R_MAX; r += R_STEP) {
    const n = Math.round(r * 0.5);
    for (let i = 0; i < n; i++) {
      if (rnd() < 0.3) continue;
      dots.push({
        a: (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.06,
        r: r + (rnd() - 0.5) * 6,
        // Dots get a little smaller towards the outside.
        s: (0.6 + rnd() * 0.7) * (1.15 - (r - R_MIN) / (R_MAX - R_MIN) * 0.35),
        tw: rnd() * Math.PI * 2,
      });
    }
  }
  return dots;
}

const wrap = (x: number) => ((x % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI; // → -π…π
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
/** Ease-in-out progress of a window [a, b] inside the beat, 0…1 (clamped). */
const win = (τ: number, a: number, b: number) => smooth(a, b, τ);

/** Small settling bounce. τ in ms since the beat started. */
function bounce(τ: number) {
  const s = τ / 1000;
  if (s > 1.4) return { y: 0, sx: 1, sy: 1 };
  const y = -9 * Math.exp(-3.4 * s) * Math.abs(Math.sin(Math.PI * 2.2 * s));
  const squash = y > -0.6 && s > 0.1 ? 0.035 * Math.exp(-3 * s) : 0;
  return { y, sx: 1 + squash, sy: 1 - squash };
}

export function HeroRadial({ syncRef }: { syncRef?: RefObject<HTMLElement | null> }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(375);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = width * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dots = makeDots();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cx = width / 2;
    const cy = HERO_TOP + ICON_CY;
    let raf = 0;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, CANVAS_H);
      const spin = (t / SPIN_MS) * Math.PI * 2;
      const head = Math.PI + (t / LAP_MS) * Math.PI * 2; // starts on the left, like the reference
      for (const d of dots) {
        const a = d.a + spin;
        const x = cx + Math.cos(a) * d.r;
        const y = cy + Math.sin(a) * d.r;
        if (x < -4 || x > width + 4 || y < -4) continue;
        // Fade the lower part out before the title.
        // Keep it quiet behind the header title too.
        const fade = (1 - smooth(cy + 40, cy + 150, y)) * (0.45 + 0.55 * smooth(HERO_TOP - 30, HERO_TOP + 10, y));
        if (fade <= 0.01) continue;
        const rel = wrap(a - head);
        const k = Math.max(0, 1 - Math.abs(rel) / SPREAD);
        const glow = k * k * (3 - 2 * k);
        const twinkle = 0.78 + 0.22 * Math.sin(t / 1200 + d.tw);
        let fill: string;
        if (glow > 0.04) {
          const mix = (rel > 0 ? 0 : 0.6) + (1 - glow) * 0.4;
          const col = RED.map((v, i) => Math.round(v + (DEEP[i] - v) * mix));
          fill = `rgba(${col.join(",")},${(0.2 + 0.6 * glow * twinkle) * fade})`;
        } else {
          fill = `rgba(205,140,144,${0.36 * twinkle * fade})`;
        }
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, d.s * (1 + glow * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }

      const τ = t % BEAT;
      // Icon: bounce, then a shine sweeps across it.
      const logo = logoRef.current;
      if (logo) {
        const b = bounce(τ);
        logo.style.transform = `translateY(${b.y.toFixed(2)}px) scale(${b.sx.toFixed(3)}, ${b.sy.toFixed(3)})`;
      }
      const shine = shineRef.current;
      if (shine) {
        const p = win(τ, 550, 1450);
        shine.style.transform = `translateX(${(-130 + p * 260).toFixed(1)}%) rotate(20deg)`;
        shine.style.opacity = p > 0 && p < 1 ? "1" : "0";
      }
      // Light behind the icon breathes with the beat (brightest just after the bounce).
      const halo = haloRef.current;
      if (halo) {
        const breath = 0.5 + 0.5 * Math.cos(((τ - 700) / BEAT) * Math.PI * 2);
        halo.style.opacity = (0.45 + 0.4 * breath).toFixed(3);
        halo.style.transform = `translate(-50%, -50%) scale(${(0.92 + 0.12 * breath).toFixed(3)})`;
      }
      // Title amount: the shine continues onto ₹5,000 right after the icon.
      const title = syncRef?.current;
      if (title) {
        const p = win(τ, 1150, 2300);
        title.style.setProperty("--sheen", `${(100 - p * 100).toFixed(1)}%`);
      }
    };

    if (still) {
      draw(BEAT - 1);
      return;
    }
    const start = performance.now();
    const loop = (now: number) => {
      draw(now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [width, syncRef]);

  return (
    <div ref={boxRef} className="relative" style={{ height: HERO_TOP + HERO_H }} data-testid="hero-radial">
      <canvas ref={ref} className="pointer-events-none absolute left-0 top-0" style={{ width, height: CANVAS_H }} aria-hidden />
      {/* Light behind the icon */}
      <div
        ref={haloRef}
        className="pointer-events-none absolute left-1/2 size-[230px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,236,236,0.85)_32%,rgba(255,220,220,0)_70%)]"
        style={{ top: HERO_TOP + ICON_CY, transform: "translate(-50%, -50%)" }}
        aria-hidden
      />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: HERO_TOP + ICON_CY - ICON / 2, width: ICON, height: ICON }}>
        {/* Ground shadow that tightens as the icon lands */}
        <div className="absolute inset-x-4 -bottom-3 h-5 rounded-[50%] bg-[rgba(227,33,33,0.22)] blur-[10px]" aria-hidden />
        <div ref={logoRef} className="relative size-full origin-bottom will-change-transform">
          <img src={appIcon} alt="Airtel app" className="size-full drop-shadow-[0_16px_24px_rgba(227,33,33,0.3)]" draggable={false} data-testid="hero-logo" />
          {/* Shine, clipped to the icon's own shape */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ WebkitMaskImage: `url(${appIcon})`, maskImage: `url(${appIcon})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
            aria-hidden
          >
            <div
              ref={shineRef}
              className="absolute -inset-y-6 left-0 w-[55%] opacity-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_50%,rgba(255,255,255,0)_100%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
