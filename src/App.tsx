import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { X } from "lucide-react";
import { PhoneFrame } from "@/components/device/PhoneFrame";
import { ScreenStage } from "@/components/device/ScreenStage";
import { StatusToneContext } from "@/components/device/statusTone";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar } from "@/panel/ControlBar";
import { ScenarioPanel } from "@/panel/ScenarioPanel";
import { useProto } from "@/store/useProto";
import { useIsDevice } from "@/lib/device";

export default function App() {
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [panelOpen, setPanelOpen] = useState(false);
  const journey = useProto((s) => s.journey);
  const device = useIsDevice();
  // Phone only by default. Add ?controls to the URL for the prototype header and scenario panel.
  const controls = !device && new URLSearchParams(window.location.search).has("controls");

  useEffect(() => setTone("dark"), [journey]);

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <div className="flex h-[100dvh] flex-col">
          {controls && <ControlBar onTogglePanel={() => setPanelOpen((o) => !o)} />}
          <div className="relative flex min-h-0 flex-1">
            <main className="relative min-w-0 flex-1 p-3 sm:p-6">
              <StatusToneContext.Provider value={setTone}>
                <PhoneFrame statusTone={tone} overlay={<Toaster />}>
                  <ScreenStage />
                </PhoneFrame>
              </StatusToneContext.Provider>
            </main>

            {/* Scenario panel: docked on wide screens, drawer on narrow ones */}
            {controls && <aside
              className={`no-scrollbar absolute inset-y-0 right-0 z-30 w-[340px] max-w-[92vw] overflow-y-auto border-l border-[#E2E2E6] bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-300 xl:static xl:translate-x-0 xl:shadow-none ${
                panelOpen ? "translate-x-0" : "translate-x-full"
              }`}
              aria-label="Developer scenario controls"
            >
              <button onClick={() => setPanelOpen(false)} className="absolute right-3 top-3 z-20 rounded-full p-1 text-airtel-sub hover:bg-airtel-surface xl:hidden" aria-label="Close scenarios">
                <X className="size-4" />
              </button>
              <ScenarioPanel />
            </aside>}
          </div>
        </div>
      </TooltipProvider>
    </MotionConfig>
  );
}
