import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gen4 Callout (Figma: ❖ Callout). Radius 16, 16 inset, 1px stroke, 24px prepend icon,
 * title Body/SM/Bold 14, descriptor Body/XS 12/18, optional Alternate button (24px, radius 8).
 */
const calloutVariants = cva("relative flex gap-1 rounded-[16px] border p-4", {
  variants: {
    tone: {
      default: "border-gen4-action-line bg-gen4-action-soft text-gen4-action",
      success: "border-airtel-success-line bg-airtel-success-soft text-airtel-success",
      warning: "border-airtel-warning-line bg-airtel-warning-soft text-airtel-warning-text",
      error: "border-airtel-error-line bg-airtel-error-soft text-airtel-error",
      dark: "border-transparent bg-gradient-to-b from-black to-[#2D2B2B] text-white",
    },
  },
  defaultVariants: { tone: "default" },
});

const ICONS = { default: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle, dark: Info };

export interface CalloutProps extends VariantProps<typeof calloutVariants> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

export function Callout({ tone = "default", title, children, icon, action, onDismiss, className }: CalloutProps) {
  const Icon = ICONS[tone ?? "default"];
  return (
    <div className={cn(calloutVariants({ tone }), className)} role="note">
      <span className="flex size-6 shrink-0 items-center justify-center [&_svg]:size-6">{icon ?? <Icon strokeWidth={1.6} />}</span>
      <div className="min-w-0 flex-1 pt-0.5">
        {title && <p className="text-[14px] font-bold leading-4">{title}</p>}
        {children && <div className={cn("text-[12px] leading-[18px]", title && "mt-1")}>{children}</div>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 inline-flex h-6 items-center rounded-[8px] border border-current px-3 text-[12px] font-medium leading-4 transition-opacity hover:opacity-80"
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="flex size-6 shrink-0 items-center justify-center">
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
