import { createContext, useContext, useEffect } from "react";
import { useIsPresent } from "framer-motion";

export type Tone = "dark" | "light";
type ToneApi = { claim: (tone: Tone) => symbol; release: (token: symbol) => void };
export const StatusToneContext = createContext<ToneApi>({ claim: () => Symbol(), release: () => {} });

/**
 * Screens with dark/colored backgrounds call this so the simulated status bar stays legible.
 * Claims are tokenised: the most recent claim wins, and a screen that is still animating out
 * (AnimatePresence) can't reset the tone of the screen that replaced it.
 */
export function useStatusTone(tone: Tone, active = true) {
  const api = useContext(StatusToneContext);
  // A screen animating out must not (re)claim the tone from the screen replacing it.
  const present = useIsPresent();
  useEffect(() => {
    if (!active || !present) return;
    const token = api.claim(tone);
    return () => api.release(token);
  }, [tone, active, present, api]);
}
