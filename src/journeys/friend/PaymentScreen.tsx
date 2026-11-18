import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleSlash, CreditCard, Landmark, Lock, ShieldCheck, WifiOff, XCircle } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PLANS } from "@/domain/data";
import { useFocusReferral, useProto } from "@/store/useProto";
import { cn, inr } from "@/lib/utils";

const METHODS = [
  { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm & more", icon: () => <span className="text-[11px] font-black italic text-[#097939]">UPI</span> },
  { id: "apb", label: "Airtel Payments Bank", sub: "Balance ₹1,240", icon: () => <Landmark className="size-5 text-airtel-red" /> },
  { id: "card", label: "Credit / Debit card", sub: "Visa •••• 4821", icon: () => <CreditCard className="size-5 text-[#1F5FCC]" /> },
];

type Phase = "form" | "processing" | "failure" | "cancelled" | "network" | "checking";

/** B08 — simulated payment with success / failure / cancelled / network-interruption outcomes. */
export function PaymentScreen({ params }: { params?: Record<string, string> }) {
  const plan = PLANS.find((p) => p.id === params?.plan) ?? PLANS[1];
  const r = useFocusReferral();
  const replace = useProto((s) => s.replace);
  const back = useProto((s) => s.back);
  const [method, setMethod] = useState("upi");
  const [phase, setPhase] = useState<Phase>("form");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const succeed = () => {
    useProto.getState().completeRecharge(plan.id);
    replace("b_success", { plan: plan.id });
  };

  const pay = () => {
    setPhase("processing");
    timer.current = setTimeout(() => {
      const outcome = useProto.getState().scenario.payment;
      if (outcome === "success") succeed();
      else if (outcome === "failure") setPhase("failure");
      else if (outcome === "cancelled") setPhase("cancelled");
      else setPhase("network");
    }, 2200);
  };

  const cancelDuringProcessing = () => {
    clearTimeout(timer.current);
    setPhase("cancelled");
  };

  if (phase === "failure")
    return (
      <Screen>
        <AppBar title="Payment" onBack={() => setPhase("form")} />
        <ErrorState
          icon={<XCircle />}
          title="Payment failed"
          body={`Your bank declined the payment of ${inr(plan.price)}. No money was debited. Try again or use a different payment method.`}
          primary={{ label: "Retry payment", onClick: pay }}
          secondary={{ label: "Change payment method", onClick: () => setPhase("form") }}
        />
      </Screen>
    );
  if (phase === "cancelled")
    return (
      <Screen>
        <AppBar title="Payment" onBack={() => setPhase("form")} />
        <ErrorState
          icon={<CircleSlash />}
          tone="neutral"
          title="Payment cancelled"
          body="You cancelled the payment, so your recharge wasn't completed. Your referral reward is still waiting — finish your recharge whenever you're ready."
          primary={{ label: "Try again", onClick: () => setPhase("form") }}
          secondary={{ label: "Back to plans", onClick: back }}
        />
      </Screen>
    );
  if (phase === "network" || phase === "checking")
    return (
      <Screen>
        <AppBar title="Payment" onBack={() => setPhase("form")} />
        <ErrorState
          icon={<WifiOff />}
          tone="warning"
          title="Connection interrupted"
          body={`We lost connection while confirming your payment of ${inr(plan.price)}. Please don't pay again — we're checking the status with your bank.`}
          primary={{
            label: "Check payment status",
            loading: phase === "checking",
            onClick: () => {
              setPhase("checking");
              timer.current = setTimeout(succeed, 1600);
            },
          }}
          secondary={{ label: "Back to payment", onClick: () => setPhase("form") }}
        >
          <SimNote>Status check resolves to “payment successful”</SimNote>
        </ErrorState>
      </Screen>
    );

  return (
    <Screen className="bg-airtel-surface">
      <AppBar title="Payment" className="bg-airtel-surface" />
      <ScreenBody className="px-4 pb-4">
        <div className="rounded-[20px] bg-white p-4 shadow-card">
          <p className="text-[12px] text-airtel-sub">Recharge for {r?.phone ?? "+91 98765 43210"}</p>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <p className="text-[17px] font-bold">{inr(plan.price)} plan</p>
              <p className="text-[12.5px] text-airtel-sub">
                {plan.validity} · {plan.data} · {plan.calls}
              </p>
            </div>
            <button onClick={back} className="text-[13px] font-semibold text-airtel-red">
              Change
            </button>
          </div>
          <Separator className="my-3" />
          <div className="space-y-1.5 text-[13.5px]">
            <div className="flex justify-between">
              <span className="text-airtel-sub">Plan amount</span>
              <span>{inr(plan.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-airtel-sub">Convenience fee</span>
              <span className="text-airtel-success">Free</span>
            </div>
            <div className="flex justify-between pt-1.5 text-[16px] font-bold">
              <span>Total</span>
              <span>{inr(plan.price)}</span>
            </div>
          </div>
        </div>

        <p className="mb-2.5 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wider text-airtel-sub">Pay using</p>
        <RadioGroup value={method} onValueChange={setMethod} className="gap-0 overflow-hidden rounded-[20px] bg-white shadow-card">
          {METHODS.map((m, i) => (
            <label key={m.id} htmlFor={m.id} className={cn("flex cursor-pointer items-center gap-3 px-4 py-3.5", i > 0 && "border-t border-airtel-line")}>
              <span className="flex size-10 items-center justify-center rounded-full bg-airtel-surface">
                <m.icon />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold">{m.label}</span>
                <span className="block text-[12px] text-airtel-sub">{m.sub}</span>
              </span>
              <RadioGroupItem id={m.id} value={m.id} />
            </label>
          ))}
        </RadioGroup>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-airtel-sub">
          <ShieldCheck className="size-3.5" /> 100% secure payments
        </p>
      </ScreenBody>
      <ScreenFooter>
        <Button size="lg" block onClick={pay}>
          <Lock /> Pay {inr(plan.price)}
        </Button>
        <SimNote className="mt-2">Simulated payment — no money moves</SimNote>
      </ScreenFooter>

      <AnimatePresence>
        {phase === "processing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 px-8 text-center backdrop-blur">
            <div className="relative size-24">
              <motion.span className="absolute inset-0 rounded-full border-[5px] border-airtel-red-soft border-t-airtel-red" animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} />
              <span className="absolute inset-0 flex items-center justify-center text-[17px] font-bold">{inr(plan.price)}</span>
            </div>
            <p className="mt-6 text-heading">Processing payment…</p>
            <p className="mt-1 text-[13px] text-airtel-sub">Please don't close the app or press back.</p>
            <Button variant="ghost" className="mt-8" onClick={cancelDuringProcessing}>
              Cancel payment
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
