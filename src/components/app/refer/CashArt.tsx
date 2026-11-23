import { useId } from "react";
import type { Milestone } from "@/config/businessRules";
import { cn } from "@/lib/utils";

/** Generic currency art for the neutral theme: stylised notes, not a reproduction of any real banknote. */
const INK = "#3F5A48";
const FACE_A = "#B7CBBB";
const FACE_B = "#86A48D";
const PAPER = "#F1F4EF";
const EDGE = "#9CB4A2";

const uid = (id: string) => id.replace(/:/g, "");

function NoteFace({ fill }: { fill: string }) {
  return (
    <g>
      <rect width="120" height="64" rx="3" fill={fill} />
      <rect x="4" y="4" width="112" height="56" rx="2" fill="none" stroke={INK} strokeOpacity=".45" strokeWidth=".9" />
      <circle cx="60" cy="32" r="17" fill={PAPER} fillOpacity=".55" stroke={INK} strokeOpacity=".55" strokeWidth=".9" />
      <text x="60" y="39.5" textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif" fill={INK}>
        ₹
      </text>
      <circle cx="19" cy="32" r="7" fill="none" stroke={INK} strokeOpacity=".4" strokeWidth=".9" />
      <circle cx="101" cy="32" r="7" fill="none" stroke={INK} strokeOpacity=".4" strokeWidth=".9" />
      <path d="M10 12h22M10 16h14M88 52h22M96 48h14" stroke={INK} strokeOpacity=".4" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}

/** A banded bundle of notes drawn in simple isometric perspective. */
function Bundle({ x = 0, y = 0, fill }: { x?: number; y?: number; fill: string }) {
  const A = [8, 48];
  const U = [110 / 120, -34 / 120];
  const V = [74 / 64, 38 / 64];
  const T = 26;
  const P = (a: number, b: number, drop = 0) => `${A[0] + a * U[0] + b * V[0]},${A[1] + a * U[1] + b * V[1] + drop}`;
  const strata = Array.from({ length: 6 }, (_, i) => 4 + i * 4);
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={`${P(0, 0)} ${P(0, 64)} ${P(0, 64, T)} ${P(0, 0, T)}`} fill={PAPER} />
      <polygon points={`${P(0, 64)} ${P(120, 64)} ${P(120, 64, T)} ${P(0, 64, T)}`} fill="#E3E9E1" />
      {strata.map((d) => (
        <g key={d} stroke={EDGE} strokeWidth="1">
          <line x1={P(0, 0, d).split(",")[0]} y1={P(0, 0, d).split(",")[1]} x2={P(0, 64, d).split(",")[0]} y2={P(0, 64, d).split(",")[1]} />
          <line x1={P(0, 64, d).split(",")[0]} y1={P(0, 64, d).split(",")[1]} x2={P(120, 64, d).split(",")[0]} y2={P(120, 64, d).split(",")[1]} />
        </g>
      ))}
      <g transform={`matrix(${U[0]} ${U[1]} ${V[0]} ${V[1]} ${A[0]} ${A[1]})`}>
        <NoteFace fill={fill} />
      </g>
      <polygon points={`${P(26, 0)} ${P(38, 0)} ${P(38, 64)} ${P(26, 64)}`} fill="#F6F3EA" />
      <polygon points={`${P(26, 64)} ${P(38, 64)} ${P(38, 64, T)} ${P(26, 64, T)}`} fill="#DDD8CB" />
      <polyline points={`${P(26, 0)} ${P(26, 64)} ${P(26, 64, T)}`} fill="none" stroke="#BDB7A8" strokeWidth=".8" />
      <polyline points={`${P(38, 0)} ${P(38, 64)} ${P(38, 64, T)}`} fill="none" stroke="#BDB7A8" strokeWidth=".8" />
    </g>
  );
}

/** Stack of banded note bundles: the hero illustration. */
export function CashBundle({ className }: { className?: string }) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 300 196" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={FACE_A} />
          <stop offset="1" stopColor={FACE_B} />
        </linearGradient>
        <radialGradient id={`${id}s`}>
          <stop stopColor="#1F2124" stopOpacity=".26" />
          <stop offset="1" stopColor="#1F2124" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="166" rx="136" ry="26" fill={`url(#${id}s)`} />
      <Bundle x={100} y={40} fill={`url(#${id}f)`} />
      <Bundle x={8} y={52} fill={`url(#${id}f)`} />
      <Bundle x={62} y={72} fill={`url(#${id}f)`} />
      <Bundle x={54} y={18} fill={`url(#${id}f)`} />
    </svg>
  );
}

/** A single flat note, for small slots and floating background details. */
export function NoteIcon({ className }: { className?: string }) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 124 68" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={FACE_A} />
          <stop offset="1" stopColor={FACE_B} />
        </linearGradient>
      </defs>
      <g transform="translate(2 2)">
        <NoteFace fill={`url(#${id}f)`} />
      </g>
    </svg>
  );
}

function Fan({ fill }: { fill: string }) {
  return (
    <g>
      {[-24, -8, 8, 24].map((r, i) => (
        <g key={r} transform={`translate(66 92) rotate(${r}) translate(-60 -74)`}>
          <rect x="-1" y="-1" width="122" height="66" rx="4" fill="#1F2124" fillOpacity={i === 3 ? 0.06 : 0.1} />
          <NoteFace fill={fill} />
        </g>
      ))}
    </g>
  );
}

/** How it works, step 1: an envelope carrying a note. */
export function ShareArt({ className }: { className?: string }) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 132 120" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={FACE_A} />
          <stop offset="1" stopColor={FACE_B} />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#5A5D63" />
          <stop offset="1" stopColor="#2F3136" />
        </linearGradient>
      </defs>
      <ellipse cx="66" cy="112" rx="54" ry="6" fill="#1F2124" fillOpacity=".14" />
      <path d="M10 50 66 14l56 36v8H10z" fill="#3A3D42" />
      <g transform="translate(6 12) rotate(-6 60 32)">
        <NoteFace fill={`url(#${id}f)`} />
      </g>
      <path d="M10 50l56 34 56-34v50a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z" fill={`url(#${id}e)`} />
      <path d="M10 106l44-32M122 106 78 74" stroke="#FFF" strokeOpacity=".14" strokeWidth="1.5" />
      <path d="M10 50l56 34 56-34" fill="none" stroke="#FFF" strokeOpacity=".22" strokeWidth="1.5" />
    </svg>
  );
}

/** How it works, step 2: a phone confirming the recharge. */
export function RechargeArt({ className }: { className?: string }) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 132 120" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={FACE_A} />
          <stop offset="1" stopColor={FACE_B} />
        </linearGradient>
      </defs>
      <ellipse cx="62" cy="113" rx="46" ry="5" fill="#1F2124" fillOpacity=".14" />
      <g transform="translate(72 58) rotate(14) scale(.46) translate(-60 -32)">
        <NoteFace fill={`url(#${id}f)`} />
      </g>
      <g transform="rotate(-7 50 60)">
        <rect x="22" y="4" width="58" height="108" rx="11" fill="#2F3136" />
        <rect x="26" y="8" width="50" height="100" rx="8" fill="#F7F7F5" />
        <rect x="42" y="12" width="18" height="4" rx="2" fill="#2F3136" />
        <circle cx="51" cy="56" r="16" fill="#3E7A52" />
        <path d="m44 56 5 5 10-11" fill="none" stroke="#FFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="36" y="82" width="30" height="4" rx="2" fill="#D4D5D6" />
        <rect x="40" y="90" width="22" height="3" rx="1.500" fill="#E6E9EF" />
      </g>
      <g transform="translate(100 78) rotate(10) scale(.5) translate(-60 -32)">
        <rect x="-1" y="-1" width="122" height="66" rx="4" fill="#1F2124" fillOpacity=".12" />
        <NoteFace fill={`url(#${id}f)`} />
      </g>
    </svg>
  );
}

/** How it works, step 3: a fan of notes. */
export function EarnArt({ className }: { className?: string }) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 132 120" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={FACE_A} />
          <stop offset="1" stopColor={FACE_B} />
        </linearGradient>
      </defs>
      <ellipse cx="66" cy="112" rx="42" ry="5" fill="#1F2124" fillOpacity=".14" />
      <g transform="translate(0 16) scale(.98)">
        <Fan fill={`url(#${id}f)`} />
      </g>
    </svg>
  );
}

const TIER: Record<string, [string, string]> = {
  first: ["#6B6E75", "#2F3136"],
  bronze: ["#C2A68C", "#8A6C53"],
  silver: ["#DDDFE3", "#9A9EA6"],
  gold: ["#DCCB9B", "#A68F55"],
};

/** Milestone level badge: a neutral metal rosette with a star. */
export function TierBadge({ m, className }: { m: Milestone; className?: string }) {
  const id = uid(useId());
  const [a, b] = TIER[m.id] ?? TIER.first;
  return (
    <svg viewBox="0 0 48 48" className={cn("block", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id}t)`}
        d="M24 2l5 3.500 6-.9 2.900 5.300 5.400 2.600-.8 6L46 24l-3.500 5.500.8 6-5.400 2.600L35 43.400l-6-.9L24 46l-5-3.500-6 .9-2.900-5.300-5.400-2.600.8-6L2 24l3.500-5.500-.8-6 5.400-2.600L13 4.600l6 .9z"
      />
      <circle cx="24" cy="24" r="14" fill="#FFF" fillOpacity=".24" stroke="#FFF" strokeOpacity=".55" />
      <path d="m24 15 2.800 5.700 6.200.9-4.500 4.400 1.100 6.200L24 29.300l-5.600 2.900 1.100-6.200-4.500-4.400 6.200-.9z" fill="#FFF" fillOpacity=".95" />
    </svg>
  );
}
