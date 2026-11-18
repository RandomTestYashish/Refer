import * as React from "react";
import { home } from "@/assets/home";
import { cn } from "@/lib/utils";

/**
 * Shared atoms from the Airtel Home Figma (Yashis-Imaginarium_22-jun · 81392:10135).
 * Every referral screen composes these so the journey looks like the Home page.
 */

/** Card 1 surface: white→#F5F5F5 gradient, #E6E9EF stroke. */
export const CARD = "border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)]";
/** Blue-grey band used behind hero cards (Rectangle 81392:10137). */
export const BAND = "bg-[#F0F4F9]";

/** Section Title ✅ — Inter Bold 11/12, tracking 1.76px, uppercase, #3E4146. */
export function SectionTitle({
  children,
  action,
  tracking = 1.76,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  tracking?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <p className="flex-1 text-[11px] font-bold uppercase leading-[12px] text-[#3E4146]" style={{ letterSpacing: tracking }}>
        {children}
      </p>
      {action}
    </div>
  );
}

/** Tertiary text link (#075EE8, Medium 14). */
export function LinkButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn("text-[14px] font-medium leading-4 text-[#075EE8] active:opacity-60", className)}>
      {children}
    </button>
  );
}

/** Clip Tag ✅ — gradient label with SVG ankles. `dark` is the black type-5 variant. */
export function ClipTag({ children, size = "lg", dark }: { children: React.ReactNode; size?: "lg" | "sm"; dark?: boolean }) {
  const lg = size === "lg";
  const left = dark ? "clip-left-sm.svg" : lg ? "clip-left-lg.svg" : "clip-left-sm.svg";
  const right = dark ? "clip-right-sm.svg" : lg ? "clip-right-lg.svg" : "clip-right-sm.svg";
  const h = lg ? 20 : 16;
  return (
    <div className="flex items-center" style={{ height: h }}>
      <img src={home(left)} alt="" style={{ width: h * 0.65, height: h }} />
      <div
        className={cn("flex items-center justify-center whitespace-nowrap px-1 py-[2px] font-bold italic text-white", lg ? "text-[12px] leading-[14px]" : "text-[10px] leading-[12px]")}
        style={{ height: h, backgroundImage: dark ? "linear-gradient(0deg,#000,#2D2B2B)" : "linear-gradient(180deg,#FC5252,#E32121)" }}
      >
        {children}
      </div>
      <img src={home(right)} alt="" style={{ width: h * 0.65, height: h }} />
    </div>
  );
}

/** Hero card (Next Best Action pattern): Card-1 surface, 16 radius, clip tag on the top edge. */
export function HeroCard({ tag, children, className }: { tag?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative rounded-[16px] px-4 pb-5 pt-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.04)]", CARD, className)}>
      {tag && <div className="absolute left-1/2 top-[-7px] -translate-x-1/2">{tag}</div>}
      {children}
    </div>
  );
}

/** Icon-action ✅ circle (64 ring + 60 elevated) with an icon node inside and an 11px label. */
export function IconAction({
  label,
  icon,
  onClick,
  tint,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  tint?: string;
}) {
  return (
    <button onClick={onClick} className="flex w-[74px] shrink-0 flex-col items-center gap-2 active:scale-95">
      <span className="relative size-[60px] drop-shadow-[0_5px_2.81px_rgba(143,165,227,0.2)]">
        <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F0F4F9]" />
        <span className="absolute left-1/2 top-1/2 size-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[linear-gradient(180deg,#F0F4F9,#FFFFFF)]" />
        <span className="absolute inset-0 flex items-center justify-center [&_svg]:size-[22px] [&_svg]:stroke-[1.6]" style={{ color: tint ?? "#000" }}>
          {icon}
        </span>
      </span>
      <span className="w-full text-center text-[11px] font-medium leading-[14px] text-[#292C31]">{label}</span>
    </button>
  );
}

/** Pill "service card" (My services pattern): 52px circle art + title + sub line. */
export function PillCard({
  art,
  title,
  sub,
  subClass,
  onClick,
  className,
}: {
  art: React.ReactNode;
  title: React.ReactNode;
  sub: React.ReactNode;
  subClass?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={cn("flex h-[72px] items-center gap-2 rounded-full pl-[9px] pr-4 text-left active:scale-[0.98]", CARD, className)}>
      <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0F4F9]">{art}</span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold leading-[18px] text-black">{title}</span>
        <span className={cn("block truncate text-[12px] leading-[18px] text-[#696B6F]", subClass)}>{sub}</span>
      </span>
    </button>
  );
}

/** Illustrative tile with Figma art in the bottom 60px. */
export function ArtTile({ label, img, onClick, className }: { label: string; img: string; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn("relative flex h-[112px] flex-col items-center rounded-[16px] pt-4 active:scale-[0.97]", CARD, className)}>
      <img src={home(img)} alt="" className="absolute bottom-0 left-1/2 h-[60px] w-[101px] -translate-x-1/2 rounded-b-[16px] object-cover" />
      <p className="relative w-full px-3 text-center text-[12px] font-semibold leading-[14px] text-[#292C31]">{label}</p>
    </button>
  );
}
