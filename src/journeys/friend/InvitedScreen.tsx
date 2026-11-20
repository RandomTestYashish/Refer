import { motion } from "framer-motion";
import { Gift, LinkIcon } from "lucide-react";
import { ContactAvatar, Screen } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { REFERRER } from "@/domain/data";
import { activeLink, useFocusReferral, useProto } from "@/store/useProto";
import { inr } from "@/lib/utils";

/** B03·I — shown right after sign-in / OTP: confirms whose invite was applied and what the friend gets. */
export function InvitedScreen() {
  const r = useFocusReferral();
  const rules = useProto((s) => s.rules);
  const navigate = useProto((s) => s.navigate);
  const first = r?.name.split(" ")[0];

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="relative">
          <ContactAvatar name={REFERRER.name} hue={350} size={88} />
          <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-white bg-airtel-red text-white">
            <Gift className="size-4" />
          </span>
        </motion.div>
        <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-6 text-display">
          {first ? `${first}, ` : ""}
          {REFERRER.first} invited you to Airtel
        </motion.h1>
        <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }} className="mt-2 text-[15px] leading-[22px] text-airtel-sub">
          You're signed in. Get {inr(rules.friendReward)} cashback + {rules.friendDataGB} GB data on your first recharge or bill payment of{" "}
          {inr(rules.minTransaction)}+.
        </motion.p>
        {r && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.26 }} className="mt-5 flex items-center gap-2 rounded-full bg-airtel-surface px-3.5 py-2 text-[12.5px] font-semibold text-airtel-sub">
            <LinkIcon className="size-3.5" /> Invite code {activeLink(r).code} applied automatically
          </motion.div>
        )}
      </div>
      <div className="px-5 pb-[34px]">
        <Button size="lg" block onClick={() => navigate("b_eligibility")}>
          Continue
        </Button>
      </div>
    </Screen>
  );
}
