import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { home } from "@/assets/home";
import { useProto } from "@/store/useProto";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Left hamburger menu, built 1:1 from Figma Yashis-Imaginarium_22-jun · node 81409:12642 ("Hamburger").
 * 329px white drawer: profile with progress ring, expandable "✅ Hamburger Menu" rows, version footer.
 * "Rewards & OTTs" expands to the Refer & Earn entry point (A02 via hamburger).
 */

const PROFILE = { initials: "SS", name: "Sharon Stone", phone: "+91 9899699969" };

const SERVICES: { label: string; sub?: string[] }[] = [
  { label: "Postpaid • 0987654321", sub: ["Call Manager", "View Bills and Payments", "Activate International Roaming", "View Plan Details"] },
  { label: "Prepaid • 0987654321", sub: ["Recharge", "View Plan Details", "Call Manager"] },
  { label: "Wi-Fi • 01234567897_dsl", sub: ["View Bills and Payments", "Manage Wi-Fi"] },
  { label: "DTH • 0123456789876", sub: ["Recharge", "Manage Channels"] },
];

const outOfScope = (what: string) => toast(what, { description: "Not part of this Refer & Earn prototype." });

function Icon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  // Outline icons are drawn in a "Live-container" inset 8.33% inside their box.
  return (
    <span className={cn("relative block shrink-0", className)} style={{ width: size, height: size, padding: size * 0.0833 }}>
      <img src={home(name)} alt="" className="size-full" />
    </span>
  );
}

function Divider() {
  return <div className="mx-auto h-px w-[297px] shrink-0 bg-[#E6E9EF]" />;
}

/** One "✅ Hamburger Menu" row: 48px icon tile · title/subtext · chevron. */
function Row({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open?: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <button onClick={onToggle} className="flex w-full items-start gap-3 px-4 text-left" aria-expanded={children ? open : undefined}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#F0F4F9]">
          <Icon name="hm-user.svg" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 self-stretch leading-[18px]">
          <span className="text-[16px] font-bold text-[#1A1A1A]">{title}</span>
          <span className="text-[12px] text-[#696B6F]">{subtitle}</span>
        </span>
        <Icon name="hm-chevron.svg" />
      </button>
      <AnimatePresence initial={false}>
        {open && children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 🚫ATOM - hamburger-category-list-item: "Postpaid • number  +" with optional grey sub-list. */
function Category({ label, sub, open, onToggle }: { label: string; sub?: string[]; open: boolean; onToggle: () => void }) {
  return (
    <div className="flex w-[329px] flex-col gap-4">
      <button onClick={onToggle} className="flex w-full items-center gap-2 pl-[76px] pr-4 text-left">
        <span className="flex-1 text-[14px] leading-4 text-[#3E4146]">{label}</span>
        <Icon name="hm-add.svg" size={20} />
      </button>
      <AnimatePresence initial={false}>
        {open && sub && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="flex flex-col gap-6 bg-[#F0F4F9] py-6 pl-[76px] pr-4">
              {sub.map((s) => (
                <button key={s} onClick={() => outOfScope(s)} className="w-[237px] text-left text-[14px] leading-4 text-[#3E4146]">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HamburgerMenu({
  open,
  onOpenChange,
  onRefer,
  onMyReferrals,
  profile = PROFILE,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Referral entry points are shown only when provided (referrer journey). */
  onRefer?: () => void;
  onMyReferrals?: () => void;
  profile?: { initials: string; name: string; phone: string };
}) {
  const rules = useProto((s) => s.rules);
  const notices = useProto((s) => s.notices);
  const markRead = useProto((s) => s.markNoticesRead);
  const unread = notices.filter((n) => !n.read).length;
  const [expanded, setExpanded] = useState<string | null>("services");
  const [category, setCategory] = useState<string | null>(SERVICES[0].label);
  const toggle = (id: string) => setExpanded((e) => (e === id ? null : id));

  const showNotices = () => {
    if (notices.length === 0) toast("You're all caught up", { description: "No new notifications." });
    else {
      toast(notices[0].text, { description: unread > 1 ? `+${unread - 1} more referral update(s)` : "Referral update" });
      markRead();
    }
  };

  const ROWS: { id: string; title: string; subtitle: string; body?: React.ReactNode }[] = [
    { id: "new", title: "New Connections", subtitle: "Buy new postpaid, Prepaid, Wi-Fi & more" },
    { id: "recharge", title: "Recharge & Pay Bills", subtitle: "Pay for mobile, electricity, FASTag & more" },
    { id: "bank", title: "Bank and UPI", subtitle: "Manage your Banking and UPI services" },
    {
      id: "rewards",
      title: "Rewards & OTTs",
      subtitle: `₹${rules.referrerReward} cashback on each referral`,
      body: onRefer ? (
        <div className="flex flex-col gap-6 bg-[#F0F4F9] py-6 pl-[76px] pr-4">
          <button onClick={onRefer} className="flex w-[237px] items-center gap-2 text-left text-[14px] font-semibold leading-4 text-[#292C31]">
            Refer a Friend
          </button>
          <button onClick={() => onMyReferrals?.()} className="w-[237px] text-left text-[14px] leading-4 text-[#3E4146]">
            My Referrals
          </button>
          <button onClick={() => outOfScope("Claim OTTs")} className="w-[237px] text-left text-[14px] leading-4 text-[#3E4146]">
            Claim OTTs & More
          </button>
        </div>
      ) : undefined,
    },
    { id: "safety", title: "Safety Report", subtitle: "Check number of prevented fraud attempts" },
    { id: "subs", title: "Subscriptions", subtitle: "Manage OTT, books, music subscriptions" },
    { id: "orders", title: "Order & Requests", subtitle: "Track your order & view status of requests" },
    { id: "hellotunes", title: "Set Hellotunes", subtitle: "Set your favourite tunes for your callers" },
    { id: "txn", title: "Transaction History", subtitle: "View past payments & UPI transfers" },
    { id: "settings", title: "Settings", subtitle: "Accounts, payment & bank, privacy & security" },
    { id: "about", title: "About Airtel", subtitle: "Set your favourite tunes for your callers" },
    { id: "notifications", title: "Notification", subtitle: unread > 0 ? `${unread} new referral update${unread > 1 ? "s" : ""}` : "Lorem ip sum" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" hideClose className="w-[329px] bg-white pt-[44px] shadow-[8px_0_32px_rgba(0,0,0,0.18)]">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Airtel app menu</SheetDescription>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-8">
          {/* Profile — 81409:12670 */}
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="relative flex size-[88px] items-center justify-center p-2">
              <img src={home("hm-progress.svg")} alt="" className="absolute inset-[-2.06%] size-[104.12%] max-w-none" />
              <div className="flex size-[72px] items-center justify-center rounded-full border border-[#9CBFF6] bg-[#E6F0FF] text-[20px] leading-[22px] text-[#292C31]">{profile.initials}</div>
            </div>
            <div className="flex w-full flex-col items-center gap-1 text-center text-[#292C31]">
              <p className="text-[16px] font-bold leading-[18px]">{profile.name}</p>
              <p className="text-[12px] font-light leading-[18px]">{profile.phone}</p>
            </div>
            <button onClick={() => outOfScope("Edit Profile")} className="flex h-5 items-center text-[14px] font-medium leading-[18px] text-[#075EE8]">
              Edit Profile
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {/* My Active Services — 81409:12671 */}
            <Divider />
            <Row title="My Active Services" subtitle="View and manage your plans & services" open={expanded === "services"} onToggle={() => toggle("services")}>
              <div className="flex flex-col gap-6 pb-1">
                {SERVICES.map((s) => (
                  <Category key={s.label} label={s.label} sub={s.sub} open={category === s.label} onToggle={() => setCategory((c) => (c === s.label ? null : s.label))} />
                ))}
              </div>
            </Row>

            {onRefer && (
              <>
            {/* Refer & Earn — dedicated ingress */}
            <Divider />
            <button onClick={onRefer} className="flex w-full items-start gap-3 px-4 text-left">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#FC5252,#E32121)] text-white">
                <Gift className="size-[22px]" strokeWidth={1.6} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 self-stretch leading-[18px]">
                <span className="flex items-center gap-2 text-[16px] font-bold text-[#1A1A1A]">
                  Refer &amp; Earn
                </span>
                <span className="text-[12px] text-[#696B6F]">₹{rules.referrerReward} cashback for every friend who registers</span>
              </span>
              <Icon name="hm-chevron.svg" className="-rotate-90" />
            </button>
            <button onClick={() => onMyReferrals?.()} className="-mt-3 ml-[76px] w-fit text-[14px] font-medium leading-4 text-[#075EE8]">
              My Referrals
            </button>
              </>
            )}

            {ROWS.map((r) => (
              <React.Fragment key={r.id}>
                <Divider />
                <Row
                  title={r.title}
                  subtitle={r.subtitle}
                  open={expanded === r.id}
                  onToggle={() => (r.body ? toggle(r.id) : r.id === "notifications" ? showNotices() : outOfScope(r.title))}
                >
                  {r.body}
                </Row>
              </React.Fragment>
            ))}
          </div>

          {/* Footer — 81409:12684 + Version */}
          <button onClick={showNotices} className="ml-4 mt-6 flex items-center gap-2">
            <span className="text-[16px] font-bold leading-[18px] text-[#1A1A1A]">Notification</span>
            <Icon name="hm-chevron.svg" className="-rotate-90" />
          </button>
          <p className="mt-6 text-center text-[12px] leading-[18px] text-[#3E4146]">Version4.81.0</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
