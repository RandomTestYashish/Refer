import * as React from "react";
import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Metallic coin art (inline SVG) used by the Refer & Earn hero and the milestone badges.
 * One drawing in five metals so every coin on the page shares the same look.
 */

export type Metal = "gold" | "silver" | "bronze" | "ruby" | "locked";

const METAL: Record<Metal, { hi: string; mid: string; lo: string; rim: string; emboss: string }> = {
  gold: { hi: "#FFF3BF", mid: "#F5C64F", lo: "#B97A12", rim: "#D79A1E", emboss: "#A86A08" },
  silver: { hi: "#FFFFFF", mid: "#D9DFE7", lo: "#8C96A4", rim: "#AEB7C3", emboss: "#7B8592" },
  bronze: { hi: "#FFD8B5", mid: "#DD9157", lo: "#8A4A1C", rim: "#B86A33", emboss: "#7E4019" },
  ruby: { hi: "#FFB3B8", mid: "#E8414E", lo: "#8C0F1A", rim: "#C3202D", emboss: "#7E0A14" },
  locked: { hi: "#FAFAFA", mid: "#E2E4E8", lo: "#AEB2B9", rim: "#C9CCD2", emboss: "#9EA2A9" },
};

/** Front face of a coin. `children` is drawn embossed in the centre (viewBox 0–100). */
export function CoinFace({
  size = 64,
  metal = "gold",
  glyph = "₹",
  glyphColor,
  shine = true,
  className,
  children,
}: {
  size?: number;
  metal?: Metal;
  glyph?: string | null;
  glyphColor?: "red" | "emboss";
  shine?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const id = useId().replace(/:/g, "");
  const m = METAL[metal];
  const red = glyphColor === "red";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn("block shrink-0 overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`rim${id}`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor={m.hi} />
          <stop offset="0.45" stopColor={m.mid} />
          <stop offset="1" stopColor={m.lo} />
        </linearGradient>
        <radialGradient id={`face${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={m.hi} />
          <stop offset="0.55" stopColor={m.mid} />
          <stop offset="1" stopColor={m.rim} />
        </radialGradient>
        <linearGradient id={`glyph${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={red ? "#E0262F" : m.emboss} />
          <stop offset="1" stopColor={red ? "#8E0B12" : m.lo} />
        </linearGradient>
        <clipPath id={`clip${id}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      {/* drop shadow */}
      <ellipse cx="50" cy="96" rx="34" ry="5" fill="rgba(120,60,0,0.18)" />
      {/* rim + bevel */}
      <circle cx="50" cy="50" r="48" fill={`url(#rim${id})`} />
      <circle cx="50" cy="50" r="40.5" fill={`url(#face${id})`} stroke={m.lo} strokeOpacity="0.45" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="36.5" fill="none" stroke={m.hi} strokeOpacity="0.55" strokeWidth="1" />
      {/* emboss */}
      {glyph && (
        <>
          <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight="800" fontSize="46" fill={m.hi} opacity="0.6">
            {glyph}
          </text>
          <text x="50" y="51.5" textAnchor="middle" dominantBaseline="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight="800" fontSize="46" fill={`url(#glyph${id})`}>
            {glyph}
          </text>
        </>
      )}
      {children}
      {/* specular highlight */}
      <ellipse cx="34" cy="26" rx="16" ry="8" fill="#FFFFFF" opacity="0.35" transform="rotate(-30 34 26)" />
      {shine && (
        <g clipPath={`url(#clip${id})`}>
          <rect x="-40" y="-10" width="18" height="130" fill="#FFFFFF" opacity="0.45" transform="rotate(20 50 50)">
            <animate attributeName="x" values="-40;140;140" keyTimes="0;0.45;1" dur="3.6s" repeatCount="indefinite" />
          </rect>
        </g>
      )}
    </svg>
  );
}

/** A coin lying flat (seen at an angle): face ellipse + edge thickness. */
export function CoinFlat({ width = 90, metal = "gold", className }: { width?: number; metal?: Metal; className?: string }) {
  const id = useId().replace(/:/g, "");
  const m = METAL[metal];
  const h = width * 0.42;
  return (
    <svg viewBox="0 0 100 42" width={width} height={h} className={cn("block overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`edge${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={m.lo} />
          <stop offset="0.35" stopColor={m.mid} />
          <stop offset="0.7" stopColor={m.rim} />
          <stop offset="1" stopColor={m.lo} />
        </linearGradient>
        <radialGradient id={`top${id}`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor={m.hi} />
          <stop offset="1" stopColor={m.mid} />
        </radialGradient>
      </defs>
      <path d="M2 16 v10 a48 15 0 0 0 96 0 v-10 z" fill={`url(#edge${id})`} />
      <ellipse cx="50" cy="16" rx="48" ry="15" fill={`url(#top${id})`} stroke={m.rim} strokeWidth="1" />
      <ellipse cx="50" cy="16" rx="38" ry="11" fill="none" stroke={m.lo} strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}

/** Hero coin stack: three flat coins, two leaning coins and a big front ₹ coin that drop in and bounce. */
export function CoinStack({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const drop = (delay: number, from = -220) =>
    reduce
      ? {}
      : {
          initial: { y: from, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay, type: "spring" as const, stiffness: 260, damping: 13, mass: 0.9 },
        };
  return (
    <div className={cn("relative h-[132px] w-[236px]", className)} aria-hidden>
      {/* floor glow */}
      <div className="absolute bottom-[-6px] left-1/2 h-6 w-[220px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(186,112,30,0.28),transparent_70%)]" />
      {/* base stack */}
      <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2" {...drop(0.15, -120)}>
        <CoinFlat width={120} />
      </motion.div>
      <motion.div className="absolute bottom-[9px] left-1/2 ml-[-58px]" {...drop(0.3, -140)}>
        <CoinFlat width={110} />
      </motion.div>
      {/* leaning side coins */}
      <motion.div className="absolute bottom-[6px] left-0" style={{ rotate: -14 }} {...drop(0.45)}>
        <div style={{ transform: "scaleX(0.82) skewY(6deg)" }}>
          <CoinFace size={78} glyph={null} shine={false} />
        </div>
      </motion.div>
      <motion.div className="absolute bottom-[6px] right-0" style={{ rotate: 14 }} {...drop(0.55)}>
        <div style={{ transform: "scaleX(0.82) skewY(-6deg)" }}>
          <CoinFace size={78} glyph={null} shine={false} />
        </div>
      </motion.div>
      {/* hero coin */}
      <motion.div
        className="absolute bottom-[10px] left-1/2 -ml-[56px]"
        {...(reduce
          ? {}
          : {
              initial: { y: -260, rotateY: 540, opacity: 0 },
              animate: { y: 0, rotateY: 0, opacity: 1 },
              transition: { delay: 0.7, type: "spring" as const, stiffness: 200, damping: 12 },
            })}
        style={{ transformPerspective: 600 }}
      >
        <motion.div animate={reduce ? {} : { y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
          <CoinFace size={112} glyph="₹" glyphColor="red" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Gentle shower of small coins falling through the banner (skipped for reduced motion). */
export function FallingCoins({ count = 7, height = 460 }: { count?: number; height?: number }) {
  const reduce = useReducedMotion();
  const coins = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: 6 + ((i * 97) % 88),
        size: 14 + ((i * 7) % 12),
        delay: 1.6 + i * 0.9,
        dur: 4.2 + ((i * 3) % 5) * 0.5,
        flat: i % 3 === 0,
        drift: (i % 2 ? 1 : -1) * (10 + (i % 4) * 6),
      })),
    [count],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {coins.map((c, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{ left: `${c.left}%` }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: [-40, height], x: [0, c.drift], opacity: [0, 0.9, 0.9, 0], rotate: [0, 160 * (i % 2 ? 1 : -1)] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, repeatDelay: 2.5 + (i % 3), ease: "easeIn", times: [0, 1] }}
        >
          <div style={{ transform: c.flat ? "scaleY(0.45)" : undefined }}>
            <CoinFace size={c.size} glyph="₹" shine={false} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Four-point sparkle. */
export function Sparkle({ size = 12, className, delay = 0, color = "#C9892B" }: { size?: number; className?: string; delay?: number; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("pointer-events-none absolute", className)}
      animate={reduce ? {} : { opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
      transition={{ duration: 2.4, repeat: Infinity, delay }}
      aria-hidden
    >
      <path d="M12 0c.9 6.4 5.6 11.1 12 12-6.4.9-11.1 5.6-12 12-.9-6.4-5.6-11.1-12-12C6.4 11.1 11.1 6.4 12 0z" fill={color} />
    </motion.svg>
  );
}
