import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "secondary" | "soft";
  loading?: boolean;
}

/** Shared full-height error / recovery block used by every error scenario. */
export function ErrorState({
  icon,
  tone = "error",
  title,
  body,
  status,
  primary,
  secondary,
  tertiary,
  children,
  className,
}: {
  icon: React.ReactNode;
  tone?: "error" | "warning" | "neutral" | "info";
  title: string;
  body: React.ReactNode;
  status?: React.ReactNode;
  primary?: ErrorAction;
  secondary?: ErrorAction;
  tertiary?: ErrorAction;
  children?: React.ReactNode;
  className?: string;
}) {
  const ring = {
    error: "bg-airtel-error-soft text-airtel-error",
    warning: "bg-airtel-warning-soft text-[#B7791F]",
    neutral: "bg-airtel-surface text-airtel-sub",
    info: "bg-[#EAF1FD] text-[#1F5FCC]",
  }[tone];
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className={cn("mb-5 flex size-[76px] items-center justify-center rounded-full [&_svg]:size-9", ring)}
        >
          {icon}
        </motion.div>
        <motion.h2 initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }} className="text-title">
          {title}
        </motion.h2>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.14 }}
          className="mt-2 text-[14px] leading-[21px] text-airtel-sub"
        >
          {body}
        </motion.div>
        {status && <div className="mt-4">{status}</div>}
        {children && <div className="mt-5 w-full">{children}</div>}
      </div>
      {(primary || secondary || tertiary) && (
        <div className="flex flex-col gap-2 px-5 pb-[34px]">
          {primary && (
            <Button size="lg" block variant={primary.variant ?? "default"} onClick={primary.onClick} loading={primary.loading}>
              {primary.label}
            </Button>
          )}
          {secondary && (
            <Button size="lg" block variant={secondary.variant ?? "outline"} onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          )}
          {tertiary && (
            <Button block variant={tertiary.variant ?? "ghost"} onClick={tertiary.onClick}>
              {tertiary.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
