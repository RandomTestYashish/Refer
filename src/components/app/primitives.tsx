import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProto } from "@/store/useProto";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/domain/data";

/** Airtel-style brand mark (stylised, prototype only). */
export function AirtelMark({ className, white }: { className?: string; white?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-8", className)} aria-label="Airtel" role="img">
      <rect width="40" height="40" rx="11" fill={white ? "#fff" : "#E4002B"} />
      <path
        d="M11.5 25.5c2.2-7.6 9.8-12.6 15.2-10.2 3.9 1.8 2.6 7.4-2.4 8.8-3.1.9-5.6-.6-5-2.7.6-2 3.4-2.6 5.5-1.5"
        fill="none"
        stroke={white ? "#E4002B" : "#fff"}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className, white }: { className?: string; white?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AirtelMark className="size-7" white={white} />
      <span className={cn("text-[19px] font-extrabold tracking-[-0.03em]", white ? "text-white" : "text-airtel-red")}>airtel</span>
    </div>
  );
}

/** Root layout of every in-app screen: fixed header, scrollable body, optional sticky footer. */
export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  // 44px top padding keeps content clear of the simulated status bar.
  return <div className={cn("flex h-full flex-col bg-white pt-[var(--sb,44px)]", className)}>{children}</div>;
}

export const ScreenBody = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn("no-scrollbar relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden", className)}>
      {children}
    </div>
  ),
);
ScreenBody.displayName = "ScreenBody";

export function ScreenFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative z-10 shrink-0 border-t border-airtel-line/70 bg-white/95 px-5 pb-[30px] pt-3 backdrop-blur", className)}>
      {children}
    </div>
  );
}

/** Gen4 Top Nav (L1 pages): back icon (24 in 32), centred Body/XL/Bold 20 heading + Body/XS 12 sub-heading, #CDD3DD divider. */
export function AppBar({
  title,
  subtitle,
  right,
  onBack,
  className,
  transparent,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  className?: string;
  transparent?: boolean;
}) {
  const back = useProto((s) => s.back);
  return (
    <header
      className={cn(
        "relative z-10 grid h-[72px] shrink-0 grid-cols-[40px_1fr_40px] items-center gap-3 px-4",
        !transparent && "bg-white",
        className,
      )}
    >
      <button
        onClick={onBack ?? back}
        className="flex size-10 items-center justify-center rounded-full text-refer-ink transition active:scale-90 active:bg-black/5"
        aria-label="Back"
      >
        <ChevronLeft className="size-6" strokeWidth={1.8} />
      </button>
      <div className="min-w-0 text-center">
        {title && <div className="truncate text-[20px] font-bold leading-[22px] text-airtel-ink">{title}</div>}
        {subtitle && <div className="truncate text-[12px] leading-[18px] text-gen4-black-800">{subtitle}</div>}
      </div>
      <div className="flex items-center justify-end gap-1">{right}</div>
    </header>
  );
}

export function ContactAvatar({ name, hue = 0, size = 40, className }: { name: string; hue?: number; size?: number; className?: string }) {
  return (
    <Avatar className={cn("shrink-0", className)} style={{ width: size, height: size }}>
      <AvatarFallback
        style={{ background: `hsl(${hue} 70% 94%)`, color: `hsl(${hue} 55% 36%)`, fontSize: size * 0.36 }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function SectionTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-2.5 flex items-center justify-between px-5", className)}>
      <h3 className="text-[16px] font-bold leading-[18px] text-airtel-ink">{children}</h3>
      {action}
    </div>
  );
}

/** Small "prototype behaviour" label for simulated actions. */
export function SimNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center justify-center gap-1 text-center text-[10.5px] font-medium text-[#A3A3A3]", className)}>
      <span className="rounded bg-[#F1F1F1] px-1 py-px text-[9px] font-bold uppercase tracking-wider">Prototype</span>
      {children}
    </p>
  );
}

/** Rupee coin used across reward visuals. */
export function RewardCoin({ amount, size = 72, locked, className }: { amount: number; size?: number; locked?: boolean; className?: string }) {
  return (
    <motion.div
      className={cn("relative flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-[-0.03em]", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        background: locked
          ? "linear-gradient(145deg,#F3F3F3,#DCDCDC)"
          : "linear-gradient(145deg,#FFD66B 0%,#F5B300 55%,#E39A00 100%)",
        color: locked ? "#9B9B9B" : "#7A4A00",
        boxShadow: locked
          ? "inset 0 -3px 0 rgba(0,0,0,0.06), 0 6px 14px rgba(0,0,0,0.08)"
          : "inset 0 -4px 0 rgba(122,74,0,0.18), inset 0 3px 0 rgba(255,255,255,0.5), 0 10px 24px rgba(229,154,0,0.35)",
      }}
    >
      <span className="absolute inset-[9%] rounded-full border-2" style={{ borderColor: locked ? "#E6E6E6" : "rgba(255,255,255,0.45)" }} />
      ₹{amount}
    </motion.div>
  );
}

/** Stroke-drawn check mark used in success moments. */
export function AnimatedCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        pathLength={1}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: 1 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ delay: 0.25, duration: 0.45 }}
      />
    </svg>
  );
}
