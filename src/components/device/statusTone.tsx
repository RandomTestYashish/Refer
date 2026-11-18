import { createContext, useContext, useEffect } from "react";

type Tone = "dark" | "light";
export const StatusToneContext = createContext<(t: Tone) => void>(() => {});

/** Screens with dark/colored backgrounds call this so the simulated status bar stays legible. */
export function useStatusTone(tone: Tone, active = true) {
  const set = useContext(StatusToneContext);
  useEffect(() => {
    if (!active) return;
    set(tone);
    return () => set("dark");
  }, [tone, active, set]);
}
