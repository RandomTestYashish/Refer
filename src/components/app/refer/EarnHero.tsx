import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { UserPlus } from "lucide-react";
import { RewardCoin } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { home } from "@/assets/home";
import type { BusinessRules } from "@/config/businessRules";
import { inr } from "@/lib/utils";

/**
 * Refer & Earn hero — leads with the annual earning potential.
 * Keeps the existing illustrated stage (gradient, rings, megaphone, friends) and swaps the flat ₹ pills
 * for the app's own RewardCoin, which drop in and float. ₹5,000 counts up once.
 */

function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const text = useTransform(mv, (v) => inr(Math.round(v)));
  useEffect(() => {
    if (reduce) return;
    const c = animate(mv, to, { duration: 1.4, delay: 0.75, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [to, mv, reduce]);
  return <motion.span className="tabular">{text}</motion.span>;
}

const COINS = [
  { x: 14, y: 70, size: 46, delay: 0.35, float: 3.2 },
  { x: 268, y: 12, size: 40, delay: 0.5, float: 3.8 },
  { x: 286, y: 112, size: 30, delay: 0.65, float: 2.9 },
  { x: 116, y: 2, size: 26, delay: 0.8, float: 3.5 },
];

export function EarnHero({ rules, onInvite }: { rules: BusinessRules; onInvite: () => void }) {
  const reduce = useReducedMotion();
  const yearly = rules.referrerReward * rules.referralCapYear;

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-[linear-gradient(180deg,#FFE3E3_0%,#FFF1EC_55%,#FFFFFF_100%)] pb-6">
      {/* rings (existing motif), faded at the top so there's no hard edge under the header */}
      <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent_0%,black_35%,black_70%,transparent_100%)]">
        <span className="absolute left-1/2 top-[-60px] size-[360px] -translate-x-1/2 rounded-full border-[28px] border-white/45" />
        <span className="absolute left-1/2 top-[10px] size-[220px] -translate-x-1/2 rounded-full border-[22px] border-white/50" />
      </div>

      {/* Stage */}
      <div className="relative mx-auto h-[176px] w-[343px]" aria-hidden>
        <motion.img
          src={home("tile-refer.png")}
          alt=""
          className="absolute left-[60px] top-[26px] h-[134px] w-[226px] object-contain drop-shadow-[0_14px_18px_rgba(150,20,30,0.18)]"
          initial={reduce ? false : { scale: 0.85, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
        />
        {/* friends */}
        {[
          { img: "avatar-1.jpg", cls: "left-[44px] top-[4px]", s: 40 },
          { img: "avatar-3.jpg", cls: "right-[88px] top-[128px]", s: 38 },
        ].map(({ img, cls, s: size }, i) => (
          <motion.span
            key={img}
            className={`absolute ${cls} rounded-full ring-[3px] ring-white shadow-[0_6px_14px_rgba(0,0,0,0.12)]`}
            initial={reduce ? false : { scale: 0 }}
            animate={reduce ? {} : { scale: 1, y: [0, -5, 0] }}
            transition={{ scale: { delay: 0.15 + i * 0.08, type: "spring" }, y: { duration: 3.4, repeat: Infinity, delay: i * 0.6 } }}
          >
            <img src={home(img)} alt="" className="block rounded-full object-cover" style={{ width: size, height: size }} />
          </motion.span>
        ))}
        {/* rupee coins drop in, then float gently */}
        {COINS.map((c, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{ left: c.x, top: c.y }}
            initial={reduce ? false : { y: -90, opacity: 0, rotate: -25 }}
            animate={reduce ? {} : { y: [-90, 0, -6, 0], opacity: [0, 1, 1, 1], rotate: [-25, 0, 4, 0] }}
            transition={{ delay: c.delay, duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.55, 0.8, 1] }}
          >
            <motion.span
              className="block"
              animate={reduce ? {} : { y: [0, -5, 0] }}
              transition={{ duration: c.float, repeat: Infinity, ease: "easeInOut", delay: c.delay + 1.1 }}
            >
              <RewardCoin amount={rules.referrerReward} size={c.size} />
            </motion.span>
          </motion.span>
        ))}
      </div>

      {/* Earning proposition */}
      <div className="relative px-5 text-center">
        <motion.p
          initial={reduce ? false : { y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[13px] font-semibold text-[#3E4146]"
        >
          Earn up to
        </motion.p>
        <h1 id="hero-title" className="mt-0.5 text-[44px] font-bold leading-[48px] tracking-[-0.03em] text-[#E32121]">
          <CountUp to={yearly} />
          <span className="text-[20px] font-bold tracking-normal text-[#292C31]"> a year</span>
        </h1>
        <motion.p
          initial={reduce ? false : { y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mx-auto mt-2 max-w-[300px] text-[14px] leading-[20px] text-[#3E4146]"
        >
          Invite friends to Airtel and earn {inr(rules.referrerReward)} cashback for every friend who completes an eligible recharge or bill payment.
        </motion.p>
        <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-[#E6E9EF] bg-white px-3 py-1 text-[12px] font-semibold text-[#292C31]">
            Up to {rules.referralCapMonth} invitations a month
          </span>
          <span className="rounded-full border border-[#E6E9EF] bg-white px-3 py-1 text-[12px] font-semibold text-[#292C31]">
            {inr(rules.referrerReward)} per successful referral
          </span>
        </motion.div>
        <p className="mx-auto mt-2 max-w-[300px] text-[11px] leading-[15px] text-[#696B6F]">
          Maximum potential for {rules.referralCapYear} successful referrals a year. Not a guaranteed payout; only successful referrals earn.
        </p>
      </div>

      <div className="relative mt-5 px-4">
        <Button size="lg" block onClick={onInvite}>
          <UserPlus /> Invite Friends
        </Button>
      </div>
    </section>
  );
}
