import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserRoundPen } from "lucide-react";
import { AppBar, Screen, ScreenBody, ScreenFooter, SimNote, Wordmark } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFocusReferral, useProto } from "@/store/useProto";

/** Sign-in / registration step between app launch and the eligibility check. */
export function RegisterScreen() {
  const r = useFocusReferral();
  const scenario = useProto((s) => s.scenario);
  const navigate = useProto((s) => s.navigate);
  const setBRun = useProto((s) => s.setBRun);
  const acceptReferral = useProto((s) => s.acceptReferral);
  const isNew = scenario.userType === "new";
  const [stage, setStage] = useState<"phone" | "otp" | "incomplete" | "profile">("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(true);
  const phone = r?.phone ?? "+91 98765 43210";

  // Simulated OTP auto-read
  useEffect(() => {
    if (stage !== "otp") return;
    setOtp("");
    const digits = "482913";
    const t = digits.split("").map((_, i) => setTimeout(() => setOtp(digits.slice(0, i + 1)), 600 + i * 140));
    return () => t.forEach(clearTimeout);
  }, [stage]);

  const finish = () => {
    setBRun({ registered: true });
    acceptReferral();
    navigate("b_invited");
  };

  const verify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isNew && useProto.getState().scenario.registration === "incomplete") setStage("incomplete");
      else finish();
    }, 900);
  };

  if (stage === "incomplete")
    return (
      <Screen>
        <AppBar title="" onBack={() => setStage("otp")} />
        <ErrorState
          icon={<UserRoundPen />}
          tone="warning"
          title="Registration incomplete"
          body="Your number is verified, but your account setup didn't finish. Add your name to complete registration — your invite is still saved."
          primary={{ label: "Complete Registration", onClick: () => setStage("profile") }}
          secondary={{ label: "Back", onClick: () => setStage("otp") }}
        />
      </Screen>
    );

  return (
    <Screen>
      <AppBar title="" onBack={() => (stage === "phone" ? useProto.getState().back() : setStage("phone"))} />
      <ScreenBody className="px-6">
        <Wordmark className="mb-8 mt-2" />
        <AnimatePresence mode="wait">
          {stage === "phone" && (
            <motion.div key="phone" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <h1 className="text-display">{isNew ? "Create your account" : "Welcome back"}</h1>
              <p className="mt-2 text-[14px] text-airtel-sub">{isNew ? "Join Airtel with your mobile number." : "Sign in to your Airtel account to continue."}</p>
              <Label htmlFor="phone" className="mt-8 block text-airtel-sub">
                Mobile number
              </Label>
              <Input id="phone" value={phone} readOnly className="mt-2 text-[17px] font-semibold tabular" />
              <label className="mt-5 flex items-start gap-2.5 text-[12.5px] leading-[18px] text-airtel-sub">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />I agree to Airtel's Terms of Use and Privacy Policy
              </label>
            </motion.div>
          )}
          {stage === "otp" && (
            <motion.div key="otp" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <h1 className="text-display">Enter OTP</h1>
              <p className="mt-2 text-[14px] text-airtel-sub">Sent to {phone}</p>
              <div className="mt-8 flex justify-between gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={otp[i] ? { scale: [1, 1.1, 1] } : {}}
                    className={`flex h-[54px] flex-1 items-center justify-center rounded-[12px] border-2 text-[22px] font-bold tabular ${otp[i] ? "border-airtel-red bg-white" : "border-airtel-line bg-airtel-surface"}`}
                  >
                    {otp[i] ?? ""}
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-airtel-sub">{otp.length === 6 ? "OTP auto-detected" : "Waiting for OTP…"}</p>
            </motion.div>
          )}
          {stage === "profile" && (
            <motion.div key="profile" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <h1 className="text-display">One last step</h1>
              <p className="mt-2 text-[14px] text-airtel-sub">Tell us your name to finish setting up.</p>
              <Label htmlFor="name" className="mt-8 block text-airtel-sub">
                Full name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={r?.name ?? "Your name"} className="mt-2" autoFocus />
            </motion.div>
          )}
        </AnimatePresence>
      </ScreenBody>
      <ScreenFooter>
        {stage === "phone" && (
          <Button size="lg" block disabled={!agree} loading={loading} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setStage("otp"); }, 700); }}>
            Get OTP
          </Button>
        )}
        {stage === "otp" && (
          <Button size="lg" block disabled={otp.length < 6} loading={loading} onClick={verify}>
            Verify & Continue
          </Button>
        )}
        {stage === "profile" && (
          <Button size="lg" block loading={loading} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); finish(); }, 700); }}>
            Finish Registration
          </Button>
        )}
        <SimNote className="mt-2">OTP is simulated — no SMS is sent</SimNote>
      </ScreenFooter>
    </Screen>
  );
}
