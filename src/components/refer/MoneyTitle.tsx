import { motion } from "framer-motion";
import { cn, inr } from "@/lib/utils";

/**
 * Theme headline: "— ✦ Earn up to ✦ —", a heavy ₹ amount with a hand-drawn green underline that
 * draws itself in, and a light sub-line. Sizes scale with `size` ("lg" for heroes, "sm" for banners).
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
      <p className={cn("flex items-center gap-2 font-medium text-[#2A2825]", align === "center" && "justify-center", lg ? "text-[18px] leading-[22px]" : "text-[12px] leading-[14px]")}>
        {lg && <Ornament />}
        <span>{eyebrow}</span>
        {lg && <Ornament flip />}
      </p>
      <div className={cn("relative w-fit", align === "center" && "mx-auto")}>
        <p className={cn("font-black tracking-[-0.03em] text-[#262421] tabular", lg ? "mt-1 text-[58px] leading-[62px]" : "mt-0.5 text-[36px] leading-[40px]")}>{inr(amount)}</p>
        <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={cn("absolute right-[2%] w-[62%]", lg ? "-bottom-[6px] h-[10px]" : "-bottom-[4px] h-[7px]")} aria-hidden>
          <motion.path
            d="M4 10 C 60 2, 140 2, 196 6"
            fill="none"
            stroke="#6FAE3E"
            strokeWidth="5"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </div>
      <p className={cn("font-normal text-[#4A4743]", lg ? "mt-3 text-[20px] leading-[26px] tracking-[0.01em]" : "mt-2 text-[12.5px] leading-[16px]")}>{sub}</p>
    </div>
  );
}

function Ornament({ flip = false }: { flip?: boolean }) {
  return (
    <span className={cn("flex items-center gap-1", flip && "flex-row-reverse")} aria-hidden>
      <span className="h-px w-7 bg-[#2A2825]/60" />
      <span className="text-[11px] leading-none text-[#2A2825]">✦</span>
    </span>
  );
}
