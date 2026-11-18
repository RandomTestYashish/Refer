import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-[12px] border border-airtel-line bg-airtel-surface px-3.5 text-[15px] text-airtel-ink transition placeholder:text-[#9A9A9A] focus-visible:border-airtel-red focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-airtel-red/10 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
