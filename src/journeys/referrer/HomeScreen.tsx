import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Compass,
  Gift,
  History,
  Home,
  LogOut,
  Menu,
  Music2,
  PhoneCall,
  Receipt,
  Settings,
  ShieldCheck,
  Smartphone,
  Tv,
  UserRound,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Screen, ScreenBody, Wordmark, ContactAvatar } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Badge, Notifier } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProto } from "@/store/useProto";
import { REFERRER } from "@/domain/data";

const SERVICES = [
  { icon: Zap, label: "Recharge" },
  { icon: Receipt, label: "Pay Bills" },
  { icon: PhoneCall, label: "Call Manager" },
  { icon: Music2, label: "HelloTune" },
  { icon: ShieldCheck, label: "Safety Report" },
  { icon: Tv, label: "Xstream" },
  { icon: Wallet, label: "Payments" },
  { icon: Compass, label: "More" },
];

const outOfScope = (what: string) => toast(`${what}`, { description: "Not part of this Refer & Earn prototype." });

export function HomeScreen() {
  const [menu, setMenu] = useState(false);
  const navigate = useProto((s) => s.navigate);
  const rules = useProto((s) => s.rules);
  const notices = useProto((s) => s.notices);
  const markRead = useProto((s) => s.markNoticesRead);
  const unread = notices.filter((n) => !n.read).length;

  const openRefer = (entry: "home_creative" | "menu") => {
    setMenu(false);
    setTimeout(() => navigate("a_landing", { entry }), entry === "menu" ? 180 : 0);
  };

  return (
    <Screen className="bg-airtel-surface">
      {/* Top navigation */}
      <header className="flex h-14 shrink-0 items-center gap-2 bg-white px-3">
        <button aria-label="Open menu" onClick={() => setMenu(true)} className="flex size-10 items-center justify-center rounded-full active:bg-black/5">
          <Menu className="size-6" />
        </button>
        <Wordmark />
        <div className="flex-1" />
        <button
          aria-label="Notifications"
          onClick={() => {
            if (notices.length === 0) toast("You're all caught up", { description: "No new notifications." });
            else {
              toast(notices[0].text, { description: unread > 1 ? `+${unread - 1} more referral update(s)` : "Referral update" });
              markRead();
            }
          }}
          className="relative flex size-10 items-center justify-center rounded-full active:bg-black/5"
        >
          <Bell className="size-[22px]" />
          {unread > 0 && (
            <Notifier count={unread} className="absolute -right-0.5 top-0.5" />
          )}
        </button>
        <button aria-label="Profile" onClick={() => setMenu(true)} className="rounded-full">
          <ContactAvatar name={REFERRER.name} hue={350} size={34} />
        </button>
      </header>

      <ScreenBody className="pb-4">
        {/* Account card */}
        <div className="bg-white px-5 pb-5 pt-2">
          <p className="text-[13px] text-airtel-sub">Hi {REFERRER.first} 👋</p>
          <div className="mt-3 rounded-[18px] bg-airtel-ink p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-white/60">Prepaid · {REFERRER.phone}</p>
                <p className="mt-0.5 text-[17px] font-semibold">₹299 Unlimited</p>
              </div>
              <Badge className="bg-white/15 text-white">5G</Badge>
            </div>
            <div className="mt-4 flex items-end justify-between text-[12px] text-white/70">
              <span>
                <b className="text-[20px] font-bold text-white">1.2 GB</b> left of 2 GB today
              </span>
              <span>Expires in 12 days</span>
            </div>
            <Progress value={60} className="mt-2 h-1.5 bg-white/15" indicatorClassName="bg-white" />
            <Button size="sm" className="mt-4 w-full bg-white text-airtel-ink shadow-none hover:bg-white/90" onClick={() => outOfScope("Recharge")}>
              Recharge now
            </Button>
          </div>
        </div>

        {/* Services */}
        <div className="mt-2 bg-white px-3 py-4">
          <div className="grid grid-cols-4 gap-y-4">
            {SERVICES.map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => outOfScope(label)} className="flex flex-col items-center gap-1.5 active:scale-95">
                <span className="flex size-12 items-center justify-center rounded-[15px] bg-airtel-surface">
                  <Icon className="size-[22px] text-airtel-ink" strokeWidth={1.8} />
                </span>
                <span className="text-[11.5px] font-medium text-airtel-ink">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Offers */}
        <div className="mt-2 bg-white py-4">
          <p className="mb-3 px-5 text-[15px] font-bold">For you</p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
            {[
              { t: "Unlimited 5G", s: "On all plans ₹239+", c: "from-[#1F2937] to-[#111827]" },
              { t: "Xstream Play", s: "20+ OTTs in one app", c: "from-[#4C1D95] to-[#1E1B4B]" },
              { t: "Airtel Black", s: "One bill. One call centre.", c: "from-[#0F172A] to-[#334155]" },
            ].map((o) => (
              <button
                key={o.t}
                onClick={() => outOfScope(o.t)}
                className={`flex h-[104px] w-[220px] shrink-0 flex-col justify-end rounded-[16px] bg-gradient-to-br p-4 text-left text-white ${o.c}`}
              >
                <span className="text-[15px] font-bold">{o.t}</span>
                <span className="text-[12px] text-white/70">{o.s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Usage strip */}
        <div className="mt-2 bg-white px-5 py-4">
          <button onClick={() => outOfScope("Usage details")} className="flex w-full items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-airtel-surface">
              <Smartphone className="size-5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[14px] font-semibold">Usage & history</span>
              <span className="block text-[12px] text-airtel-sub">Calls, data and recharges</span>
            </span>
            <ChevronRight className="size-5 text-airtel-sub" />
          </button>
        </div>

        {/* ENTRY POINT 1 — Homepage bottom creative */}
        <div className="mt-2 bg-white px-5 pb-5 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => openRefer("home_creative")}
            className="relative w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#E4002B] to-[#B8001F] p-5 text-left text-white shadow-red"
            aria-label="Invite a Friend"
          >
            <span className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
            <span className="absolute -bottom-14 right-8 size-32 rounded-full bg-white/[0.07]" />
            <motion.span
              className="absolute right-5 top-6 flex size-[62px] items-center justify-center rounded-[18px] bg-white/15 backdrop-blur"
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.5 }}
            >
              <Gift className="size-8" />
            </motion.span>
            <span className="relative block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">Refer & Earn</span>
            <span className="relative mt-1 block text-[22px] font-bold leading-[26px] tracking-[-0.02em]">Invite a Friend</span>
            <span className="relative mt-1.5 block max-w-[200px] text-[13px] leading-[18px] text-white/85">
              You get ₹{rules.referrerReward}. Your friend gets ₹{rules.friendReward}.
            </span>
            <span className="relative mt-4 inline-flex h-9 items-center gap-1 rounded-full bg-white px-4 text-[13px] font-bold text-airtel-red">
              Invite now <ChevronRight className="size-4" />
            </span>
          </motion.button>
        </div>
      </ScreenBody>

      {/* Bottom navigation */}
      <nav className="flex h-[78px] shrink-0 items-start justify-around border-t border-airtel-line bg-white pt-2">
        {[
          { icon: Home, label: "Home", active: true },
          { icon: Compass, label: "Explore" },
          { icon: Wallet, label: "Pay" },
          { icon: CircleHelp, label: "Help" },
        ].map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            onClick={() => !active && outOfScope(label)}
            className={`flex w-16 flex-col items-center gap-1 text-[11px] font-semibold ${active ? "text-airtel-red" : "text-airtel-sub"}`}
          >
            <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
            {label}
          </button>
        ))}
      </nav>

      {/* ENTRY POINT 2 — Hamburger menu drawer */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[300px] pt-[44px]" hideClose>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Airtel app menu</SheetDescription>
          <div className="flex items-center gap-3 px-5 py-5">
            <ContactAvatar name={REFERRER.name} hue={350} size={48} />
            <div>
              <p className="text-[16px] font-bold">{REFERRER.name}</p>
              <p className="text-[12px] text-airtel-sub">{REFERRER.phone}</p>
            </div>
          </div>
          <Separator />
          <nav className="flex flex-col py-2">
            {[
              { icon: UserRound, label: "My Account" },
              { icon: History, label: "Recharge History" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => outOfScope(label)} className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium active:bg-airtel-surface">
                <Icon className="size-5 text-airtel-sub" />
                {label}
              </button>
            ))}
            <button
              onClick={() => openRefer("menu")}
              className="mx-3 my-1 flex items-center gap-3.5 rounded-[12px] bg-airtel-red-soft px-2 py-3 text-[15px] font-semibold text-airtel-red active:scale-[0.98]"
            >
              <span className="flex size-8 items-center justify-center rounded-[9px] bg-airtel-red text-white">
                <Users className="size-[18px]" />
              </span>
              Refer a Friend
              <Badge className="ml-auto">Earn ₹{rules.referrerReward}</Badge>
            </button>
            {[
              { icon: Settings, label: "Settings" },
              { icon: CircleHelp, label: "Help & Support" },
              { icon: LogOut, label: "Log out" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => outOfScope(label)} className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium active:bg-airtel-surface">
                <Icon className="size-5 text-airtel-sub" />
                {label}
              </button>
            ))}
          </nav>
          <p className="mt-auto px-5 pb-8 text-[11px] text-[#A3A3A3]">Airtel Thanks · v8.4 (prototype)</p>
        </SheetContent>
      </Sheet>
    </Screen>
  );
}
