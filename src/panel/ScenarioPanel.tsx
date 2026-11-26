import { useState } from "react";
import { toast } from "sonner";
import { Bug, ChevronRight, FlaskConical, Info, Plus, RotateCw, Timer, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, RewardBadge } from "@/components/app/status";
import { DEFAULT_RULES, PENDING_CONFIRMATION, RULE_LABELS, type BusinessRules } from "@/config/businessRules";
import { CONTACTS } from "@/domain/data";
import { DEFAULT_SCENARIO, type Scenario } from "@/domain/types";
import { activeLink, useProto } from "@/store/useProto";
import { cn } from "@/lib/utils";
import { ERROR_SCENARIOS } from "./scenarios";
import { ensureFocus, go } from "./jump";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-airtel-ink">{label}</p>
        {hint && <p className="text-[10.5px] leading-[13px] text-airtel-sub">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Pick<K extends keyof Scenario>({ k, options }: { k: K; options: [Scenario[K] & string, string][] }) {
  const v = useProto((s) => s.scenario[k]) as string;
  const set = useProto((s) => s.setScenario);
  return (
    <Select value={v} onValueChange={(nv) => set({ [k]: nv } as Partial<Scenario>)}>
      <SelectTrigger className={cn("h-8 w-[150px] shrink-0 text-[12px]", v !== DEFAULT_SCENARIO[k] && "border-airtel-red/50 bg-airtel-red-soft/40")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([val, l]) => (
          <SelectItem key={val} value={val} className="text-[12px]">
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-airtel-line px-4 py-3.5">
      <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-airtel-sub [&_svg]:size-3.5">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ScenarioPanel() {
  const s = useProto();
  const focus = s.referrals.find((r) => r.id === s.focusReferralId);
  const [hint, setHint] = useState<string | null>(null);
  const linkValue = s.scenario.linkState === "invalid" ? "invalid" : focus && activeLink(focus).state === "expired" ? "expired" : "valid";

  return (
    <div className="pb-10 text-airtel-ink">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-airtel-line bg-white/95 py-3 pl-4 pr-10 backdrop-blur xl:pr-4">
        <FlaskConical className="size-4 text-airtel-red" />
        <p className="text-[13px] font-bold">Developer scenario controls</p>
        <span className="ml-auto rounded bg-airtel-surface px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-airtel-sub">Not in app UI</span>
      </div>

      {/* Shared referral */}
      <Section title="Shared referral (A ↔ B)" icon={<Zap />}>
        <Row label="User B is" hint="Which invited friend receives the SMS">
          {s.referrals.length ? (
            <Select value={s.focusReferralId} onValueChange={(v) => s.setFocus(v)}>
              <SelectTrigger className="h-8 w-[150px] text-[12px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {s.referrals.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-[12px]">
                    {r.name} · {activeLink(r).code.slice(-4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button size="sm" variant="soft" onClick={() => { ensureFocus(); }}>
              <Plus /> Demo invite
            </Button>
          )}
        </Row>
        {focus && (
          <div className="mt-1.5 rounded-[12px] bg-airtel-surface p-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={focus.status} />
              <span className="text-[10.5px] text-airtel-sub">A:</span>
              <RewardBadge state={focus.rewardA} />
              <span className="text-[10.5px] text-airtel-sub">B:</span>
              <RewardBadge state={focus.rewardB} />
            </div>
            <p className="mt-1.5 text-[10.5px] text-airtel-sub">
              {focus.links.length} link(s) · {focus.events.length} events · current link {activeLink(focus).state}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[11.5px]"
                onClick={() => {
                  if (!["invited", "link_opened", "accepted", "pending_recharge", "transaction_completed", "reward_processing"].includes(focus.status)) s.rebuild(focus.id, "invited");
                  useProto.getState().fastForward(focus.id);
                  toast.success("Friend's recharge simulated", { description: `Reward outcome: ${useProto.getState().scenario.reward}` });
                }}
              >
                Simulate friend's recharge
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => { s.resend(focus.id); toast("New link generated", { description: "A new SMS arrives for User B." }); }}>
                <RotateCw /> Resend link
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => s.applyRewardOutcome(focus.id, undefined, true)} disabled={!focus.recharge}>
                Apply reward outcome
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => { s.createInvites([CONTACTS[Math.floor(Math.random() * CONTACTS.length)].id], "sms"); }}>
                <Plus /> New demo invite
              </Button>
            </div>
          </div>
        )}
      </Section>

      <Section title="User B — Referred friend">
        <Row label="Airtel app installed">
          <Switch checked={s.scenario.appInstalled} onCheckedChange={(v) => { s.setScenario({ appInstalled: v }); if (!v) s.setBRun({ installed: false }); }} />
        </Row>
        <Row label="User type">
          <Pick k="userType" options={[["new", "New user"], ["existing_no_txn", "Existing · no txn"], ["existing_active", "Existing · active"]]} />
        </Row>
        <Row label="Existing users (no txn) eligible" hint="Provisional — business rule pending">
          <Switch checked={s.rules.existingNoTxnEligible} onCheckedChange={(v) => s.setRules({ existingNoTxnEligible: v })} />
        </Row>
        <Row label="Referral link">
          <Select
            value={linkValue}
            onValueChange={(v) => {
              if (v === "invalid") s.setScenario({ linkState: "invalid" });
              else {
                s.setScenario({ linkState: "valid" });
                if (v === "expired") s.expireLink(ensureFocus());
                if (v === "valid" && focus && activeLink(focus).state === "expired") s.resend(focus.id);
              }
            }}
          >
            <SelectTrigger className={cn("h-8 w-[150px] text-[12px]", linkValue !== "valid" && "border-airtel-red/50 bg-airtel-red-soft/40")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="valid" className="text-[12px]">Valid</SelectItem>
              <SelectItem value="expired" className="text-[12px]">Expired</SelectItem>
              <SelectItem value="invalid" className="text-[12px]">Invalid / malformed</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Install outcome">
          <Pick k="install" options={[["success", "Success"], ["cancelled", "Cancelled"], ["failed", "Failed"]]} />
        </Row>
        <Row label="Context restore" hint="Deferred deep link after install">
          <Pick k="contextRestore" options={[["success", "Success"], ["failed", "Not restored"]]} />
        </Row>
        <Row label="Registration">
          <Pick k="registration" options={[["complete", "Completes"], ["incomplete", "Incomplete"]]} />
        </Row>
        <Row label="Attribution">
          <Pick k="attribution" options={[["this_inviter", "This inviter"], ["other_inviter", "Another inviter first"]]} />
        </Row>
        <Row label="Recharge deadline">
          <Pick k="deadline" options={[["within", "Within window"], ["expired", "Expired"]]} />
        </Row>
        <Row label="Payment">
          <Pick k="payment" options={[["success", "Success"], ["failure", "Failure"], ["cancelled", "Cancelled"], ["network", "Network drop"]]} />
        </Row>
      </Section>

      <Section title="User A — Referrer">
        <Row label="Contacts">
          <Pick k="contacts" options={[["grant", "Granted"], ["deny", "Denied"], ["unavailable", "Unavailable"], ["empty", "Empty"]]} />
        </Row>
        <Row label="Network (sending)">
          <Pick k="network" options={[["success", "Success"], ["failure", "Failure"], ["slow", "Slow / pending"]]} />
        </Row>
        <Row label="Share outcome">
          <Pick k="share" options={[["ok", "OK"], ["sms_fail", "SMS fails"], ["whatsapp_missing", "No WhatsApp"], ["copy_fail", "Copy fails"]]} />
        </Row>
        <Row label="Past successful referrals" hint="Simulated history for milestones">
          <Select value={String(s.pastSuccesses)} onValueChange={(v) => s.setPastSuccesses(Number(v))}>
            <SelectTrigger className="h-8 w-[150px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, ...s.rules.milestones.map((m) => m.target - 1).filter((n) => n > 0), s.rules.milestones[s.rules.milestones.length - 1].target].map((n) => (
                <SelectItem key={n} value={String(n)} className="text-[12px]">
                  {n === 0 ? "None" : (() => { const m = s.rules.milestones.find((x) => x.target - 1 === n); return m ? `${n} (1 before ${m.label})` : `${n} (Platinum reached)`; })()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </Section>

      <Section title="Reward (shared)">
        <Row label="Reward outcome" hint="Applied when validation resolves">
          <Pick k="reward" options={[["credited", "Credited"], ["pending", "Validation pending"], ["delayed", "Delayed"], ["failed", "Failed / not eligible"], ["reversed", "Reversed"], ["expired", "Expired"]]} />
        </Row>
        <Button size="sm" variant="ghost" className="mt-1 h-8 px-2 text-[12px]" onClick={() => { s.setScenario(DEFAULT_SCENARIO); toast("Scenario switches reset"); }}>
          Reset all switches to happy path
        </Button>
      </Section>

      {/* Error scenarios */}
      <Section title="Jump to error / edge case" icon={<Bug />}>
        {hint && (
          <div className="mb-2 flex gap-2 rounded-[10px] bg-[#EAF1FD] p-2 text-[11.5px] leading-[15px] text-[#1F4F9E]">
            <Info className="mt-px size-3.5 shrink-0" />
            {hint}
          </div>
        )}
        <Accordion type="multiple" defaultValue={["A", "B"]}>
          {(["A", "B"] as const).map((j) => (
            <AccordionItem key={j} value={j}>
              <AccordionTrigger className="py-2 text-[12.5px]">{j === "A" ? "User A — 20 scenarios" : "User B — 16 scenarios"}</AccordionTrigger>
              <AccordionContent className="pb-2">
                <ul className="space-y-0.5">
                  {ERROR_SCENARIOS.filter((e) => e.journey === j).map((e, i) => (
                    <li key={e.id}>
                      <button
                        onClick={() => {
                          e.run();
                          setHint(e.hint ? `${e.label}: ${e.hint}` : `${e.label} — shown in the phone.`);
                        }}
                        className="group flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[12px] text-airtel-ink hover:bg-airtel-surface"
                      >
                        <span className="w-5 text-[10.5px] font-bold text-airtel-sub tabular">{i + 1}</span>
                        <span className="flex-1">{e.label}</span>
                        <ChevronRight className="size-3.5 text-airtel-sub opacity-0 transition group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Rules */}
      <Section title="Business rules — provisional" icon={<Timer />}>
        <p className="mb-2 text-[10.5px] leading-[14px] text-airtel-sub">Working assumptions, not final policy. Changes apply live across both journeys.</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(RULE_LABELS) as (keyof BusinessRules)[]).map((k) => (
            <label key={k} className="block">
              <span className="text-[10.5px] font-medium text-airtel-sub">{RULE_LABELS[k]}</span>
              <Input
                type="number"
                min={1}
                value={s.rules[k] as number}
                onChange={(e) => s.setRules({ [k]: Math.max(1, Number(e.target.value) || 1) } as Partial<BusinessRules>)}
                className="mt-0.5 h-8 rounded-[8px] px-2 text-[12.5px]"
              />
            </label>
          ))}
        </div>
        <label className="mt-2 block">
          <span className="text-[10.5px] font-medium text-airtel-sub">Friend data benefit</span>
          <Input value={s.rules.friendDataBenefit} onChange={(e) => s.setRules({ friendDataBenefit: e.target.value.slice(0, 12) })} className="mt-0.5 h-8 rounded-[8px] px-2 text-[12.5px]" />
        </label>
        <label className="mt-2 block">
          <span className="text-[10.5px] font-medium text-airtel-sub">Social-proof line (verify before launch)</span>
          <Input value={s.rules.socialProof} onChange={(e) => s.setRules({ socialProof: e.target.value.slice(0, 70) })} className="mt-0.5 h-8 rounded-[8px] border-dashed border-airtel-warning px-2 text-[12.5px]" />
        </label>
        <p className="mt-3 text-[10.5px] font-semibold text-airtel-ink">Monthly milestones (successful referrals · ₹ reward)</p>
        <div className="mt-1 space-y-1.5">
          {s.rules.milestones.map((m, i) => (
            <div key={m.id} className="grid grid-cols-[64px_1fr_1fr] items-center gap-2">
              <span className="text-[11.5px] font-semibold">{m.label}</span>
              <Input
                type="number"
                min={1}
                aria-label={`${m.label} threshold`}
                value={m.target}
                onChange={(e) => s.setRules({ milestones: s.rules.milestones.map((x, j) => (j === i ? { ...x, target: Math.max(1, Number(e.target.value) || 1) } : x)) })}
                className={`h-8 rounded-[8px] px-2 text-[12.5px] ${m.confirmed.target ? "" : "border-dashed border-airtel-warning"}`}
              />
              <Input
                type="number"
                min={0}
                placeholder="TBC"
                aria-label={`${m.label} reward`}
                value={m.reward ?? ""}
                onChange={(e) => s.setRules({ milestones: s.rules.milestones.map((x, j) => (j === i ? { ...x, reward: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) } : x)) })}
                className={`h-8 rounded-[8px] px-2 text-[12.5px] ${m.confirmed.reward ? "" : "border-dashed border-airtel-warning"}`}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-airtel-sub">Dashed fields are placeholders awaiting business confirmation. Attribution: first valid referral link opened.</p>
        <div className="mt-2 rounded-[10px] bg-airtel-warning-soft p-2 text-[10.5px] leading-[14px] text-airtel-warning-text">
          <p className="font-bold">Pending confirmation</p>
          <ul className="mt-0.5 list-disc pl-3.5">
            {PENDING_CONFIRMATION.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <Button size="sm" variant="ghost" className="mt-1 h-8 px-2 text-[12px]" onClick={() => s.setRules(DEFAULT_RULES)}>
          Restore default rules
        </Button>
      </Section>

      <div className="px-4 pt-3">
        <Button size="sm" variant="outline" block onClick={() => go(s.journey, s.journey === "A" ? "a_dashboard" : "b_sms")}>
          {s.journey === "A" ? "Open My Referrals" : "Open SMS inbox"}
        </Button>
      </div>
    </div>
  );
}
