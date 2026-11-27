import { motion } from "framer-motion";
import airtelLogo from "@/assets/refer/airtel-logo.svg";
import { cn } from "@/lib/utils";

/**
 * The Airtel logo as a small 3D object: a front face, a back face and a stack of edge layers in between,
 * so it reads as a solid tile when it turns. Used across the Refer story.
 */
export function LogoTile({
  size = 120,
  depth = 10,
  motionMode = "sway",
  glow = true,
  className,
}: {
  size?: number;
  depth?: number;
  motionMode?: "sway" | "spin" | "still";
  glow?: boolean;
  className?: string;
}) {
  const layers = Math.max(3, Math.round(depth / 1.5));
  const r = size * 0.27;
  const rotate =
    motionMode === "spin"
      ? { rotateY: [0, 360] }
      : motionMode === "sway"
        ? { rotateY: [-24, 24], rotateX: [8, -6] }
        : {};
  const rotateT =
    motionMode === "spin"
      ? { duration: 7, ease: "linear" as const, repeat: Infinity }
      : { duration: 5, ease: "easeInOut" as const, repeat: Infinity, repeatType: "mirror" as const };

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size, perspective: size * 7 }}>
      {glow && (
        <div
          className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(253,47,54,0.55)_0%,rgba(202,38,43,0.18)_45%,transparent_70%)] blur-xl"
          style={{ width: size * 1.9, height: size * 1.9 }}
          aria-hidden
        />
      )}
      <motion.div className="relative size-full" style={{ transformStyle: "preserve-3d" }} animate={rotate} transition={rotateT}>
        {/* Edge: stacked layers between the faces */}
        {Array.from({ length: layers }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              borderRadius: r,
              background: `linear-gradient(180deg, #B3242A 0%, #6E1216 100%)`,
              transform: `translateZ(${-(i + 1) * (depth / (layers + 1))}px)`,
            }}
          />
        ))}
        {/* Back face */}
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: r, transform: `translateZ(${-depth}px) rotateY(180deg)`, backfaceVisibility: "hidden" }}>
          <img src={airtelLogo} alt="" className="size-full" draggable={false} />
        </div>
        {/* Front face */}
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: r, backfaceVisibility: "hidden" }}>
          <img src={airtelLogo} alt="Airtel" className="size-full" draggable={false} />
          {/* Bevel + gloss */}
          <div className="pointer-events-none absolute inset-0" style={{ borderRadius: r, boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 6px rgba(80,0,0,0.45)" }} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0)_42%)]" />
          {/* Travelling shine */}
          <motion.div
            className="pointer-events-none absolute -inset-y-4 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]"
            initial={{ x: "-160%", rotate: 18 }}
            animate={{ x: ["-160%", "260%"] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
