import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter } from "@/components/app/primitives";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/domain/data";
import { useFocusReferral, useProto } from "@/store/useProto";
import { cn, inr } from "@/lib/utils";

/** B07 — recharge plan selection with ₹100 minimum-qualifying guard. */
export function PlansScreen() {
  const rules = useProto((s) => s.rules);
  const bRun = useProto((s) => s.bRun);
  const scenario = useProto((s) => s.scenario);
  const navigate = useProto((s) => s.navigate);
  const r = useFocusReferral();
  const [plan, setPlan] = useState(bRun.planId ?? "p199");
  const rewardActive = !!bRun.eligibility?.eligible && !bRun.attributedOther && scenario.deadline === "within" && r?.status === "pending_recharge";
  const sel = PLANS.find((p) => p.id === plan)!;
  const below = sel.price < rules.minTransaction;

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title="Recharge" subtitle={r?.phone ?? "+91 98765 43210"} className="bg-airtel-surface" />
      <ScreenBody className="px-4 pb-4">
        {rewardActive && (
          <div className="mb-3 flex items-center gap-2 rounded-[14px] bg-white px-3.5 py-2.5 text-[12.5px] shadow-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-airtel-success-soft">
              <Check className="size-3.5 text-airtel-success" strokeWidth={3} />
            </span>
            <span>
              Plans of <b>{inr(rules.minTransaction)}+</b> unlock {inr(rules.friendReward)} for you and your friend
            </span>
          </div>
        )}
        <RadioGroup value={plan} onValueChange={setPlan} className="gap-3">
          {PLANS.map((p, i) => {
            const qualifies = p.price >= rules.minTransaction;
            return (
              <motion.label
                key={p.id}
                htmlFor={p.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "block cursor-pointer rounded-[18px] border-2 bg-white p-4 transition-colors",
                  plan === p.id ? "border-airtel-red shadow-card" : "border-transparent",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[22px] font-extrabold tracking-[-0.03em]">{inr(p.price)}</span>
                      {p.tag && <Badge variant={p.tag === "Below ₹100" ? "neutral" : "soft"}>{p.tag === "Below ₹100" ? `Below ${inr(rules.minTransaction)}` : p.tag}</Badge>}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
                      <span>
                        <span className="block text-airtel-sub">Validity</span>
                        <b>{p.validity}</b>
                      </span>
                      <span>
                        <span className="block text-airtel-sub">Data</span>
                        <b>{p.data}</b>
                      </span>
                      <span>
                        <span className="block text-airtel-sub">Calls</span>
                        <b>{p.calls}</b>
                      </span>
                    </div>
                    <p className="mt-2 text-[11.5px] text-airtel-sub">{p.extras.join(" · ")}</p>
                    {rewardActive && (
                      <p className={cn("mt-2 text-[11.5px] font-semibold", qualifies ? "text-airtel-success" : "text-airtel-sub")}>
                        {qualifies ? `✓ Unlocks ${inr(rules.friendReward)} referral reward` : `Doesn't qualify for referral reward`}
                      </p>
                    )}
                  </div>
                  <RadioGroupItem value={p.id} id={p.id} className="mt-1.5" />
                </div>
              </motion.label>
            );
          })}
        </RadioGroup>
      </ScreenBody>
      <ScreenFooter>
        <AnimatePresence>
          {below && rewardActive && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mb-3 flex gap-2.5 rounded-[14px] bg-airtel-warning-soft p-3 text-[12.5px] leading-[17px] text-[#7A5310]">
                <AlertTriangle className="size-4 shrink-0 text-airtel-warning" />
                <span>
                  {inr(sel.price)} is below the {inr(rules.minTransaction)} minimum, so it won't unlock your referral reward.{" "}
                  <button className="font-bold underline" onClick={() => setPlan("p199")}>
                    Switch to ₹199
                  </button>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button size="lg" block onClick={() => navigate("b_payment", { plan })}>
          {below && rewardActive ? `Continue with ${inr(sel.price)} anyway` : `Select ${inr(sel.price)} plan`}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
