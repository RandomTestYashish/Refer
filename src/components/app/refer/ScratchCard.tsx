import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Hand } from "lucide-react";
import { RewardCoin } from "@/components/app/primitives";
import { track } from "@/lib/analytics";
import { inr } from "@/lib/utils";

const KEY = "refer:scratched";
const BRUSH = 30;
const REVEAL_AT = 0.42;

function wasScratched() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function markScratched() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* storage unavailable: the card can simply be scratched again */
  }
}

// Coins that burst out of the card on reveal.
const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 + 0.3;
  const r = 110 + (i % 3) * 30;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7 - 30, s: 22 + (i % 3) * 7, rot: (i % 2 ? 1 : -1) * (120 + i * 20) };
});

/**
 * Scratch card: a red foil the user rubs off with a finger to reveal the yearly earning potential.
 * Keyboard / screen-reader users reveal it with Enter or Space. Revealed state lasts for the session.
 */
export function ScratchCard({ amount, perFriend }: { amount: number; perFriend: number }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(wasScratched);
  const [started, setStarted] = useState(false);
  const [burst, setBurst] = useState(false);

  // Paint the foil.
  useEffect(() => {
    if (revealed) return;
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = w.getBoundingClientRect();
    c.width = width * dpr;
    c.height = height * dpr;
    const x = c.getContext("2d");
    if (!x) return;
    x.scale(dpr, dpr);
    const g = x.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#F0262E");
    g.addColorStop(0.55, "#D2050F");
    g.addColorStop(1, "#A9000B");
    x.fillStyle = g;
    x.fillRect(0, 0, width, height);
    // subtle ₹ pattern on the foil
    x.fillStyle = "rgba(255,255,255,0.08)";
    x.font = "700 18px Inter, system-ui, sans-serif";
    for (let yy = 18; yy < height + 18; yy += 30)
      for (let xx = (yy / 30) % 2 ? 8 : 24; xx < width; xx += 34) x.fillText("₹", xx, yy);
    // foil sheen
    const s = x.createLinearGradient(0, 0, width, 0);
    s.addColorStop(0.2, "rgba(255,255,255,0)");
    s.addColorStop(0.5, "rgba(255,255,255,0.16)");
    s.addColorStop(0.8, "rgba(255,255,255,0)");
    x.fillStyle = s;
    x.fillRect(0, 0, width, height);
  }, [revealed]);

  const reveal = useCallback(
    (how: "scratch" | "keyboard") => {
      if (revealed) return;
      setRevealed(true);
      markScratched();
      track("hero_scratch_revealed", { how });
      if (!reduce) {
        setBurst(true);
        setTimeout(() => setBurst(false), 1400);
        try {
          navigator.vibrate?.(30);
        } catch {
          /* not supported */
        }
      }
    },
    [revealed, reduce],
  );

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const scratch = (p: { x: number; y: number }) => {
    const x = canvas.current?.getContext("2d");
    if (!x) return;
    x.globalCompositeOperation = "destination-out";
    x.lineCap = "round";
    x.lineJoin = "round";
    x.lineWidth = BRUSH;
    x.beginPath();
    const from = last.current ?? p;
    x.moveTo(from.x, from.y);
    x.lineTo(p.x + 0.01, p.y);
    x.stroke();
    last.current = p;
    if (++moves.current % 8 === 0) checkCleared();
  };
  const checkCleared = () => {
    const c = canvas.current;
    const x = c?.getContext("2d");
    if (!c || !x) return;
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let n = 0;
    for (let i = 3; i < d.length; i += 4 * 24) {
      n++;
      if (d[i] === 0) clear++;
    }
    if (clear / n > REVEAL_AT) reveal("scratch");
  };

  return (
    <div className="relative mx-auto w-[310px]">
      <div
        ref={wrap}
        className="relative h-[116px] overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#FFE7A3_0%,#FFD066_45%,#F2AE2E_100%)] shadow-[0_14px_30px_rgba(169,0,11,0.22)]"
      >
        {/* prize */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[12px] font-semibold text-[#6B4300]">You can earn up to</p>
          <motion.p
            className="amount-shine -mr-2 px-2 text-[46px] font-extrabold italic leading-[52px] tracking-[-1.8px] tabular-nums"
            id="hero-amount"
            initial={false}
            animate={revealed && !reduce ? { scale: [0.7, 1.08, 1, 1, 1.04, 1] } : { scale: 1 }}
            transition={revealed && !reduce ? { duration: 4.4, times: [0, 0.1, 0.2, 0.7, 0.85, 1], repeat: Infinity, repeatDelay: 0.4 } : {}}
          >
            {inr(amount)}
          </motion.p>
          <p className="text-[12px] font-semibold text-[#6B4300]">every year · {inr(perFriend)} per friend</p>
        </div>

        {/* foil */}
        <AnimatePresence>
          {!revealed && (
            <motion.div className="absolute inset-0" exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.35 }}>
              <canvas
                ref={canvas}
                className="absolute inset-0 size-full cursor-grab touch-none"
                tabIndex={0}
                role="button"
                aria-label="Scratch card. Press Enter to reveal how much you can earn."
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    reveal("keyboard");
                  }
                }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  drawing.current = true;
                  last.current = null;
                  if (!started) {
                    setStarted(true);
                    track("hero_scratch_started");
                  }
                  scratch(pos(e));
                }}
                onPointerMove={(e) => drawing.current && scratch(pos(e))}
                onPointerUp={() => {
                  drawing.current = false;
                  last.current = null;
                  checkCleared();
                }}
                onPointerCancel={() => (drawing.current = false)}
              />
              <AnimatePresence>
                {!started && (
                  <motion.div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white" exit={{ opacity: 0 }}>
                    <p className="text-[17px] font-extrabold tracking-[-0.2px]">Scratch to see what you can earn</p>
                    <p className="mt-0.5 text-[12px] font-medium text-white/75">Rub the card with your finger</p>
                    {!reduce && (
                      <motion.span
                        className="absolute bottom-2 left-1/2"
                        animate={{ x: [-60, 40, -30, 60, -60], y: [0, -6, 2, -4, 0], rotate: [-12, 8, -6, 10, -12] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Hand className="size-6 drop-shadow" fill="rgba(255,255,255,0.25)" />
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* coin burst */}
      {burst && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10" aria-hidden>
          {BURST.map((b, i) => (
            <motion.span
              key={i}
              className="absolute"
              style={{ marginLeft: -b.s / 2, marginTop: -b.s / 2 }}
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
              animate={{ x: b.x, y: [0, b.y, b.y + 90], scale: 1, opacity: [1, 1, 0], rotate: b.rot }}
              transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.45, 1] }}
            >
              <RewardCoin amount={perFriend} size={b.s} />
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
