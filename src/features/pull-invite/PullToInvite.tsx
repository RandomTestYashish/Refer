import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ChevronDown, Plus, User } from "lucide-react";
import { ContactAvatar } from "@/components/app/primitives";
import type { Contact } from "@/domain/types";
import { cn } from "@/lib/utils";
import { usePullGesture } from "./usePullGesture";

/**
 * Pull · Aim · Invite — presentation (slingshot).
 * The invite card rests at the bottom, held by an elastic cord. Pull it down, move sideways to aim
 * the beam at a friend above, and let go: the card flies to that friend. Physics: `usePullGesture`.
 */

const CARD_H = 128;
const CARD_BOTTOM = 76; // card's resting distance from the area's bottom edge
const THRESHOLD = 56;
const MAX_PULL = 96;
const AIM_GAIN = 3.2; // sideways card movement → beam movement

interface Props {
  /** Friends to aim at, or null while contact access hasn't been granted. */
  friends: Contact[] | null;
  onInvite: (contactId: string | null, via: "gesture" | "keyboard") => void;
  onPick: (contactId: string) => void;
  onRequestAccess: () => void;
  onOpenList: () => void;
  className?: string;
}

type Pt = { x: number; y: number };

export function PullToInvite({ friends, onInvite, onPick, onRequestAccess, onOpenList, className }: Props) {
  const reduced = !!useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const targetRefs = useRef<(HTMLElement | null)[]>([]);
  const [w, setW] = useState(343);
  const [aimIdx, setAimIdx] = useState<number | null>(null);
  const aimRef = useRef<number | null>(null);
  const aimPt = useRef<Pt>({ x: 0, y: 0 });
  const [taught, setTaught] = useState(false);
  const granted = friends !== null;
  const targets = granted ? friends : [0, 1, 2, 3, 4];
  const aimedFriend = granted && aimIdx !== null ? friends[aimIdx] : undefined;

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Rest geometry of the card, in area coordinates (unaffected by transforms). */
  const rest = () => {
    const c = cardRef.current;
    return c ? { cx: c.offsetLeft + c.offsetWidth / 2, top: c.offsetTop, cy: c.offsetTop + c.offsetHeight / 2 } : { cx: w / 2, top: 0, cy: 0 };
  };
  /** Centre of a target in area coordinates (accounts for row scroll and the scaled phone frame). */
  const centreOf = (el: HTMLElement): Pt => {
    const a = areaRef.current!.getBoundingClientRect();
    const s = a.width / areaRef.current!.offsetWidth || 1;
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - a.left) / s, y: (r.top + r.height / 2 - a.top) / s };
  };

  const aim = (x: number) => {
    const area = areaRef.current;
    if (!area) return false;
    const aimX = rest().cx + x * AIM_GAIN;
    let best: number | null = null;
    let bestD = Infinity;
    targetRefs.current.forEach((el, i) => {
      if (!el || i >= targets.length) return;
      const p = centreOf(el);
      if (p.x < 12 || p.x > area.offsetWidth - 12) return; // scrolled out of view
      const d = Math.abs(p.x - aimX);
      if (d < bestD) {
        bestD = d;
        best = i;
        aimPt.current = p;
      }
    });
    if (!granted) {
      // Before access is granted the beam always points at the middle placeholder.
      const mid = targetRefs.current[2];
      if (mid) {
        best = 2;
        aimPt.current = centreOf(mid);
      }
    }
    if (aimRef.current !== best) {
      aimRef.current = best;
      setAimIdx(best);
    }
    return best !== null;
  };

  const g = usePullGesture({
    geometry: { threshold: THRESHOLD, maxPull: MAX_PULL },
    reducedMotion: reduced,
    onAim: (x) => aim(x),
    launchTo: () => {
      const r = rest();
      return { x: aimPt.current.x - r.cx, y: aimPt.current.y - r.cy };
    },
    onTrigger: (via) => onInvite(granted && aimRef.current !== null ? friends[aimRef.current].id : null, via),
    onTap: () => {
      setTaught(true);
      if (!reduced) animate(g.y, [0, 18, 0], { duration: 0.7, ease: [0.32, 0.72, 0, 1] });
    },
  });
  const { x, y, phase, progress } = g;

  useEffect(() => {
    if (phase === "idle" || phase === "cancelled") {
      aimRef.current = null;
      setAimIdx(null);
    } else setTaught(false);
  }, [phase]);

  // One gentle nudge after landing so the card reads as "pullable".
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => y.get() === 0 && animate(y, [0, 14, 0], { duration: 0.9, ease: [0.32, 0.72, 0, 1] }), 1100);
    return () => clearTimeout(t);
  }, [reduced, y]);

  // Elastic cord from the fixed mount to the card's grip; a lagging spring bows it while moving.
  const lagX = useSpring(x, { stiffness: 260, damping: 16 });
  const lagY = useSpring(y, { stiffness: 260, damping: 16 });
  const cord = useTransform([x, y, lagX, lagY], ([vx, vy, lx, ly]: number[]) => {
    const r = rest();
    const ax = r.cx;
    const ay = r.top + 10;
    const ex = r.cx + vx;
    const ey = r.top + 10 + vy;
    return `M ${ax} ${ay} Q ${(ax + ex) / 2 + (lx - vx) * 0.9} ${(ay + ey) / 2 + (ly - vy) * 0.4} ${ex} ${ey}`;
  });
  const cordWidth = useTransform(y, [0, MAX_PULL], [3, 1.6], { clamp: true });
  const cordOpacity = useTransform(y, [0, 8], [0, 1]);
  // Aim beam: a soft cone from the card to the aimed friend.
  const beam = useTransform([x, y], ([vx, vy]: number[]) => {
    if (aimRef.current === null) return "M0 0";
    const r = rest();
    const t = aimPt.current;
    const bx = r.cx + vx;
    const by = r.top + vy + 4;
    const ty = t.y + 34;
    return `M ${t.x - 7} ${ty} L ${t.x + 7} ${ty} L ${bx + 54} ${by} L ${bx - 54} ${by} Z`;
  });
  const beamOpacity = useTransform(progress, [0, 0.1, 1], [0, 0.45, 1]);
  const rotate = useTransform(x, [-90, 90], [-6, 6]);
  const hintOpacity = useTransform(y, [0, 24], [1, 0]);

  const armed = phase === "armed" || phase === "launching";
  const engaged = phase === "pulling" || armed;
  const who = aimedFriend ? aimedFriend.name.split(" ")[0] : undefined;
  const label =
    phase === "idle"
      ? taught
        ? "Pull the card down, aim, then let go"
        : "Pull to invite"
      : phase === "pulling"
        ? who
          ? `Pull a bit further to invite ${who}`
          : granted
            ? "Pull down, then aim at a friend"
            : "Keep pulling to find your friends"
        : phase === "armed"
          ? who
            ? `Let go to invite ${who}`
            : "Let go to choose friends"
          : phase === "launching"
            ? who
              ? `Inviting ${who}…`
              : "Opening your contacts…"
            : "Pull a little further to invite";

  return (
    <div ref={areaRef} className={cn("relative select-none", className)} data-testid="pull-area" data-phase={phase} data-aim={aimedFriend?.id ?? ""}>
      {/* Soft material glow behind the card */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[-16px] bottom-[-40px] h-[260px] overflow-hidden">
        <div className="absolute -left-10 bottom-0 size-[220px] rounded-full bg-[#FFD9E4] opacity-60 blur-[60px]" />
        <div className="absolute -right-10 bottom-6 size-[220px] rounded-full bg-[#E4DEFF] opacity-70 blur-[60px]" />
      </div>

      {/* Friends to aim at */}
      <div className="relative">
        <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 pt-2" aria-label={granted ? "Friends you can invite" : undefined}>
          {granted
            ? friends.map((c, i) => {
                const on = aimIdx === i;
                return (
                  <li key={c.id} className="snap-start">
                    <button
                      ref={(el) => (targetRefs.current[i] = el)}
                      onClick={() => onPick(c.id)}
                      data-testid={`aim-${c.id}`}
                      className="flex w-[64px] flex-col items-center gap-1.5 rounded-[16px] py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--invite))]"
                      aria-label={`Invite ${c.name}`}
                    >
                      <motion.span
                        animate={{ scale: on ? 1.12 : 1 }}
                        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22 }}
                        className={cn("rounded-full ring-[3px] ring-offset-2 transition-shadow", on ? "ring-[hsl(var(--invite))]" : "ring-transparent")}
                      >
                        <ContactAvatar name={c.name} hue={c.hue} size={56} className="shadow-[0_4px_12px_rgba(29,29,31,0.10)]" />
                      </motion.span>
                      <span className={cn("max-w-full truncate text-[12px]", on ? "font-semibold text-[hsl(var(--invite))]" : "text-airtel-sub")}>{c.name.split(" ")[0]}</span>
                    </button>
                  </li>
                );
              })
            : targets.map((_, i) => (
                <li key={i} aria-hidden>
                  <span ref={(el) => (targetRefs.current[i] = el)} className="flex w-[64px] flex-col items-center gap-1.5 py-1">
                    <span className={cn("flex size-14 items-center justify-center rounded-full bg-[#F2F2F7] text-[#C7C7CC]", aimIdx === i && "ring-[3px] ring-[hsl(var(--invite))] ring-offset-2")}>
                      <User className="size-6" />
                    </span>
                    <span className="h-3 w-9 rounded-full bg-[#F2F2F7]" />
                  </span>
                </li>
              ))}
          {granted && (
            <li className="snap-start">
              <button onClick={onOpenList} className="flex w-[64px] flex-col items-center gap-1.5 rounded-[16px] py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--invite))]">
                <span className="flex size-14 items-center justify-center rounded-full bg-[#F2F2F7] text-airtel-ink">
                  <Plus className="size-6" />
                </span>
                <span className="text-[12px] text-airtel-sub">All</span>
              </button>
            </li>
          )}
        </ul>
        {!granted && (
          <button onClick={onRequestAccess} className="mx-auto mt-2 block rounded-full bg-[#F2F2F7] px-3.5 py-1.5 text-[13px] font-semibold text-airtel-ink active:scale-95">
            Allow contacts to see your friends here
          </button>
        )}
      </div>

      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="hsl(var(--invite))" stopOpacity="0.45" />
            <stop offset="1" stopColor="#AF52DE" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <motion.path d={beam} fill="url(#beam)" style={{ opacity: beamOpacity }} />
        <motion.path
          d={cord}
          fill="none"
          strokeLinecap="round"
          className={cn("transition-[stroke] duration-200", armed ? "stroke-[hsl(var(--invite))]" : "stroke-[#1D1D1F]")}
          style={{ strokeWidth: cordWidth, opacity: cordOpacity }}
        />
      </svg>

      {/* Fixed mount the cord is tied to */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-[5px] w-9 -translate-x-1/2 rounded-full bg-[#C7C7CC]"
        style={{ bottom: CARD_BOTTOM + CARD_H - 13 }}
      />

      {/* The invite card — the draggable handle */}
      <motion.button
        ref={cardRef}
        type="button"
        {...g.bind}
        data-testid="pull-handle"
        aria-label={aimedFriend ? `Invite ${aimedFriend.name}` : "Invite a friend"}
        aria-describedby="pull-hint"
        className={cn(
          "absolute inset-x-1 z-10 flex touch-none cursor-grab flex-col items-center justify-center gap-2 overflow-hidden rounded-[28px] border outline-none backdrop-blur-xl transition-[border-color,box-shadow] duration-200 active:cursor-grabbing",
          "focus-visible:ring-4 focus-visible:ring-[hsl(var(--invite)/0.35)]",
          armed
            ? "border-[hsl(var(--invite)/0.6)] shadow-[0_18px_40px_hsl(var(--invite)/0.22)]"
            : engaged
              ? "border-white shadow-[0_18px_40px_rgba(29,29,31,0.14)]"
              : "border-white shadow-[0_10px_30px_rgba(29,29,31,0.08)]",
        )}
        style={{
          bottom: CARD_BOTTOM,
          height: CARD_H,
          x,
          y,
          rotate,
          background: "linear-gradient(140deg, rgba(255,255,255,0.94) 0%, rgba(255,241,246,0.88) 55%, rgba(241,238,255,0.9) 100%)",
        }}
        animate={{ scale: phase === "launching" ? 0.32 : engaged ? 1.02 : 1, opacity: phase === "launching" ? 0 : 1 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26, opacity: { delay: 0.18, duration: 0.2 } }}
      >
        <span aria-hidden className="absolute top-2.5 h-[5px] w-9 rounded-full bg-[#D1D1D6]" />
        <InviteMark className="h-9 w-9" />
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">Invite a friend</span>
      </motion.button>

      {/* Resting hint under the card */}
      <motion.div aria-hidden style={{ opacity: hintOpacity, bottom: 22 }} className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-[#1D1D1F]">
        <motion.span className="block" animate={reduced ? undefined : { y: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="-mb-3 size-5" strokeWidth={2.4} />
          <ChevronDown className="size-5" strokeWidth={2.4} />
        </motion.span>
        <span className="mt-0.5 text-[16px] font-medium tracking-[-0.01em]">{phase === "idle" && taught ? "Pull the card down, aim, then let go" : "Pull to invite"}</span>
      </motion.div>

      {/* Live status above the card while pulling — announced politely */}
      <p
        id="pull-hint"
        aria-live="polite"
        data-testid="pull-label"
        className={cn(
          "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3.5 py-1.5 text-[14px] font-semibold tracking-[-0.01em] shadow-[0_2px_10px_rgba(29,29,31,0.08)] backdrop-blur transition-[opacity,color] duration-200",
          phase === "idle" ? "opacity-0" : "opacity-100",
          armed ? "text-[hsl(var(--invite))]" : phase === "cancelled" ? "text-airtel-sub" : "text-[#1D1D1F]",
        )}
        style={{ bottom: CARD_BOTTOM + CARD_H + 26 }}
      >
        {label}
        <span className="sr-only">. Use left and right arrows to aim and Enter to invite.</span>
      </p>
    </div>
  );
}

/** Brand swoosh used on the invite card (stylised, prototype only). */
function InviteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="swoosh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF3B5C" />
          <stop offset="1" stopColor="#E4002B" />
        </linearGradient>
      </defs>
      <path
        d="M7 29c3-10.5 13.5-17.5 21-14.2 5.4 2.4 3.6 10.2-3.3 12.2-4.3 1.2-7.8-.8-7-3.8.8-2.8 4.7-3.6 7.6-2.1"
        fill="none"
        stroke="url(#swoosh)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
