import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

/**
 * `--mode demo`: single-file build with the operator brand replaced by a fictional one ("Nexa"),
 * used for the shareable hosted demo. Only JS string output is rewritten; CSS class names are untouched.
 */
const BRAND_SWAPS: [RegExp, string][] = [
  [/Bharti Airtel Ltd/g, "Nexa Telecom Ltd"],
  [/Airtel Thanks: Recharge & UPI/g, "Nexa: Recharge & UPI"],
  [/Airtel Thanks/g, "Nexa"],
  [/Airtel Xstream Play/g, "StreamPlay"],
  [/Xstream Play/g, "StreamPlay"],
  [/Xstream/g, "StreamPlay"],
  [/Airtel Black/g, "Nexa One"],
  [/HelloTune/g, "CallerTune"],
  [/airtel\.in/g, "nexa.in"],
  [/>airtel</g, ">nexa<"],
  [/Airtel/g, "Nexa"],
];
const SWIRL = "M11.5 25.5c2.2-7.6 9.8-12.6 15.2-10.2 3.9 1.8 2.6 7.4-2.4 8.8-3.1.9-5.6-.6-5-2.7.6-2 3.4-2.6 5.5-1.5";
const debrand = (): Plugin => ({
  name: "debrand",
  enforce: "pre",
  // Swap the operator's app icon for a neutral one.
  resolveId(source) {
    if (source.endsWith("airtel-app-icon.png")) return path.resolve(__dirname, "src/assets/refer/demo-app-icon.svg");
    return null;
  },
  transformIndexHtml(html) {
    return html
      .replace(/Airtel/g, "Nexa")
      .replace(/<link rel="icon"[^>]*>/, '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%278%27 fill=%27%23D3132B%27/%3E%3Cpath d=%27M10 22V10l12 12V10%27 stroke=%27white%27 stroke-width=%273%27 fill=%27none%27 stroke-linecap=%27round%27/%3E%3C/svg%3E" />');
  },
  transform(code, id) {
    if (!/\/src\/.*\.(tsx?|ts)$/.test(id)) return null;
    let out = code;
    for (const [re, to] of BRAND_SWAPS) out = out.replace(re, to);
    out = out.split(SWIRL).join("M14 28V12l12 16V12");
    return { code: out, map: null };
  },
});

// `--mode single` produces one self-contained index.html (used for artifact hosting).
// Default build uses a relative base so it works on GitHub Pages sub-paths.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [...(mode === "demo" ? [debrand()] : []), react(), ...(mode === "single" || mode === "demo" ? [viteSingleFile()] : [])],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { outDir: mode === "single" || mode === "demo" ? `dist-${mode}` : "dist" },
}));
