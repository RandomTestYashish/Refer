import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { PortalContainerContext } from "@/components/ui/portal-context";

export const SCREEN_W = 375;
export const SCREEN_H = 812;
const BEZEL = 12;
const FRAME_W = SCREEN_W + BEZEL * 2;
const FRAME_H = SCREEN_H + BEZEL * 2;

export function StatusBar({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-[70] flex h-[44px] items-center justify-between pl-[30px] pr-[22px] text-[15px] font-semibold tabular",
        tone === "light" ? "text-white" : "text-airtel-ink",
        className,
      )}
    >
      <span className="tracking-[-0.01em]">9:41</span>
      <span className="flex items-center gap-[5px]">
        <Signal className="size-[15px]" strokeWidth={2.6} />
        <Wifi className="size-[15px]" strokeWidth={2.6} />
        <BatteryFull className="size-[22px]" strokeWidth={1.8} />
      </span>
    </div>
  );
}

/**
 * Realistic device frame with a fixed 375×812 internal viewport.
 * The whole device is uniformly scaled to fit the available space — the
 * internal UI is never reflowed or distorted.
 */
/** True on phone-sized viewports, where the prototype runs full-screen without the device frame. */
export function useIsPhoneViewport() {
  const query = "(max-width: 640px)";
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return match;
}

/**
 * Full-screen variant for real phones: no bezel, fake status bar, island or home indicator.
 * The 375-wide UI is scaled to the device width and the screen height fills the viewport.
 */
function FullScreen({ children, overlay }: { children: React.ReactNode; overlay?: React.ReactNode }) {
  const [screenEl, setScreenEl] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.visualViewport?.height ?? window.innerHeight });
    on();
    window.addEventListener("resize", on);
    window.visualViewport?.addEventListener("resize", on);
    return () => {
      window.removeEventListener("resize", on);
      window.visualViewport?.removeEventListener("resize", on);
    };
  }, []);
  const scale = size.w / SCREEN_W;
  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <div
        ref={setScreenEl}
        className="relative origin-top-left overflow-hidden bg-white"
        style={{ width: SCREEN_W, height: size.h / scale, transform: `scale(${scale})` }}
        data-phone-screen
      >
        <PortalContainerContext.Provider value={screenEl}>
          <div className="absolute inset-0">{children}</div>
          {overlay}
        </PortalContainerContext.Provider>
      </div>
    </div>
  );
}

export function PhoneFrame({
  children,
  statusTone = "dark",
  overlay,
  fullscreen,
}: {
  children: React.ReactNode;
  statusTone?: "dark" | "light";
  overlay?: React.ReactNode;
  /** Render edge-to-edge (real phones) instead of inside the device mock. */
  fullscreen?: boolean;
}) {
  if (fullscreen) return <FullScreen overlay={overlay}>{children}</FullScreen>;
  return (
    <FramedPhone statusTone={statusTone} overlay={overlay}>
      {children}
    </FramedPhone>
  );
}

function FramedPhone({
  children,
  statusTone = "dark",
  overlay,
}: {
  children: React.ReactNode;
  statusTone?: "dark" | "light";
  overlay?: React.ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [screenEl, setScreenEl] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.max(0.4, Math.min(1, width / FRAME_W, height / FRAME_H)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div style={{ width: FRAME_W * scale, height: FRAME_H * scale }} className="relative shrink-0">
        <div
          className="absolute left-0 top-0 origin-top-left rounded-[54px] bg-[#111] p-[12px] shadow-[0_0_0_1.5px_#2a2a2a,0_30px_80px_rgba(0,0,0,0.28),0_8px_20px_rgba(0,0,0,0.18)]"
          style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
        >
          {/* side buttons */}
          <span className="absolute -left-[3px] top-[150px] h-[30px] w-[3px] rounded-l bg-[#2a2a2a]" />
          <span className="absolute -left-[3px] top-[200px] h-[56px] w-[3px] rounded-l bg-[#2a2a2a]" />
          <span className="absolute -left-[3px] top-[266px] h-[56px] w-[3px] rounded-l bg-[#2a2a2a]" />
          <span className="absolute -right-[3px] top-[220px] h-[86px] w-[3px] rounded-r bg-[#2a2a2a]" />
          <div
            ref={setScreenEl}
            className="relative overflow-hidden rounded-[42px] bg-white"
            style={{ width: SCREEN_W, height: SCREEN_H, transform: "translateZ(0)" }}
            data-phone-screen
          >
            <PortalContainerContext.Provider value={screenEl}>
              <StatusBar tone={statusTone} />
              {/* Dynamic island */}
              <div className="pointer-events-none absolute left-1/2 top-[10px] z-[80] h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
              <div className="absolute inset-0">{children}</div>
              {overlay}
              {/* Home indicator */}
              <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-[80] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black/85" />
            </PortalContainerContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
