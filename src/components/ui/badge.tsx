import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold leading-none tracking-[0.01em] [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-airtel-red text-white",
        soft: "bg-airtel-red-soft text-airtel-red",
        neutral: "bg-airtel-surface text-airtel-sub",
        success: "bg-airtel-success-soft text-airtel-success",
        warning: "bg-airtel-warning-soft text-[#A56A12]",
        error: "bg-airtel-error-soft text-airtel-error",
        info: "bg-[#EAF1FD] text-[#1F5FCC]",
        outline: "border border-airtel-line text-airtel-sub",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
