import { createContext, useContext } from "react";

/**
 * Overlays (Dialog, Sheet, Select, Dropdown, Tooltip) render into the simulated
 * phone screen rather than document.body, so they stay inside the 375×812 viewport.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);
export const usePortalContainer = () => useContext(PortalContainerContext) ?? undefined;
