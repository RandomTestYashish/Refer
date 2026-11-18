import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dev-only hook so screenshot scripts can jump to any screen. Not included in production builds.
if (import.meta.env.DEV) {
  void import("./store/useProto").then(({ useProto }) => ((window as unknown as { __proto: typeof useProto }).__proto = useProto));
}
