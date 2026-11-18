import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCREEN_META, journeyPath } from "@/domain/screens";
import type { Journey } from "@/domain/types";
import { useCurrentScreen, useProto } from "@/store/useProto";
import { prepare } from "./jump";

/** Developer preview controls that sit OUTSIDE the simulated phone. */
export function ControlBar({ onTogglePanel }: { onTogglePanel: () => void }) {
  const journey = useProto((s) => s.journey);
  const scenario = useProto((s) => s.scenario);
  const setJourney = useProto((s) => s.setJourney);
  const current = useCurrentScreen();
  const meta = SCREEN_META[current.id];
  const path = journeyPath(journey, scenario);
  let idx = path.indexOf(current.id);
  if (idx < 0) {
    // error screens / off-path screens: show progress of the closest previous step in the stack
    const stack = useProto.getState().nav[journey];
    for (let i = stack.length - 1; i >= 0 && idx < 0; i--) idx = path.indexOf(stack[i].id);
  }
    // Two-step confirm (browser confirm() dialogs are unavailable in embedded previews).
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 3500);
    return () => clearTimeout(t);
  }, [confirmReset]);

  const step = (delta: 1 | -1) => {
    const target = path[Math.min(path.length - 1, Math.max(0, idx + delta))];
    if (!target || target === current.id) return;
    const params = prepare(target);
    const s = useProto.getState();
    if (delta === 1) s.navigate(target, params);
    else {
      // Going back: pop if the target is directly below, otherwise rebuild the stack.
      const stack = s.nav[journey];
      if (stack.length > 1 && stack[stack.length - 2].id === target) s.back();
      else s.resetTo(target, params);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#E6E9EF] bg-white px-4 py-2">
      <div className="flex items-center gap-2 pr-1">
        <span className="flex size-7 items-center justify-center rounded-[8px] bg-airtel-red text-[13px] font-black text-white">R</span>
        <div className="hidden leading-tight sm:block">
          <p className="text-[13px] font-bold">Refer & Earn</p>
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-airtel-sub">Prototype preview</p>
        </div>
      </div>

      <Select value={journey} onValueChange={(v) => setJourney(v as Journey)}>
        <SelectTrigger className="h-9 w-[210px]" aria-label="Journey">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="A">User A — Referrer</SelectItem>
          <SelectItem value="B">User B — Referred Friend</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex min-w-0 items-center gap-2 rounded-[10px] bg-airtel-surface px-2.5 py-1.5">
        <span className="rounded-[6px] bg-airtel-ink px-1.5 py-0.5 text-[10.5px] font-bold text-white tabular">{meta.code}</span>
        <span className="truncate text-[13px] font-semibold" data-testid="screen-name">
          {meta.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={() => step(-1)} disabled={idx <= 0} aria-label="Previous screen">
          <ChevronLeft /> Prev
        </Button>
        <Button size="sm" variant="dark" onClick={() => step(1)} disabled={idx >= path.length - 1} aria-label="Next screen">
          Next <ChevronRight />
        </Button>
      </div>

      <span className="hidden whitespace-nowrap text-[12px] font-medium text-airtel-sub tabular sm:inline">
        Step {Math.max(0, idx) + 1} of {path.length}
      </span>
      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={() => useProto.getState().resetJourney()}>
              <RotateCcw /> <span className="hidden lg:inline">Restart</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Restart the current journey. Shared referral data is kept.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-airtel-error"
              onClick={() => {
                if (confirmReset) {
                  useProto.getState().resetAll();
                  setConfirmReset(false);
                } else setConfirmReset(true);
              }}
            >
              <Trash2 /> <span className={confirmReset ? "inline" : "hidden"}>{confirmReset ? "Click again to reset all" : ""}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all mock data, scenarios and progress.</TooltipContent>
        </Tooltip>
        <Button size="sm" variant="outline" onClick={onTogglePanel}>
          <SlidersHorizontal /> Scenarios
        </Button>
      </div>
    </div>
  );
}
