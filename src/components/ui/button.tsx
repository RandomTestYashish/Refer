import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gen4 Button (Figma: ❖ Button). Types: Primary · Brand · Secondary · Ghost · Accent · Tertiary · Alternate.
 * Sizes: sm 40 / md 48 / lg 56 (radius 12 / 12 / 16), label Body/SM/Medium 14/16, 1px stroke, 12px inset, 4px gap.
 * Legacy variant names are kept as aliases so existing screens map onto Gen4 types.
 */
const primary = "border border-black bg-black text-white hover:border-gen4-black-800 hover:bg-gen4-black-800 active:border-airtel-ink active:bg-airtel-ink";
const brand = "border border-airtel-red bg-airtel-red text-white hover:border-airtel-red-bright hover:bg-airtel-red-bright active:border-airtel-red-dark active:bg-airtel-red-dark";
const secondary = "border border-black bg-airtel-surface text-airtel-ink hover:border-gen4-black-800 hover:bg-gen4-black-200 hover:text-gen4-black-800 active:border-airtel-ink active:bg-gen4-black-200 active:text-black";
const ghost = "border border-gen4-bg-100 bg-white text-gen4-bg-600 hover:border-gen4-bg-200 hover:bg-gen4-bg-50 active:border-gen4-bg-400 active:bg-gen4-bg-200";
const accent = "border border-gen4-bg-100 bg-white text-airtel-red hover:border-gen4-bg-200 hover:bg-gen4-bg-50 hover:text-airtel-red-bright active:border-gen4-bg-400 active:bg-gen4-bg-200 active:text-airtel-red-dark";
const tertiary = "h-auto border-0 bg-transparent px-0 text-gen4-action hover:text-gen4-action-hover hover:underline active:text-gen4-action-pressed";
const alternate = "!h-7 !rounded-[8px] border border-black bg-transparent !px-3 text-[12px] text-airtel-ink hover:bg-gen4-black-200 active:border-airtel-ink";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-1 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gen4-action focus-visible:ring-offset-2 disabled:pointer-events-none disabled:!border-gen4-black-400 disabled:!bg-gen4-black-300 disabled:!text-gen4-black-500 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary,
        brand,
        secondary,
        ghost,
        accent,
        tertiary,
        alternate,
        // legacy aliases
        default: primary,
        dark: primary,
        success: primary,
        destructive: brand,
        outline: ghost,
        soft: accent,
        link: tertiary,
      },
      size: {
        default: "h-12 rounded-[12px] px-3 text-[14px] leading-4", // md 48
        lg: "h-14 rounded-[16px] px-3 text-[14px] leading-4", // lg 56
        sm: "h-10 rounded-[12px] px-3 text-[14px] leading-4", // sm 40
        icon: "size-10 rounded-full",
      },
      block: { true: "w-full" },
    },
    compoundVariants: [
      { variant: ["tertiary", "link"], class: "!h-auto !px-0 disabled:!bg-transparent disabled:!border-0" },
    ],
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block }), loading && "cursor-wait", className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
