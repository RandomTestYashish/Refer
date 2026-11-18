import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Gen4 Field (Figma: ❖ Field). comfortable: 56px, radius 12, 12px inset, surface #F0F4F9, no stroke;
 * compact: 40px. Value Body/MD 16 (comfortable) / Body/SM 14 (compact).
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { density?: "compact" | "comfortable" }>(
  ({ className, type, density = "comfortable", ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-[12px] border border-transparent bg-gen4-bg-50 px-3 text-airtel-ink transition placeholder:text-gen4-bg-600 hover:border-gen4-bg-400 focus-visible:border-gen4-action focus-visible:bg-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        density === "compact" ? "h-10 text-[14px]" : "h-14 text-[16px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
