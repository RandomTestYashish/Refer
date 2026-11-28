import moneyJar from "@/assets/refer/money-jar.webp";
import { cn } from "@/lib/utils";

/**
 * Static hero illustration: a glass jar of notes with gold ₹ coins (from the design reference).
 * The artwork's background was removed (transparent WebP), so it sits cleanly on the cream theme.
 * Sized on the 8px grid: width is a multiple of 8, height follows the 520 × 572 artwork (≈ 1.1).
 */
export function MoneyJar({ width = 208, className }: { width?: number; className?: string }) {
  const height = Math.round((width * 572) / 520 / 8) * 8;
  return (
    <img
      src={moneyJar}
      alt="A glass jar full of ₹500 notes with gold rupee coins"
      width={width}
      height={height}
      draggable={false}
      className={cn("block select-none object-contain mix-blend-multiply", className)}
      style={{
        width,
        height,
        // Feather the bottom and side edges so the artwork's floor glow doesn't show as a band.
        WebkitMaskImage: "linear-gradient(180deg,#000 84%,transparent 100%), linear-gradient(90deg,transparent 0%,#000 7%,#000 93%,transparent 100%)",
        maskImage: "linear-gradient(180deg,#000 84%,transparent 100%), linear-gradient(90deg,transparent 0%,#000 7%,#000 93%,transparent 100%)",
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
    />
  );
}
