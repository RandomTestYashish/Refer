import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Bell, CalendarClock, ChevronRight, Gift, Hourglass, Menu, Music2, PhoneCall, Receipt, ShieldCheck, Zap } from "lucide-react";
import { ContactAvatar, RewardCoin, Screen, ScreenBody, Wordmark } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { REFERRER } from "@/domain/data";
import { useFocusReferral, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

const SERVICES = [
  { id: "recharge", icon: Zap, label: "Recharge", desc: "" },
  { id: "bills", icon: Receipt, label: "Bill Payments", desc: "Pay electricity, broadband, DTH and postpaid bills in a couple of taps." },
  { id: "calls", icon: PhoneCall, label: "Call Manager", desc: "Block spam, see who called and manage call forwarding." },
  { id: "hellotune", icon: Music2, label: "HelloTune", desc: "Set a free HelloTune callers hear while your phone rings." },
  { id: "safety", icon: ShieldCheck, label: "Safety Report", desc: "See spam calls and suspicious links Airtel blocked for you." },
] as const;

/** B05 Welcome / Airtel home + B06 referral benefit bottom sheet. */
export function FriendHomeScreen() {
  const r = useFocusReferral();
  const rules = useProto((s) => s.rules);
  const scenario = useProto((s) => s.scenario);
  const bRun = useProto((s) => s.bRun);
  const setBRun = useProto((s) => s.setBRun);
  const navigate = useProto((s) => s.navigate);
  const expireDeadline = useProto((s) => s.expireDeadline);
  const eligible = !!bRun.eligibility?.eligible || bRun.attributedOther;
  const [sheet, setSheet] = useState(false);
  const [explore, setExplore] = useState<(typeof SERVICES)[number] | null>(null);
  const first = r?.name.split(" ")[0] ?? "there";
  const deadlinePassed = scenario.deadline === "expired" || (r?.status === "expired" && r.reason === "deadline_expired");

  useEffect(() => {
    if (scenario.deadline === "expired") expireDeadline();
  }, [scenario.deadline, expireDeadline]);

  useEffect(() => {
    if (eligible && !bRun.sheetSeen) {
      const t = setTimeout(() => {
        setSheet(true);
        setBRun({ sheetSeen: true });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [eligible, bRun.sheetSeen, setBRun]);

  const daysLeft = deadlinePassed ? 0 : rules.firstTxnDeadlineDays;

  return (
    <Screen className="bg-airtel-surface">
      <header className="flex h-14 shrink-0 items-center gap-2 bg-white px-3">
        <button aria-label="Menu" onClick={() => toast("Menu", { description: "Not part of this prototype." })} className="flex size-10 items-center justify-center rounded-full active:bg-black/5">
          <Menu className="size-6" />
        </button>
        <Wordmark />
        <div className="flex-1" />
        <button aria-label="Notifications" onClick={() => eligible && setSheet(true)} className="relative flex size-10 items-center justify-center rounded-full active:bg-black/5">
          <Bell className="size-[22px]" />
          {eligible && <span className="absolute right-2 top-2 size-2 rounded-full bg-airtel-red" />}
        </button>
        <ContactAvatar name={r?.name ?? "Friend"} hue={12} size={34} />
      </header>
      <ScreenBody className="pb-8">
        <div className="bg-white px-5 pb-5 pt-2">
          <motion.p initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[13px] text-airtel-sub">
            {bRun.eligibility?.segment === "new" ? "Welcome to Airtel 🎉" : "Welcome back"}
          </motion.p>
          <motion.h1 initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="text-title">
            Hi {first}
          </motion.h1>

          {/* Referral benefit context */}
          {eligible && !bRun.attributedOther && (
            <motion.button
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => setSheet(true)}
              className={`mt-4 flex w-full items-center gap-3 rounded-[18px] p-4 text-left ${deadlinePassed ? "bg-airtel-surface" : "bg-gradient-to-br from-[#FFF1F3] to-[#FFE3E8]"}`}
            >
              {deadlinePassed ? (
                <span className="flex size-12 items-center justify-center rounded-full bg-white">
                  <Hourglass className="size-5 text-airtel-sub" />
                </span>
              ) : (
                <RewardCoin amount={rules.friendReward} size={48} />
              )}
              <span className="flex-1">
                <span className="block text-[14px] font-bold">{deadlinePassed ? "Referral offer expired" : `${inr(rules.friendReward)} waiting for you`}</span>
                <span className="mt-0.5 block text-[12.5px] leading-[17px] text-airtel-sub">
                  {deadlinePassed
                    ? `The ${rules.firstTxnDeadlineDays}-day window for ${REFERRER.first}'s invite has ended.`
                    : `${REFERRER.first} invited you · Recharge ${inr(rules.minTransaction)}+ to unlock`}
                </span>
              </span>
              {!deadlinePassed && (
                <Badge variant="soft" className="shrink-0">
                  <CalendarClock /> {daysLeft}d
                </Badge>
              )}
            </motion.button>
          )}
          {bRun.attributedOther && (
            <div className="mt-4 rounded-[16px] bg-[#EAF1FD] p-3.5 text-[12.5px] leading-[18px] text-[#1F4F9E]">
              Your welcome reward is linked to the first invite you opened. Recharge {inr(rules.minTransaction)}+ to claim it.
            </div>
          )}
          {!eligible && (
            <div className="mt-4 rounded-[16px] bg-airtel-surface p-3.5 text-[12.5px] leading-[18px] text-airtel-sub">
              Referral rewards aren't available on this account. Enjoy everything else Airtel has to offer.
            </div>
          )}
        </div>

        {/* Services */}
        <div className="mt-2 bg-white px-4 py-5">
          <p className="mb-4 px-1 text-[15px] font-bold">Services</p>
          <div className="grid grid-cols-3 gap-3">
            {SERVICES.map((s) => (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => (s.id === "recharge" ? navigate("b_plans") : setExplore(s))}
                className={`relative flex flex-col items-start gap-3 rounded-[16px] p-3 text-left ${s.id === "recharge" ? "bg-airtel-red text-white shadow-red" : "bg-airtel-surface"}`}
              >
                <s.icon className="size-6" strokeWidth={1.9} />
                <span className="text-[13px] font-semibold leading-[16px]">{s.label}</span>
                {s.id === "recharge" && eligible && !deadlinePassed && (
                  <span className="absolute right-2 top-2 rounded-full bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-airtel-red">+{inr(rules.friendReward)}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-2 bg-white px-5 py-4">
          <button onClick={() => navigate("b_plans")} className="flex w-full items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-airtel-red-soft">
              <Zap className="size-5 text-airtel-red" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[14px] font-semibold">Recharge your number</span>
              <span className="block text-[12px] text-airtel-sub">Plans from ₹79 · Unlimited 5G on ₹199+</span>
            </span>
            <ChevronRight className="size-5 text-airtel-sub" />
          </button>
        </div>
      </ScreenBody>

      {/* B06 — referral benefit bottom sheet */}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent>
          <SheetHeader className="items-center pt-5 text-center">
            <motion.div initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mb-2">
              {deadlinePassed ? <Hourglass className="size-14 text-airtel-sub" /> : <Gift className="size-14 text-airtel-red" strokeWidth={1.6} />}
            </motion.div>
            <SheetTitle className="text-center">{deadlinePassed ? "This offer has expired" : "Unlock rewards for both of you"}</SheetTitle>
            <SheetDescription className="text-center text-[14px] leading-[20px]">
              {deadlinePassed
                ? `The ${rules.firstTxnDeadlineDays}-day window to complete a first eligible recharge has passed. You can still recharge as usual.`
                : `Complete your first eligible recharge within ${rules.firstTxnDeadlineDays} days and unlock rewards for both of you.`}
            </SheetDescription>
          </SheetHeader>
          {!deadlinePassed && (
            <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-airtel-red-soft p-3.5">
                <p className="text-[12px] font-medium text-airtel-red">You get</p>
                <p className="text-[24px] font-extrabold tracking-[-0.03em]">{inr(rules.friendReward)}</p>
              </div>
              <div className="rounded-[16px] bg-airtel-surface p-3.5">
                <p className="text-[12px] font-medium text-airtel-sub">{REFERRER.first} gets</p>
                <p className="text-[24px] font-extrabold tracking-[-0.03em]">{inr(rules.referrerReward)}</p>
              </div>
            </div>
          )}
          <ul className="mx-5 mt-4 divide-y divide-airtel-line rounded-[16px] border border-airtel-line text-[13.5px]">
            <li className="flex justify-between px-4 py-3">
              <span className="text-airtel-sub">Minimum recharge</span>
              <b>{inr(rules.minTransaction)}</b>
            </li>
            <li className="flex justify-between px-4 py-3">
              <span className="text-airtel-sub">Complete within</span>
              <b>{deadlinePassed ? "Expired" : `${rules.firstTxnDeadlineDays} days`}</b>
            </li>
            <li className="flex justify-between px-4 py-3">
              <span className="text-airtel-sub">Reward credited</span>
              <b>After validation</b>
            </li>
          </ul>
          <div className="px-5 pb-[34px] pt-5">
            <Button size="lg" block onClick={() => { setSheet(false); navigate("b_plans"); }}>
              {deadlinePassed ? "Recharge anyway" : `Recharge now`}
            </Button>
            <Button block variant="ghost" className="mt-1" onClick={() => setSheet(false)}>
              Explore the app first
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Explore any service */}
      <Sheet open={!!explore} onOpenChange={(o) => !o && setExplore(null)}>
        <SheetContent>
          {explore && (
            <>
              <SheetHeader className="pt-5">
                <span className="mb-2 flex size-12 items-center justify-center rounded-[14px] bg-airtel-surface">
                  <explore.icon className="size-6" />
                </span>
                <SheetTitle>{explore.label}</SheetTitle>
                <SheetDescription className="text-[14px] leading-[20px]">{explore.desc}</SheetDescription>
              </SheetHeader>
              <div className="px-5 pb-[34px] pt-6">
                <Button size="lg" block variant="outline" onClick={() => setExplore(null)}>
                  Got it
                </Button>
                {eligible && !deadlinePassed && (
                  <Button size="lg" block className="mt-2" onClick={() => { setExplore(null); navigate("b_plans"); }}>
                    Recharge & unlock {inr(rules.friendReward)}
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Screen>
  );
}
