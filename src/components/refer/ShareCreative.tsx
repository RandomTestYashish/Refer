import appIconUrl from "@/assets/refer/airtel-app-icon.png";
import { cn, inr } from "@/lib/utils";

export type CreativeTheme = "red" | "midnight" | "blush";

export interface CreativeData {
  theme: CreativeTheme;
  friendName: string; // may be empty → generic greeting
  referrerName: string;
  note: string; // optional personal note
  friendReward: number;
  dataBenefit: string;
  minTransaction: number;
  link: string; // without protocol
}

export const THEMES: Record<CreativeTheme, { label: string; bg: [string, string]; fg: string; sub: string; accent: string; chip: string; chipFg: string; swatch: string }> = {
  red: { label: "Red", bg: ["#EE2A41", "#A10C1E"], fg: "#FFFFFF", sub: "rgba(255,255,255,0.8)", accent: "#FFE3E7", chip: "rgba(255,255,255,0.16)", chipFg: "#FFFFFF", swatch: "#D3132B" },
  midnight: { label: "Midnight", bg: ["#24262E", "#0D0E12"], fg: "#FFFFFF", sub: "rgba(255,255,255,0.72)", accent: "#FF5A6E", chip: "rgba(255,255,255,0.1)", chipFg: "#FFFFFF", swatch: "#17181D" },
  blush: { label: "Light", bg: ["#FFF6F6", "#FFE4E7"], fg: "#2A1013", sub: "#6B4A4E", accent: "#C8102E", chip: "#FFFFFF", chipFg: "#C8102E", swatch: "#FFE4E7" },
};

export const greeting = (name: string) => (name.trim() ? `Hi ${name.trim().split(" ")[0]},` : "Hi there,");

/** WhatsApp/SMS text. Rewards are tied to the first qualifying recharge — never to download or sign-up alone. */
export function inviteText(d: CreativeData) {
  const hi = d.friendName.trim() ? `Hi ${d.friendName.trim().split(" ")[0]}! ` : "Hi! ";
  const note = d.note.trim() ? `${d.note.trim()} ` : "";
  return `${hi}${note}${d.referrerName} invited you to the Airtel Thanks app. Get ${inr(d.friendReward)} + ${d.dataBenefit} when you complete your first recharge of ${inr(d.minTransaction)} or more. Download the app and join with my link: https://${d.link}`;
}

/* ───────────────────────── Live preview (DOM) ───────────────────────── */

/** 4:5 creative, laid out in a 1080-unit grid scaled by `width`, so it matches the PNG export. */
export function CreativePreview({ d, width, className }: { d: CreativeData; width: number; className?: string }) {
  const t = THEMES[d.theme];
  const u = width / 1080;
  const px = (n: number) => `${n * u}px`;
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height: width * 1.25, borderRadius: px(56), background: `linear-gradient(160deg, ${t.bg[0]}, ${t.bg[1]})`, color: t.fg }}
      data-testid="creative-preview"
      data-theme={d.theme}
    >
      <span className="absolute rounded-full" style={{ right: px(-220), top: px(-220), width: px(640), height: px(640), border: `${px(3)} solid ${t.chip}` }} aria-hidden />
      <span className="absolute rounded-full" style={{ right: px(-120), top: px(-120), width: px(440), height: px(440), border: `${px(3)} solid ${t.chip}` }} aria-hidden />
      <div className="absolute flex items-center" style={{ left: px(80), top: px(80), gap: px(24) }}>
        <img src={appIconUrl} alt="" style={{ width: px(110), height: px(110) }} />
        <span style={{ fontSize: px(44), fontWeight: 700 }}>Airtel Thanks</span>
      </div>
      <div className="absolute" style={{ left: px(80), right: px(80), top: px(290) }}>
        <p className="font-script" style={{ fontSize: px(96), lineHeight: 1, color: t.accent }}>
          {greeting(d.friendName)}
        </p>
        <p style={{ marginTop: px(20), fontSize: px(52), lineHeight: 1.2, fontWeight: 600 }}>{d.referrerName} invited you to Airtel</p>
        {d.note.trim() && (
          <p className="font-script" style={{ marginTop: px(18), fontSize: px(54), lineHeight: 1.1, color: t.sub }}>
            “{d.note.trim()}”
          </p>
        )}
      </div>
      <div className="absolute" style={{ left: px(80), right: px(80), top: px(d.note.trim() ? 700 : 640) }}>
        <p style={{ fontSize: px(36), fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: t.sub }}>You get</p>
        <p style={{ fontSize: px(140), lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>
          {inr(d.friendReward)} <span style={{ fontSize: px(84) }}>+ {d.dataBenefit}</span>
        </p>
        <p style={{ marginTop: px(14), fontSize: px(38), color: t.sub }}>on your first recharge of {inr(d.minTransaction)} or more</p>
      </div>
      <div className="absolute flex items-center justify-between" style={{ left: px(80), right: px(80), bottom: px(250), padding: `${px(26)} ${px(36)}`, borderRadius: px(30), background: t.chip, color: t.chipFg }}>
        <span style={{ fontSize: px(40), fontWeight: 700 }}>{d.link}</span>
      </div>
      <div className="absolute flex items-center" style={{ left: px(80), right: px(80), bottom: px(120), gap: px(20), fontSize: px(32), color: t.sub }}>
        <span>Download on</span>
        <span style={{ padding: `${px(10)} ${px(22)}`, borderRadius: px(16), border: `${px(3)} solid currentColor`, fontWeight: 700 }}>Google Play</span>
        <span style={{ padding: `${px(10)} ${px(22)}`, borderRadius: px(16), border: `${px(3)} solid currentColor`, fontWeight: 700 }}>App Store</span>
      </div>
      <p className="absolute" style={{ left: px(80), right: px(80), bottom: px(56), fontSize: px(26), color: t.sub }}>
        For people new to the Airtel app. Terms apply.
      </p>
    </div>
  );
}

/* ───────────────────────── PNG export (canvas) ───────────────────────── */

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (c.measureText(test).width > maxW && line) {
      c.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  c.fillText(line, x, yy);
  return yy;
}

/** Renders the creative to a 1080×1350 PNG for the native share sheet / download. */
export async function renderCreativePng(d: CreativeData): Promise<Blob> {
  const t = THEMES[d.theme];
  await Promise.allSettled([document.fonts?.load("600 96px Caveat"), document.fonts?.load("700 52px Inter"), document.fonts?.load("800 140px Inter")]);
  const cv = document.createElement("canvas");
  cv.width = 1080;
  cv.height = 1350;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, t.bg[0]);
  g.addColorStop(1, t.bg[1]);
  rrect(c, 0, 0, 1080, 1350, 56);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = t.chip;
  c.lineWidth = 3;
  [[1180, -100, 320], [1180, -100, 220]].forEach(([x, y, r]) => {
    c.beginPath();
    c.arc(x - 100, y + 100, r, 0, Math.PI * 2);
    c.stroke();
  });
  try {
    c.drawImage(await loadImage(appIconUrl), 80, 80, 110, 110);
  } catch {
    /* icon optional */
  }
  c.textBaseline = "alphabetic";
  c.fillStyle = t.fg;
  c.font = "700 44px Inter, sans-serif";
  c.fillText("Airtel Thanks", 214, 150);

  c.fillStyle = t.accent;
  c.font = "600 96px Caveat, cursive";
  c.fillText(greeting(d.friendName), 80, 370);
  c.fillStyle = t.fg;
  c.font = "600 52px Inter, sans-serif";
  let y = wrap(c, `${d.referrerName} invited you to Airtel`, 80, 460, 920, 62);
  if (d.note.trim()) {
    c.fillStyle = t.sub;
    c.font = "600 54px Caveat, cursive";
    y = wrap(c, `“${d.note.trim()}”`, 80, y + 76, 920, 60);
  }
  const top = d.note.trim() ? 700 : 640;
  c.fillStyle = t.sub;
  c.font = "600 36px Inter, sans-serif";
  c.fillText("YOU GET", 80, top + 40);
  c.fillStyle = t.fg;
  c.font = "800 140px Inter, sans-serif";
  const amt = inr(d.friendReward);
  c.fillText(amt, 80, top + 180);
  const aw = c.measureText(`${amt} `).width;
  c.font = "800 84px Inter, sans-serif";
  c.fillText(`+ ${d.dataBenefit}`, 80 + aw, top + 180);
  c.fillStyle = t.sub;
  c.font = "400 38px Inter, sans-serif";
  c.fillText(`on your first recharge of ${inr(d.minTransaction)} or more`, 80, top + 245);

  rrect(c, 80, 1350 - 250 - 104, 920, 104, 30);
  c.fillStyle = t.chip;
  c.fill();
  c.fillStyle = t.chipFg;
  c.font = "700 40px Inter, sans-serif";
  c.fillText(d.link, 116, 1350 - 250 - 38);

  c.fillStyle = t.sub;
  c.font = "400 32px Inter, sans-serif";
  c.fillText("Download on", 80, 1350 - 152);
  c.font = "700 32px Inter, sans-serif";
  c.strokeStyle = t.sub;
  let x = 80 + 210;
  for (const label of ["Google Play", "App Store"]) {
    const w = c.measureText(label).width + 44;
    rrect(c, x, 1350 - 196, w, 62, 16);
    c.stroke();
    c.fillText(label, x + 22, 1350 - 153);
    x += w + 20;
  }
  c.font = "400 26px Inter, sans-serif";
  c.fillText("For people new to the Airtel app. Terms apply.", 80, 1350 - 56);

  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}
