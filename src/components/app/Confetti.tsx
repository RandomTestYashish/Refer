import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/** Subtle, short celebration burst — used only at meaningful success moments. */
export function Confetti({ count = 26, originY = "38%" }: { count?: number; originY?: string }) {
  const reduce = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 90 + Math.random() * 90;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40,
          rot: Math.random() * 360,
          color: ["#292C31", "#8E9AA9", "#86A48D", "#CDD3DD", "#55585E"][i % 5],
          w: 5 + Math.random() * 4,
          h: 8 + Math.random() * 6,
          delay: Math.random() * 0.12,
        };
      }),
    [count],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: originY }} aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 rounded-[2px]"
          style={{ width: b.w, height: b.h, background: b.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 160], opacity: [1, 1, 0], rotate: b.rot, scale: 1 }}
          transition={{ duration: 1.6, delay: b.delay, ease: [0.2, 0.7, 0.4, 1] }}
        />
      ))}
    </div>
  );
}
