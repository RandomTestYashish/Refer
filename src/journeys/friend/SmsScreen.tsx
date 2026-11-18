import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronLeft, Info, MessageSquareText, Mic, Plus, Video } from "lucide-react";
import { AirtelMark } from "@/components/app/primitives";
import { useFocusReferral, useProto } from "@/store/useProto";
import { useStatusTone } from "@/components/device/statusTone";
import { cn, formatTime } from "@/lib/utils";
import type { ReferralLink } from "@/domain/types";

const SMS_TEXT = "Your friend is inviting you to Airtel! Join now and complete your first eligible recharge to unlock rewards for both of you.";

/** B01 + B02 — native-style Messages app with incoming referral SMS and link tap. */
export function SmsScreen() {
  const r = useFocusReferral();
  const scenario = useProto((s) => s.scenario);
  const bRun = useProto((s) => s.bRun);
  const navigate = useProto((s) => s.navigate);
  const [stage, setStage] = useState<"lock" | "thread">(bRun.linkTapped ? "thread" : "lock");
  const [tapped, setTapped] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  useStatusTone("light", !!r && stage === "lock" && !opening);

  useEffect(() => {
    setStage(useProto.getState().bRun.linkTapped ? "thread" : "lock");
  }, [r?.id, r?.links.length]);

  const onTapLink = (l: ReferralLink) => {
    if (opening) return;
    setTapped(l.code);
    setTimeout(() => setOpening(true), 250);
    setTimeout(() => {
      const res = useProto.getState().openLink(l.code);
      setOpening(false);
      setTapped(null);
      if (!res.ok) {
        navigate("b_error", { kind: res.error });
        return;
      }
      const installed = useProto.getState().scenario.appInstalled || useProto.getState().bRun.installed;
      if (installed) navigate("b_launch", { via: "deeplink" });
      else navigate("b_appstore");
    }, 1500);
  };

  if (!r)
    return (
      <div className="flex h-full flex-col bg-white pt-[44px]">
        <div className="px-4 pb-2 pt-3">
          <p className="text-[34px] font-bold tracking-[-0.02em]">Messages</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <MessageSquareText className="size-12 text-[#C7C7CC]" />
          <p className="mt-3 text-[17px] font-semibold">No messages yet</p>
          <p className="mt-1 text-[14px] text-[#8E8E93]">Waiting for an invitation. Send one from the User A journey, or create a demo invite from the panel.</p>
        </div>
      </div>
    );

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "lock" ? (
          <motion.div
            key="lock"
            exit={{ opacity: 0, scale: 1.04 }}
            className="relative flex h-full flex-col items-center bg-[radial-gradient(120%_80%_at_20%_0%,#5B6CFF_0%,#2B1B5A_45%,#0B0B1A_100%)] pt-[80px] text-white"
          >
            <p className="text-[17px] font-medium text-white/80">Tuesday, 18 November</p>
            <p className="text-[84px] font-semibold leading-none tracking-[-0.04em]">9:41</p>
            <motion.button
              initial={{ y: -80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => setStage("thread")}
              className="mx-3 mt-8 w-[calc(100%-24px)] rounded-[22px] bg-white/25 p-3 text-left backdrop-blur-xl active:scale-[0.98]"
              aria-label="Open new message from Your Friend"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-[22px] items-center justify-center rounded-[6px] bg-[#34C759]">
                  <MessageSquareText className="size-3.5 text-white" />
                </span>
                <span className="text-[13px] font-medium text-white/85">MESSAGES</span>
                <span className="ml-auto text-[12px] text-white/70">now</span>
              </div>
              <p className="mt-1.5 text-[15px] font-semibold">Your Friend</p>
              <p className="line-clamp-2 text-[14px] leading-[19px] text-white/90">{SMS_TEXT}</p>
            </motion.button>
            <motion.p
              className="mt-auto pb-12 text-[13px] text-white/70"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              Tap the notification to open
            </motion.p>
          </motion.div>
        ) : (
          <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col bg-white pt-[44px]">
            {/* Conversation header */}
            <div className="flex shrink-0 items-center border-b border-black/10 bg-[#F9F9F9]/95 px-2 pb-2 pt-1">
              <button aria-label="Back to lock screen" onClick={() => setStage("lock")} className="flex items-center text-[#0A7AFF]">
                <ChevronLeft className="size-7" />
              </button>
              <div className="flex flex-1 flex-col items-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-b from-[#A5A9B4] to-[#858A96] text-[15px] font-semibold text-white">YF</span>
                <span className="mt-0.5 text-[11px] font-medium">Your Friend ›</span>
              </div>
              <div className="flex gap-3 pr-2 text-[#0A7AFF]">
                <Video className="size-5" />
                <Info className="size-5" />
              </div>
            </div>
            {/* Messages */}
            <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-3 py-4">
              {r.links.map((l, i) => (
                <div key={l.code}>
                  <p className="mb-2 text-center text-[11px] font-medium text-[#8E8E93]">
                    {i === 0 ? "Text Message · SMS" : "Text Message · SMS (resent)"}
                    <br />
                    Today {formatTime(l.createdAt)}
                  </p>
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 260, damping: 22 }}
                    className="max-w-[270px] overflow-hidden rounded-[18px] rounded-bl-[6px] bg-[#E9E9EB]"
                  >
                    <p className="px-3 pt-2 text-[16px] leading-[21px] text-black">
                      {SMS_TEXT}{" "}
                      <button
                        onClick={() => onTapLink(l)}
                        className={cn(
                          "break-all text-left text-[#0A7AFF] underline decoration-[#0A7AFF]/40 underline-offset-2 transition-colors",
                          tapped === l.code && "rounded bg-[#0A7AFF]/20",
                        )}
                      >
                        {l.url}
                      </button>
                    </p>
                    {/* Rich link preview */}
                    <button onClick={() => onTapLink(l)} className="mt-2 block w-full bg-white/70 text-left active:bg-white">
                      <div className="flex h-[92px] items-center justify-center gap-2 bg-gradient-to-br from-[#E4002B] to-[#B8001F]">
                        <AirtelMark white className="size-9" />
                        <span className="text-[22px] font-extrabold tracking-[-0.03em] text-white">airtel</span>
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-[13px] font-semibold text-black">You're invited to Airtel</p>
                        <p className="text-[12px] text-[#8E8E93]">airtel.in</p>
                      </div>
                    </button>
                  </motion.div>
                </div>
              ))}
              {r.events.some((e) => e.kind === "reminder") && (
                <div className="max-w-[260px] rounded-[18px] rounded-bl-[6px] bg-[#E9E9EB] px-3 py-2 text-[16px] leading-[21px]">
                  Reminder: your Airtel invite is waiting — recharge to unlock rewards for both of you 🎁
                </div>
              )}
            </div>
            {/* Composer */}
            <div className="flex shrink-0 items-center gap-2 px-3 pb-[30px] pt-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#E9E9EB]">
                <Plus className="size-5 text-[#8E8E93]" />
              </span>
              <span className="flex h-9 flex-1 items-center justify-between rounded-full border border-[#D1D1D6] px-3 text-[15px] text-[#C7C7CC]">
                Text Message
                <Mic className="size-4" />
              </span>
              <Camera className="size-6 text-[#8E8E93]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* B02 — link opening */}
      <AnimatePresence>
        {opening && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-0 z-40 flex flex-col bg-white pt-[44px]"
          >
            <div className="mx-3 mt-1 flex h-10 items-center justify-center rounded-[12px] bg-[#F2F2F7] text-[15px]">🔒 airtel.in</div>
            <div className="mx-3 mt-1 h-[3px] overflow-hidden rounded bg-[#F2F2F7]">
              <motion.div className="h-full bg-[#0A7AFF]" initial={{ width: "5%" }} animate={{ width: "92%" }} transition={{ duration: 1.1 }} />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <AirtelMark className="size-14" />
              <p className="text-[14px] text-airtel-sub">
                {scenario.appInstalled || bRun.installed ? "Opening in Airtel app…" : "Checking for the Airtel app…"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
