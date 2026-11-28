import { useMemo } from "react";
import airtelLogo from "@/assets/refer/airtel-logo.svg";
import { cn } from "@/lib/utils";

/**
 * "The Airtel family": the same Airtel logo repeated small, many times, around an empty centre.
 * Logos shrink and fade with distance, and a soft wave runs from the edges towards the centre,
 * so the eye is drawn to the one large logo placed on top.
 */
export function LogoFamily({
  width,
  height,
  cx = width / 2,
  cy = height / 2,
  gap = 34,
  icon = 18,
  hole = 70,
  tone = "light",
  strength,
  below = 1,
  className,
}: {
  width: number;
  height: number;
  /** Focus point (centre of the large logo). */
  cx?: number;
  cy?: number;
  /** Distance between neighbouring logos. */
  gap?: number;
  /** Size of the logos nearest the centre. */
  icon?: number;
  /** Radius around the focus left empty for the large logo. */
  hole?: number;
  tone?: "light" | "dark";
  /** Opacity of the logos nearest the centre. */
  strength?: number;
  /** Below the focus, distances are multiplied by this (under 1 stretches the empty area down, e.g. to clear a label). */
  below?: number;
  className?: string;
}) {
  const items = useMemo(() => {
    const out: { x: number; y: number; s: number; o: number; d: number }[] = [];
    const rowH = gap * 0.866;
    const maxD = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
    const rows = Math.ceil(height / rowH) + 2;
    const cols = Math.ceil(width / gap) + 2;
    for (let r = -rows; r <= rows; r++) {
      for (let c = -cols; c <= cols; c++) {
        const x = cx + c * gap + (r % 2 ? gap / 2 : 0);
        const y = cy + r * rowH;
        if (x < -icon || x > width + icon || y < -icon || y > height + icon) continue;
        const d = Math.hypot(x - cx, y > cy ? (y - cy) * below : y - cy);
        if (d < hole) continue;
        const t = Math.min(1, (d - hole) / (maxD - hole)); // 0 near the logo → 1 at the far edge
        out.push({ x, y, s: icon * (1 - t * 0.45), o: (strength ?? (tone === "dark" ? 0.55 : 0.4)) * (1 - t) ** 1.3 + 0.03, d: t });
      }
    }
    return out;
  }, [width, height, cx, cy, gap, icon, hole, tone, strength, below]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden data-testid="logo-family">
      {items.map((p, k) => (
        <img
          key={k}
          src={airtelLogo}
          alt=""
          draggable={false}
          className="logo-family-item absolute"
          style={
            {
              left: p.x - p.s / 2,
              top: p.y - p.s / 2,
              width: p.s,
              height: p.s,
              borderRadius: p.s * 0.27,
              opacity: p.o,
              filter: tone === "dark" ? undefined : "saturate(0.85)",
              "--o": p.o,
              // Appear from the centre outwards, then a wave travels from the edges back to the centre.
              animationDelay: `${(p.d * 0.7).toFixed(2)}s, ${(1 + (1 - p.d) * 1.8).toFixed(2)}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
