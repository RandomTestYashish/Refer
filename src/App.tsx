import { useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { PhoneFrame, useIsPhoneViewport } from "@/components/device/PhoneFrame";
import { ScreenStage } from "@/components/device/ScreenStage";
import { StatusToneContext, type Tone } from "@/components/device/statusTone";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar } from "@/panel/ControlBar";
import { ScenarioPanel } from "@/panel/ScenarioPanel";

export default function App() {
  const [tone, setTone] = useState<Tone>("dark");
  const current = useRef<symbol | null>(null);
  const toneApi = useMemo(
    () => ({
      claim: (t: Tone) => {
        const token = Symbol();
        current.current = token;
        setTone(t);
        return token;
      },
      release: (token: symbol) => {
        if (current.current !== token) return;
        current.current = null;
        setTone("dark");
      },
    }),
    [],
  );
  const [panelOpen, setPanelOpen] = useState(false);

  const phone = useIsPhoneViewport();

  const stage = (
    <StatusToneContext.Provider value={toneApi}>
      <PhoneFrame statusTone={tone} overlay={<Toaster />} fullscreen={phone}>
        <ScreenStage />
      </PhoneFrame>
    </StatusToneContext.Provider>
  );

  // Real phones: the prototype IS the screen — no device frame, no developer chrome.
  if (phone)
    return (
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={300}>{stage}</TooltipProvider>
      </MotionConfig>
    );

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <div className="relative h-[100dvh]">
          <main className="h-full p-4" onClick={() => panelOpen && setPanelOpen(false)}>
            {stage}
          </main>

          {/* Developer controls live in a drawer; the viewer shows only the phone. */}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="fixed bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full border border-[#E6E9EF] bg-white px-4 text-[13px] font-semibold text-[#292C31] shadow-[0_6px_20px_rgba(0,0,0,0.10)] hover:bg-[#F7F9FC]"
            aria-label="Open prototype controls"
          >
            <SlidersHorizontal className="size-4" /> Controls
          </button>

          <aside
            className={`no-scrollbar fixed inset-y-0 right-0 z-30 w-[380px] max-w-[92vw] overflow-y-auto border-l border-[#E2E2E6] bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
              panelOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Prototype controls"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E6E9EF] bg-white px-4 py-3">
              <p className="text-[14px] font-bold">Prototype controls</p>
              <button onClick={() => setPanelOpen(false)} className="rounded-full p-1 text-airtel-sub hover:bg-airtel-surface" aria-label="Close controls">
                <X className="size-4" />
              </button>
            </div>
            <ControlBar onTogglePanel={() => setPanelOpen(false)} compact />
            <ScenarioPanel />
          </aside>
        </div>
      </TooltipProvider>
    </MotionConfig>
  );
}
