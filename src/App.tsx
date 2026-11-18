import { useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { X } from "lucide-react";
import { PhoneFrame } from "@/components/device/PhoneFrame";
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
  // Screens own the status-bar tone via useStatusTone (which resets to "dark" on unmount).

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <div className="flex h-[100dvh] flex-col">
          <ControlBar onTogglePanel={() => setPanelOpen((o) => !o)} />
          <div className="relative flex min-h-0 flex-1">
            <main className="relative min-w-0 flex-1 p-3 sm:p-5" onClick={() => panelOpen && setPanelOpen(false)}>
              <StatusToneContext.Provider value={toneApi}>
                <PhoneFrame statusTone={tone} overlay={<Toaster />}>
                  <ScreenStage />
                </PhoneFrame>
              </StatusToneContext.Provider>
            </main>

            {/* Scenario panel: docked on wide screens, drawer on narrow ones */}
            <aside
              className={`no-scrollbar absolute inset-y-0 right-0 z-30 w-[340px] max-w-[92vw] overflow-y-auto border-l border-[#E2E2E6] bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
                panelOpen ? "translate-x-0" : "translate-x-full"
              }`}
              aria-label="Developer scenario controls"
            >
              <button onClick={() => setPanelOpen(false)} className="absolute right-3 top-3 z-20 rounded-full p-1 text-airtel-sub hover:bg-airtel-surface" aria-label="Close scenarios">
                <X className="size-4" />
              </button>
              <ScenarioPanel />
            </aside>
          </div>
        </div>
      </TooltipProvider>
    </MotionConfig>
  );
}
