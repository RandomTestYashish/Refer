import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, Search, Share, Star, X, XCircle } from "lucide-react";
import { AirtelMark } from "@/components/app/primitives";
import { useProto } from "@/store/useProto";

type Phase = "idle" | "downloading" | "installing" | "installed" | "cancelled" | "failed";

/** B03B — realistic app-store page with install simulation. */
export function AppStoreScreen() {
  const [phase, setPhase] = useState<Phase>(useProto.getState().bRun.installed ? "installed" : "idle");
  const [pct, setPct] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const navigate = useProto((s) => s.navigate);
  const back = useProto((s) => s.back);
  const setBRun = useProto((s) => s.setBRun);

  useEffect(() => () => clearInterval(timer.current), []);

  const install = () => {
    setPct(0);
    setPhase("downloading");
    const outcome = useProto.getState().scenario.install;
    let p = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      p += 4 + Math.random() * 6;
      if (outcome === "cancelled" && p > 45) {
        clearInterval(timer.current);
        setPhase("cancelled");
        return;
      }
      if (outcome === "failed" && p > 70) {
        clearInterval(timer.current);
        setPhase("failed");
        return;
      }
      if (p >= 100) {
        clearInterval(timer.current);
        setPct(100);
        setPhase("installing");
        setTimeout(() => {
          setPhase("installed");
          setBRun({ installed: true });
        }, 900);
        return;
      }
      setPct(p);
    }, 120);
  };

  const cancel = () => {
    clearInterval(timer.current);
    setPhase("cancelled");
  };

  const busy = phase === "downloading" || phase === "installing";
  const R = 13;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex h-full flex-col bg-white pt-[var(--sb,44px)]">
      <div className="flex shrink-0 items-center justify-between px-2 py-1 text-[#0A7AFF]">
        <button onClick={back} className="flex items-center text-[17px]" aria-label="Back to Messages">
          <ChevronLeft className="size-7" /> Messages
        </button>
        <div className="flex gap-4 pr-2">
          <Share className="size-5" />
          <Search className="size-5" />
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex gap-4 px-5 pt-3">
          <div className="flex size-[108px] shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#E4002B] to-[#B8001F] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
            <AirtelMark white className="size-[70px]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-[20px] font-semibold leading-[24px] tracking-[-0.01em]">Airtel Thanks: Recharge & UPI</p>
            <p className="mt-0.5 text-[13px] text-[#8E8E93]">Bharti Airtel Ltd</p>
            <div className="mt-auto flex items-center gap-3">
              <AnimatePresence mode="wait" initial={false}>
                {phase === "installed" ? (
                  <motion.button
                    key="open"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => navigate("b_launch", { via: "store" })}
                    className="h-[30px] rounded-full bg-[#0A7AFF] px-6 text-[15px] font-bold text-white active:opacity-70"
                  >
                    Open
                  </motion.button>
                ) : busy ? (
                  <motion.button key="ring" initial={{ scale: 0.8 }} animate={{ scale: 1 }} onClick={cancel} aria-label="Cancel download" className="relative size-[30px]">
                    <svg viewBox="0 0 30 30" className="size-[30px] -rotate-90">
                      <circle cx="15" cy="15" r={R} stroke="#E5E5EA" strokeWidth="2.5" fill="none" />
                      {phase === "downloading" ? (
                        <circle cx="15" cy="15" r={R} stroke="#0A7AFF" strokeWidth="2.5" fill="none" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.12s linear" }} />
                      ) : (
                        <motion.circle cx="15" cy="15" r={R} stroke="#0A7AFF" strokeWidth="2.5" fill="none" strokeDasharray={`${C * 0.25} ${C}`} animate={{ rotate: 360 }} style={{ originX: "15px", originY: "15px" }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                      )}
                    </svg>
                    <span className="absolute inset-[10px] rounded-[2px] bg-[#0A7AFF]" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="get"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={install}
                    className="h-[30px] rounded-full bg-[#0A7AFF] px-5 text-[15px] font-bold text-white active:opacity-70"
                  >
                    {phase === "idle" ? "Install" : "Retry"}
                  </motion.button>
                )}
              </AnimatePresence>
              <span className="text-[11px] leading-[13px] text-[#8E8E93]">
                {phase === "downloading" ? `Downloading… ${Math.round(pct)}%` : phase === "installing" ? "Installing…" : phase === "installed" ? "Installed" : "In-App Purchases"}
              </span>
            </div>
          </div>
        </div>

        {/* Status banners */}
        <AnimatePresence>
          {(phase === "cancelled" || phase === "failed") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-5 mt-4 overflow-hidden"
            >
              <div className={`flex gap-3 rounded-[14px] p-3.5 ${phase === "failed" ? "bg-airtel-error-soft" : "bg-[#F2F2F7]"}`}>
                {phase === "failed" ? <AlertTriangle className="size-5 shrink-0 text-airtel-error" /> : <XCircle className="size-5 shrink-0 text-[#8E8E93]" />}
                <div className="flex-1">
                  <p className="text-[14px] font-semibold">{phase === "failed" ? "Installation failed" : "Installation cancelled"}</p>
                  <p className="mt-0.5 text-[12.5px] leading-[17px] text-[#6C6C70]">
                    {phase === "failed"
                      ? "Airtel couldn't be installed — the download was interrupted. Check your connection and storage, then try again. Your invite will be waiting."
                      : "No worries — your invite from your friend is saved. Install Airtel whenever you're ready to claim your reward."}
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button onClick={install} className="rounded-full bg-[#0A7AFF] px-3.5 py-1.5 text-[13px] font-semibold text-white">
                      {phase === "failed" ? "Try again" : "Install"}
                    </button>
                    <button onClick={back} className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#0A7AFF]">
                      Back to Messages
                    </button>
                  </div>
                </div>
                <button aria-label="Dismiss" onClick={() => setPhase("idle")} className="self-start text-[#8E8E93]">
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 grid grid-cols-4 border-y border-black/10 py-3 text-center">
          {[
            ["4.4", "★★★★☆", "2.1M RATINGS"],
            ["#3", "Utilities", "CHART"],
            ["4+", "Years", "AGE"],
            ["100M+", "Downloads", "INSTALLS"],
          ].map(([a, b, c]) => (
            <div key={c} className="border-r border-black/10 last:border-0">
              <p className="text-[10px] font-semibold text-[#8E8E93]">{c}</p>
              <p className="text-[18px] font-bold text-[#6C6C70]">{a}</p>
              <p className="text-[11px] text-[#8E8E93]">{b}</p>
            </div>
          ))}
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 py-4">
          {[
            { t: "Recharge in seconds", c: "from-[#E4002B] to-[#8F0019]" },
            { t: "Pay bills & UPI", c: "from-[#171717] to-[#3A3A3A]" },
            { t: "Rewards on every recharge", c: "from-[#F5B300] to-[#C77700]" },
          ].map((s) => (
            <div key={s.t} className={`flex h-[300px] w-[160px] shrink-0 flex-col justify-between rounded-[18px] bg-gradient-to-b p-3 text-white ${s.c}`}>
              <p className="text-[15px] font-bold leading-[19px]">{s.t}</p>
              <div className="h-[200px] rounded-[12px] bg-white/90 p-2">
                <div className="h-3 w-16 rounded bg-black/10" />
                <div className="mt-2 h-14 rounded-[8px] bg-black/[0.06]" />
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-[6px] bg-black/[0.06]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-10">
          <p className="text-[14px] leading-[20px] text-[#3C3C43]">
            Recharge, pay bills, manage your Airtel services and earn rewards — all in one app.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[13px] text-[#8E8E93]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-[#FF9500] text-[#FF9500]" />
            ))}
            <span className="ml-1">“Smooth recharges and great offers.”</span>
          </div>
          <p className="mt-6 text-center text-[10.5px] text-[#A3A3A3]">PROTOTYPE · simulated app-store listing, nothing is downloaded</p>
        </div>
      </div>
    </div>
  );
}
