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
const debrand = (): Plugin => ({
  name: "debrand",
  enforce: "pre",
  transform(code, id) {
    if (!/\/src\/.*\.(tsx?|ts)$/.test(id)) return null;
    let out = code;
    for (const [re, to] of BRAND_SWAPS) out = out.replace(re, to);
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
