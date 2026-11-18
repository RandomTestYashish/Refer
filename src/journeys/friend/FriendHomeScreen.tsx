import { useEffect, useState } from "react";
import { CalendarClock, Gift, Hourglass } from "lucide-react";
import { motion } from "framer-motion";
import { AirtelHome } from "@/components/app/AirtelHome";
import { RewardCoin } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { REFERRER, initials } from "@/domain/data";
import { useFocusReferral, useProto } from "@/store/useProto";
import { cn, inr } from "@/lib/utils";

const CARD = "border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)]";

/**
 * B05 — the referred friend lands on the same Airtel Home as everyone else.
 * Only the top card changes: instead of Pack Status it welcomes them and shows the referral reward.
 * B06 — the referral benefit bottom sheet opens once on first visit.
 */
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
  const first = r?.name.split(" ")[0] ?? "there";
  const isNew = bRun.eligibility?.segment === "new";
  const deadlinePassed = scenario.deadline === "expired" || (r?.status === "expired" && r.reason === "deadline_expired");
  const daysLeft = deadlinePassed ? 0 : rules.firstTxnDeadlineDays;
  const reward = `${inr(rules.friendReward)} cashback + ${rules.friendDataGB}GB`;
  const recharge = () => navigate("b_plans");

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

  // Copy for the welcome card, by eligibility state.
  const showReward = eligible && !bRun.attributedOther && !deadlinePassed;
  const title = showReward
    ? `${reward} is waiting for you`
    : deadlinePassed && eligible
      ? "Your referral offer has expired"
      : bRun.attributedOther
        ? "Your welcome reward is on its way"
        : "Enjoy everything Airtel has to offer";
  const body = showReward
    ? `${REFERRER.first} invited you. Complete your first recharge or bill payment within ${rules.firstTxnDeadlineDays} days to unlock it.`
    : deadlinePassed && eligible
      ? `The ${rules.firstTxnDeadlineDays}-day window for ${REFERRER.first}'s invite has ended. You can still recharge as usual.`
      : bRun.attributedOther
        ? `It's linked to the first invite you opened. Recharge or pay a bill to claim it.`
        : "Referral rewards aren't available on this account.";

  const welcomeTop = (
    <>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn("relative flex w-[343px] flex-col items-center gap-4 rounded-[16px] px-4 pb-5 pt-5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.04)]", CARD)}
      >
        <div className="flex w-full items-center gap-4">
          <p className="flex-1 text-[12px] font-semibold leading-[14px] text-[#FD2F36]">{isNew ? "Welcome to Airtel 🎉" : "Welcome back 👋"}</p>
          <p className="text-right text-[12px] font-semibold leading-[14px] text-[#292C31]">{r?.phone ?? ""}</p>
        </div>
        <div className="flex w-full items-center gap-3 text-left">
          {showReward ? (
            <RewardCoin amount={rules.friendReward} size={52} />
          ) : (
            <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#F0F4F9]">
              {deadlinePassed ? <Hourglass className="size-5 text-[#696B6F]" /> : <Gift className="size-5 text-[#696B6F]" strokeWidth={1.7} />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-[#696B6F]">Hi {first},</p>
            <p className="text-[15px] font-bold leading-[19px] text-[#292C31]">{title}</p>
          </div>
        </div>
        <p className="w-full text-center text-[13px] font-medium leading-[19px] text-[#3E4146]">{body}</p>
        {showReward && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#FFF0B8] px-3 py-1 text-[12px] font-semibold text-[#8F4C00]">
            <CalendarClock className="size-3.5" /> {daysLeft} days left
          </span>
        )}
      </motion.div>
      <div className="flex w-full items-center justify-center gap-4">
        <button
          onClick={() => (eligible ? setSheet(true) : recharge())}
          className="flex h-10 w-[163.5px] items-center justify-center rounded-[12px] border border-[#E6E9EF] bg-white px-3 text-[14px] font-medium leading-4 text-[#485B76] active:bg-[#F0F4F9]"
        >
          {eligible ? "View details" : "Explore Packs"}
        </button>
        <button
          onClick={recharge}
          className="flex h-10 w-[163.5px] items-center justify-center rounded-[12px] border border-black bg-black px-1 text-[14px] font-medium leading-4 text-white active:bg-[#3E4146]"
        >
          Recharge Now
        </button>
      </div>
    </>
  );

  return (
    <>
      <AirtelHome
        top={welcomeTop}
        onRecharge={recharge}
        profile={{ initials: initials(r?.name ?? "Friend"), name: r?.name ?? "Friend", phone: r?.phone ?? "" }}
      />

      {/* B06 — referral benefit bottom sheet */}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent>
          <SheetHeader className="items-center pt-5 text-center">
            <motion.div initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mb-2">
              {deadlinePassed ? <Hourglass className="size-14 text-airtel-sub" /> : <Gift className="size-14 text-airtel-red" strokeWidth={1.6} />}
            </motion.div>
            <SheetTitle className="text-center">{deadlinePassed ? "This offer has expired" : `${REFERRER.first} sent you a reward`}</SheetTitle>
            <SheetDescription className="text-center text-[14px] leading-[20px]">
              {deadlinePassed
                ? `The ${rules.firstTxnDeadlineDays}-day window to complete your first recharge or bill payment has passed. You can still recharge as usual.`
                : `Complete your first recharge or bill payment within ${rules.firstTxnDeadlineDays} days to unlock your welcome reward.`}
            </SheetDescription>
          </SheetHeader>
          {!deadlinePassed && (
            <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-airtel-red-soft p-3.5">
                <p className="text-[12px] font-medium text-airtel-red">You get</p>
                <p className="text-[22px] font-extrabold tracking-[-0.03em]">{inr(rules.friendReward)}</p>
                <p className="text-[11px] text-airtel-sub">cashback + {rules.friendDataGB}GB data</p>
              </div>
              <div className="rounded-[16px] bg-airtel-surface p-3.5">
                <p className="text-[12px] font-medium text-airtel-sub">{REFERRER.first} gets</p>
                <p className="text-[22px] font-extrabold tracking-[-0.03em]">{inr(rules.referrerReward)}</p>
                <p className="text-[11px] text-airtel-sub">cashback</p>
              </div>
            </div>
          )}
          <ul className="mx-5 mt-4 divide-y divide-airtel-line rounded-[16px] border border-airtel-line text-[13.5px]">
            <li className="flex justify-between px-4 py-3">
              <span className="text-airtel-sub">Qualifies</span>
              <b>First recharge or bill payment</b>
            </li>
            <li className="flex justify-between px-4 py-3">
              <span className="text-airtel-sub">Complete within</span>
              <b>{deadlinePassed ? "Expired" : `${rules.firstTxnDeadlineDays} days`}</b>
            </li>
            <li className="flex justify-between px-4 py-3">
              <span className="text-airtel-sub">Eligible</span>
              <b>First-time users only</b>
            </li>
          </ul>
          <div className="px-5 pb-[34px] pt-5">
            <Button
              size="lg"
              block
              onClick={() => {
                setSheet(false);
                recharge();
              }}
            >
              {deadlinePassed ? "Recharge anyway" : "Recharge now"}
            </Button>
            <Button block variant="ghost" className="mt-1" onClick={() => setSheet(false)}>
              Explore the app first
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
