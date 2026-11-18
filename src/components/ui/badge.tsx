import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Gen4 Info Tag (Figma: ❖ Info Tag), In-card position.
 * sm: 18px tall, radius 4, 8px inset, Body/XXS Bold 11/14. Visual states mirror the library.
 */
const badgeVariants = cva(
  "inline-flex h-[18px] items-center gap-1 whitespace-nowrap rounded-[4px] border px-2 text-[11px] font-bold leading-[14px] [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-gen4-bg-400 bg-gen4-bg-100 text-airtel-ink",
        highlighted: "border-gen4-action-line bg-gradient-to-r from-[#E8FBFF] via-[#F0F2F9] to-[#E8FBFF] text-gen4-action",
        success: "border-airtel-success-line bg-airtel-success-soft text-airtel-success",
        warning: "border-airtel-warning-line bg-airtel-warning-soft text-airtel-warning-text",
        error: "border-airtel-error-line bg-airtel-error-soft text-airtel-error",
        new: "border-transparent bg-gradient-to-b from-[#397EED] to-[#064BBA] text-white",
        offer: "border-transparent bg-gradient-to-r from-[#FF57BC] to-[#2B2BFF] text-white",
        brand: "border-airtel-red bg-airtel-red text-white",
        disabled: "border-gen4-black-400 bg-gen4-black-200 text-gen4-black-500",
        // legacy aliases
        soft: "border-gen4-action-line bg-gradient-to-r from-[#E8FBFF] via-[#F0F2F9] to-[#E8FBFF] text-gen4-action",
        neutral: "border-gen4-bg-400 bg-gen4-bg-100 text-airtel-ink",
        info: "border-gen4-action-line bg-gradient-to-r from-[#E8FBFF] via-[#F0F2F9] to-[#E8FBFF] text-gen4-action",
        outline: "border-gen4-bg-400 bg-white text-airtel-ink",
      },
      shape: {
        inCard: "",
        pill: "h-[22px] rounded-[20px] px-3 italic",
      },
    },
    defaultVariants: { variant: "brand", shape: "inCard" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, shape }), className)} {...props} />;
}

/** Gen4 Notifier — count badge (24×20 pill, blue, 2px white ring, 11 bold). */
function Notifier({ count, className }: { count: number | string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-6 items-center justify-center rounded-full border-2 border-white bg-gen4-action px-1 text-[11px] font-bold leading-[14px] text-white",
        className,
      )}
    >
      {count}
    </span>
  );
}

export { Badge, Notifier, badgeVariants };
