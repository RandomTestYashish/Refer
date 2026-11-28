import airtelLogo from "@/assets/refer/airtel-logo.svg";
import { cn } from "@/lib/utils";

/**
 * The money vault (theme hero): a brushed-silver safe whose door swings open on its right hinge,
 * a warm glow spills out over bundles of notes, then the door swings shut again.
 * Drawn at 260 × 230 and scaled with `scale`. The Airtel logo appears once, small, on the dial.
 *
 * mode "loop": closed → opens → holds → closes, on repeat. mode "ajar": settles open and breathes.
 */
const W = 260;
const H = 230;
const LOOP = 6.4;

export function Vault({ scale = 1, mode = "loop", className }: { scale?: number; mode?: "loop" | "ajar"; className?: string }) {
  // All parts share one CSS timeline (see .vault-* keyframes in index.css), so they always move together.
  const anim = (name: string) => ({ animation: mode === "loop" ? `vault-${name} ${LOOP}s ease-in-out infinite` : `vault-${name}-ajar 3.2s ease-in-out infinite alternate` });

  return (
    <div className={cn("relative", className)} style={{ width: W * scale, height: H * scale }} aria-label="A safe opening to show the money inside" role="img">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        {/* Floor shadow */}
        <div className="absolute bottom-[10px] left-[34px] h-[22px] w-[210px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(60,45,30,0.28),rgba(60,45,30,0))]" />
        {/* Warm light spilling on the floor */}
        <div className="absolute bottom-[4px] left-[70px] h-[40px] w-[180px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(242,179,91,0.55),rgba(242,179,91,0))]" style={anim("glow")} />

        {/* Left side wall with ribs (depth) */}
        <div
          className="absolute left-[22px] top-[34px] h-[160px] w-[34px] rounded-l-[14px]"
          style={{
            transform: "skewY(-10deg)",
            background:
              "repeating-linear-gradient(90deg, #C9C2B8 0px, #F3EFEA 3px, #D6CFC5 6px, #B9B1A6 7px), linear-gradient(180deg,#EEE9E2,#BEB6AB)",
            backgroundBlendMode: "multiply",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        />

        {/* Body: front frame */}
        <div
          className="absolute left-[52px] top-[26px] h-[168px] w-[178px] rounded-[18px]"
          style={{
            background: "linear-gradient(145deg,#FBF9F6 0%,#E4DED6 38%,#CFC7BC 70%,#B7AEA2 100%)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -3px 6px rgba(90,75,60,0.25), 0 18px 30px rgba(70,55,40,0.18)",
          }}
        >
          {/* Interior */}
          <div
            className="absolute inset-[14px] overflow-hidden rounded-[10px]"
            style={{ background: "radial-gradient(120% 90% at 40% 20%, #7A4A18 0%, #4A2C10 45%, #23160A 100%)", boxShadow: "inset 0 6px 14px rgba(0,0,0,0.55)" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_45%_15%,rgba(255,196,110,0.85),rgba(255,170,70,0.25)_45%,rgba(0,0,0,0)_75%)]" style={anim("glow")} />
            <div className="absolute inset-x-0 bottom-[6px] flex flex-col items-center gap-[3px]" style={anim("cash")}>
              <div className="flex gap-[4px]">
                <Bundle />
                <Bundle />
              </div>
              <div className="flex gap-[4px]">
                <Bundle face />
                <Bundle />
              </div>
              <div className="flex gap-[4px]">
                <Bundle />
                <Bundle />
              </div>
            </div>
          </div>
        </div>

        {/* Door, hinged on the right edge of the body */}
        <div className="absolute left-[60px] top-[32px] h-[156px] w-[166px]" style={{ perspective: 700 }}>
          <div className="relative size-full origin-right" style={{ transformStyle: "preserve-3d", ...anim("door") }}>
            {/* Outer face */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-[14px] [backface-visibility:hidden]"
              style={{
                background: "linear-gradient(150deg,#FDFCFA 0%,#E9E4DD 40%,#D3CBC0 75%,#BFB6AA 100%)",
                boxShadow: "inset 0 2px 0 #fff, inset 0 -3px 5px rgba(90,75,60,0.22), 0 6px 14px rgba(70,55,40,0.18)",
              }}
            >
              <Dial />
            </div>
            {/* Inner face (seen when open) */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-[14px] [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)", background: "linear-gradient(210deg,#EFEAE3 0%,#D2CABF 55%,#AFA599 100%)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.8)" }}
            >
              <span className="size-[70px] rounded-full border-[6px] border-[#C6BDB1] bg-[#D9D2C8]" />
            </div>
          </div>
        </div>

        {/* Coins in front */}
        <div className="absolute bottom-[18px] left-[26px] flex items-end">
          <CoinStack n={4} />
          <div className="-ml-[10px] mb-[-2px]">
            <SilverCoin size={46} />
          </div>
        </div>

        {/* Sparkle strokes */}
        <svg viewBox="0 0 40 40" className="absolute right-[-6px] top-[-4px] size-[44px]" style={anim("spark")}>
          <g stroke="#7A6A2A" strokeWidth="3" strokeLinecap="round">
            <path d="M10 18 L15 4" />
            <path d="M18 22 L32 9" />
            <path d="M22 30 L37 26" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/** A bundle of notes: stacked edges, a green paper band, "₹500" on the front one. Generic, not a real banknote. */
function Bundle({ face = false }: { face?: boolean }) {
  return (
    <div
      className="relative h-[17px] w-[56px] overflow-hidden rounded-[3px]"
      style={{
        background: "repeating-linear-gradient(180deg,#F1EAD3 0px,#F1EAD3 2px,#D9CFB3 3px)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
      }}
    >
      <span className="absolute inset-y-0 left-1/2 w-[10px] -translate-x-1/2 bg-[linear-gradient(180deg,#7DBB4B,#4E8E2C)]" />
      {face && (
        <span className="absolute inset-0 flex items-center justify-start bg-[linear-gradient(180deg,#F4EED9,#E3D9BC)] pl-[4px] text-[8px] font-bold text-[#6E6A50]">
          ₹500
          <span className="absolute inset-y-0 right-[8px] w-[10px] bg-[linear-gradient(180deg,#7DBB4B,#4E8E2C)]" />
        </span>
      )}
    </div>
  );
}

function Dial() {
  const dots = 28;
  return (
    <div className="relative size-[86px]">
      {Array.from({ length: dots }, (_, i) => {
        const a = (i / dots) * Math.PI * 2;
        return <span key={i} className="absolute size-[3px] rounded-full bg-[#A89E91] shadow-[0_1px_0_#fff]" style={{ left: 43 + Math.cos(a) * 38 - 1.5, top: 43 + Math.sin(a) * 38 - 1.5 }} />;
      })}
      <div
        className="absolute left-1/2 top-1/2 flex size-[40px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{ background: "radial-gradient(circle at 35% 30%,#FFFFFF,#DCD5CB 55%,#B3AA9E)", boxShadow: "0 3px 6px rgba(70,55,40,0.3), inset 0 1px 0 #fff" }}
      >
        <img src={airtelLogo} alt="" className="size-[16px] rounded-[4px] opacity-90" draggable={false} />
      </div>
    </div>
  );
}

/** Brushed-silver ₹ coin (theme coin). */
export function SilverCoin({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%,#FFFFFF 0%,#ECE7E0 40%,#CFC7BC 75%,#AFA699 100%)",
        boxShadow: `0 ${size * 0.06}px 0 #A69C8F, 0 ${size * 0.12}px ${size * 0.2}px rgba(70,55,40,0.25), inset 0 1px 0 #fff`,
      }}
    >
      <span className="absolute rounded-full border border-[#B8AFA3]" style={{ inset: size * 0.1 }} />
      <span className="relative font-bold text-[#8F8578] [text-shadow:0_1px_0_#fff]" style={{ fontSize: size * 0.46, lineHeight: 1 }}>
        ₹
      </span>
    </div>
  );
}

function CoinStack({ n }: { n: number }) {
  return (
    <div className="flex flex-col-reverse">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="-mt-[5px] block h-[11px] w-[40px] rounded-[50%]"
          style={{ background: "linear-gradient(180deg,#F6F3EF 0%,#D2CABF 55%,#A99F92 100%)", boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset, 0 1px 2px rgba(70,55,40,0.25)" }}
        />
      ))}
    </div>
  );
}
