import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A soft-gold ₹ coin with real thickness (stacked edge layers) and a passing shine.
 * Used wherever the copy talks about money: the yearly prize, per-friend rewards, the home banner.
 */
export function RupeeCoin({ size = 56, spin = false, className }: { size?: number; spin?: boolean; className?: string }) {
  const depth = Math.max(3, Math.round(size / 9));
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size, perspective: size * 8 }}>
      <motion.div
        className="relative size-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={spin ? { rotateY: [0, 360] } : { rotateY: [-18, 18] }}
        transition={spin ? { duration: 6, ease: "linear", repeat: Infinity } : { duration: 4.5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      >
        {Array.from({ length: depth }, (_, i) => (
          <div key={i} className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(180deg,#E7B04A,#B9801F)", transform: `translateZ(${-(i + 1)}px)` }} />
        ))}
        {[0, 180].map((r) => (
          <div
            key={r}
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
            style={{
              transform: r ? `translateZ(${-depth - 1}px) rotateY(180deg)` : undefined,
              backfaceVisibility: "hidden",
              background: "radial-gradient(circle at 35% 30%, #FFF6D8 0%, #FFE08A 38%, #F3C14F 70%, #D99A2B 100%)",
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(150,90,10,0.35)",
            }}
          >
            <span className="absolute rounded-full border border-[#C98A22]/40" style={{ inset: size * 0.1 }} />
            <span className="relative font-bold text-[#A86A12] [text-shadow:0_1px_0_rgba(255,255,255,0.7)]" style={{ fontSize: size * 0.48, lineHeight: 1 }}>
              ₹
            </span>
            <motion.span
              className="pointer-events-none absolute -inset-y-2 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]"
              initial={{ x: "-170%", rotate: 20 }}
              animate={{ x: ["-170%", "270%"] }}
              transition={{ duration: 1.3, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6 }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
