import * as React from "react";
import { useId } from "react";
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
          <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="46" fill={m.hi} opacity="0.6">
            {glyph}
          </text>
          <text x="50" y="51.5" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="46" fill={`url(#glyph${id})`}>
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
