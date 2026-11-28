import { cn, inr } from "@/lib/utils";

/**
 * Theme headline, two lines:
 *   1. "Earn up to" + a big, heavy ₹ amount on one baseline (amount sits on a soft peach highlight bar)
 *   2. the sub-line ("a year by inviting friends")
 * Tight type on an 8px grid.
 *   lg — eyebrow 22/32 · amount 52/56 · sub 20/24
 *   sm — eyebrow 13/16 · amount 28/32 · sub 12/16 (banners)
 */
export function MoneyTitle({
  amount,
  eyebrow = "Earn up to",
  sub = "a year by inviting friends",
  size = "lg",
  align = "center",
  className,
}: {
  amount: number;
  eyebrow?: string;
  sub?: string;
  size?: "lg" | "sm";
  align?: "center" | "left";
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      <p className={cn("flex items-baseline whitespace-nowrap", align === "center" ? "justify-center" : "justify-start", lg ? "gap-2" : "gap-1")}>
        <span className={cn("font-semibold tracking-[-0.02em] text-[#2A2825]", lg ? "text-[22px] leading-[32px]" : "text-[13px] leading-[16px]")}>{eyebrow}</span>
        <span className="relative">
          {/* Highlight bar behind the lower half of the amount */}
          <span className={cn("absolute rounded-full bg-[#FBE3C6]", lg ? "-inset-x-2 bottom-1.5 h-5" : "-inset-x-1 bottom-1 h-2.5")} aria-hidden />
          <span className={cn("relative font-black tracking-[-0.045em] text-[#1F1D1A] tabular", lg ? "text-[52px] leading-[56px]" : "text-[28px] leading-[32px]")}>{inr(amount)}</span>
        </span>
      </p>
      <p className={cn("tracking-[-0.01em] text-[#3A3835]", lg ? "mt-1 text-[20px] leading-[24px]" : "mt-0.5 text-[12px] leading-[16px]")}>{sub}</p>
    </div>
  );
}
