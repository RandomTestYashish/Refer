import { cn, inr } from "@/lib/utils";

/**
 * Theme headline: "Earn up to", a heavy ₹ amount sitting on a soft peach highlight bar, and a sub-line.
 * Tight type on an 8px grid (every line-height and gap is a multiple of 8).
 *   lg — eyebrow 24/32 · amount 56/64 · sub 20/24, 8px between lines
 *   sm — eyebrow 14/16 · amount 32/40 · sub 12/16, stacked with no gaps (banners)
 */
export function MoneyTitle({
  amount,
  eyebrow = "Earn up to",
  sub = "a year by inviting friends.",
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
      <p className={cn("font-semibold tracking-[-0.02em] text-[#2A2825]", lg ? "text-[24px] leading-[32px]" : "text-[14px] leading-[16px]")}>{eyebrow}</p>
      <div className={cn("relative w-fit", align === "center" && "mx-auto", lg ? "mt-2" : "mt-0")}>
        {/* Highlight bar behind the lower half of the amount */}
        <span
          className={cn("absolute rounded-full bg-[#FBE3C6]", lg ? "-inset-x-4 bottom-1 h-6" : "-inset-x-2 bottom-1 h-3")}
          aria-hidden
        />
        <p className={cn("relative font-black tracking-[-0.045em] text-[#1F1D1A] tabular", lg ? "text-[56px] leading-[64px]" : "text-[32px] leading-[40px]")}>{inr(amount)}</p>
      </div>
      <p className={cn("tracking-[-0.01em] text-[#3A3835]", lg ? "mt-2 text-[20px] leading-[24px]" : "mt-0 text-[12px] leading-[16px]")}>{sub}</p>
    </div>
  );
}
