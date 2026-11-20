import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Building blocks for the Refer & Earn bottom sheet, matching the Airtel rewards pages
 * (Airtel Points / My Rewards): sentence-case section headings, optional subtitle and action,
 * and divided link-list rows with a leading icon circle.
 */

export function SheetSection({
  title,
  subtitle,
  action,
  children,
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("px-4 pt-8", className)}>
      <div className="flex items-center gap-2">
        <h2 id={id} className="flex-1 text-[16px] font-bold leading-5 text-[#292C31]">
          {title}
        </h2>
        {action}
      </div>
      {subtitle && <p className="mt-1 text-[12px] leading-4 text-[#696B6F]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ListRow({
  icon,
  iconClass,
  title,
  sub,
  right,
  onClick,
  divider = true,
}: {
  icon: React.ReactNode;
  iconClass?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={cn("flex w-full items-start gap-3 py-4 text-left", divider && "border-b border-[#E6E9EF] last:border-0", onClick && "active:bg-[#F0F4F9]")}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4F9] text-[#292C31] [&_svg]:size-[18px]", iconClass)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold leading-[18px] text-[#292C31]">{title}</span>
        {sub && <span className="mt-1 block text-[13px] leading-[18px] text-[#696B6F]">{sub}</span>}
      </span>
      {right}
    </Tag>
  );
}
