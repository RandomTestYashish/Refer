import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-airtel-red text-white shadow-red hover:bg-airtel-red-dark",
        secondary: "bg-airtel-surface text-airtel-ink hover:bg-[#EDEDED]",
        outline: "border border-airtel-line bg-white text-airtel-ink hover:bg-airtel-surface",
        ghost: "text-airtel-ink hover:bg-airtel-surface",
        soft: "bg-airtel-red-soft text-airtel-red hover:bg-[#FADDE3]",
        link: "text-airtel-red underline-offset-4 hover:underline",
        success: "bg-airtel-success text-white hover:bg-[#126E3E]",
        dark: "bg-airtel-ink text-white hover:bg-black",
        destructive: "bg-airtel-error text-white hover:bg-[#B9271D]",
      },
      size: {
        default: "h-11 rounded-[12px] px-5 text-[15px] [&_svg]:size-[18px]",
        lg: "h-[52px] rounded-[14px] px-6 text-[16px] [&_svg]:size-5",
        sm: "h-9 rounded-[10px] px-3.5 text-[13px] [&_svg]:size-4",
        icon: "size-10 rounded-full [&_svg]:size-5",
      },
      block: { true: "w-full" },
    },
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
        className={cn(buttonVariants({ variant, size, block, className }), loading && "cursor-wait")}
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
