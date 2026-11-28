import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CircleHelp, History, LogOut, Settings, UserRound, Users } from "lucide-react";
import { ContactAvatar, Screen, ScreenBody } from "@/components/app/primitives";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProto } from "@/store/useProto";
import { REFERRER } from "@/domain/data";
import { haptic } from "@/lib/device";
import { cn, inr } from "@/lib/utils";

import navMenu from "@/assets/home/nav-menu.svg";
import navSearch from "@/assets/home/nav-search.svg";
import navScanQr from "@/assets/home/nav-scanqr.png";
import tabAllBg from "@/assets/home/tab-all-bg.svg";
import tabAllBg2 from "@/assets/home/tab-all-bg2.svg";
import tabAll from "@/assets/home/tab-all.svg";
import tabPrepaid from "@/assets/home/tab-prepaid.svg";
import tabPostpaid from "@/assets/home/tab-postpaid.svg";
import tabUnlimited from "@/assets/home/tab-unlimited.svg";
import tabWifi from "@/assets/home/tab-wifi.svg";
import tabDtv from "@/assets/home/tab-dtv.svg";
import nbaPrepaid from "@/assets/home/nba-prepaid.svg";
import clipRedL from "@/assets/home/clip-red-l.svg";
import clipRedR from "@/assets/home/clip-red-r.svg";
import clipBlackL from "@/assets/home/clip-black-l.svg";
import clipBlackR from "@/assets/home/clip-black-r.svg";
import svc1 from "@/assets/home/svc-1.png";
import svc2 from "@/assets/home/svc-2.png";
import svc2Ring from "@/assets/home/svc-2-ring.svg";
import asterisk from "@/assets/home/asterisk.svg";
import buy1 from "@/assets/home/buy-1.png";
import buy2 from "@/assets/home/buy-2.png";
import buy3 from "@/assets/home/buy-3.png";
import buy4 from "@/assets/home/buy-4.png";
import buy5 from "@/assets/home/buy-5.png";
import buy6 from "@/assets/home/buy-6.png";
import buy7 from "@/assets/home/buy-7.png";
import buy8 from "@/assets/home/buy-8.png";
import buy9 from "@/assets/home/buy-9.png";
import icn1 from "@/assets/home/svc-icn-1.svg";
import icn2 from "@/assets/home/svc-icn-2.svg";
import icn3 from "@/assets/home/svc-icn-3.svg";
import icn4 from "@/assets/home/svc-icn-4.svg";
import icn5 from "@/assets/home/svc-icn-5.svg";
import icn6 from "@/assets/home/svc-icn-6.svg";
import icn7 from "@/assets/home/svc-icn-7.svg";
import hlLast from "@/assets/home/highlight-last.svg";
import hlFlourish from "@/assets/home/highlight-flourish.svg";
import hlFirst from "@/assets/home/highlight-first.svg";
import exPostpaid from "@/assets/home/explore-postpaid.png";
import exPrepaid from "@/assets/home/explore-prepaid.png";
import exWifi from "@/assets/home/explore-wifi.png";
import exPostpaidBg from "@/assets/home/explore-postpaid-bg.svg";
import exWifiBg from "@/assets/home/explore-wifi-bg.svg";
import exPrepaidE1 from "@/assets/home/explore-prepaid-e1.svg";
import exPrepaidE2 from "@/assets/home/explore-prepaid-e2.svg";
import arrowWhite from "@/assets/home/arrow-white.svg";
import arrowWhite16 from "@/assets/home/arrow-white-16.svg";
import curated2 from "@/assets/home/curated-2.png";
import gridCall from "@/assets/home/grid-call.png";
import gridRewards from "@/assets/home/grid-rewards.png";
import gridRefer from "@/assets/home/grid-refer.png";
import rechargeOthers from "@/assets/home/recharge-others.jpg";
import like1 from "@/assets/home/like-1.png";
import like2 from "@/assets/home/like-2.png";
import like3 from "@/assets/home/like-3.png";
import fresh1 from "@/assets/home/fresh-1.png";
import fresh2 from "@/assets/home/fresh-2.png";
import fresh3 from "@/assets/home/fresh-3.png";
import claimBg from "@/assets/home/claim-bg.jpg";
import claimAdobe from "@/assets/home/claim-adobe.png";
import claimNetflix from "@/assets/home/claim-netflix.png";
import claim3 from "@/assets/home/claim-3.png";
import bnManage from "@/assets/home/bn-manage.svg";
import bnFinance from "@/assets/home/bn-finance.svg";
import bnFamily from "@/assets/home/bn-family.svg";
import bnAskUs from "@/assets/home/bn-askus.svg";
import { LogoTile } from "@/components/refer/LogoTile";
import { LogoFamily } from "@/components/refer/LogoFamily";

/**
 * A01 — Airtel home (Gen4 "Refresh" home page from Figma).
 * Entry points into Refer a App: the "Curated for you" ₹5000 banner and the hamburger menu.
 */

const outOfScope = (what: string) => toast(what, { description: "Not part of this Refer a App prototype." });

/** Gen4 Section Title · Title/SM single-line */
function SectionTitle({ children, action, className, style }: { children: ReactNode; action?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("flex w-[343px] items-start gap-2", className)}>
      <h2 className="flex-1 text-[11px] font-bold uppercase leading-[12px] tracking-[1.76px] text-[#3E4146]" style={style}>
        {children}
      </h2>
      {action}
    </div>
  );
}

function ViewAll({ label }: { label: string }) {
  return (
    <button onClick={() => outOfScope(label)} className="h-5 text-[14px] font-medium leading-[16px] text-[#075EE8]">
      View all
    </button>
  );
}

/** Gen4 Clip Tag with ankles */
function ClipTag({ children, tone }: { children: ReactNode; tone: "red" | "black" }) {
  const red = tone === "red";
  return (
    <span className="flex items-center" aria-hidden={false}>
      <img src={red ? clipRedL : clipBlackL} alt="" className={red ? "h-5 w-[13px]" : "h-4 w-[10.4px]"} />
      <span
        className={cn("flex items-center whitespace-nowrap font-bold italic text-white", red ? "h-5 text-[12px] leading-[14px]" : "h-4 text-[10px] leading-[12px]")}
        style={{ background: red ? "linear-gradient(#FC5252,#E32121)" : "linear-gradient(0deg,#000,#2D2B2B)" }}
      >
        {children}
      </span>
      <img src={red ? clipRedR : clipBlackR} alt="" className={red ? "h-5 w-[13px]" : "h-4 w-[10.4px]"} />
    </span>
  );
}

const CARD = "border border-[#E6E9EF] bg-gradient-to-b from-white to-[#F5F5F5]";

/** Gen4 Illustrative Grid tile (103 × 112) */
function GridTile({ label, img, tag, onClick }: { label: string; img: string; tag?: string; onClick?: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick ?? (() => outOfScope(label))} className={cn("relative flex h-[112px] w-[103px] shrink-0 flex-col items-center rounded-[16px] pt-4", CARD)}>
      <img src={img} alt="" className="absolute bottom-0 left-0 h-[60px] w-[101px] rounded-b-[16px] object-cover" />
      {tag && (
        <span className="absolute -top-[5px] left-1/2 -translate-x-1/2">
          <ClipTag tone="black">{tag}</ClipTag>
        </span>
      )}
      <span className="relative w-full px-4 text-center text-[12px] font-semibold leading-[14px] text-[#292C31]">{label}</span>
    </motion.button>
  );
}

/** Gen4 Icon Action (60 cell + 64 ring) */
function IconAction({ label, icon, highlight }: { label: string; icon: ReactNode; highlight?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={() => outOfScope(label)} className="flex w-[74px] flex-col items-center gap-2">
      <span className="relative size-[60px] drop-shadow-[0_5px_2.81px_rgba(143,165,227,0.2)]">
        <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F0F4F9]" />
        <span className="absolute left-1/2 top-1/2 size-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gradient-to-b from-[#F0F4F9] to-white" />
        {highlight && (
          <span className="absolute inset-0 -scale-y-100" aria-hidden>
            <img src={hlLast} alt="" className="absolute inset-0 size-[60px]" />
            <img src={hlFlourish} alt="" className="absolute -inset-[2px] size-16" />
            <img src={hlFirst} alt="" className="absolute inset-0 size-[60px]" />
          </span>
        )}
        <span className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center p-1">{icon}</span>
      </span>
      <span className="min-h-[28px] w-full text-center text-[11px] font-medium leading-[14px] text-[#292C31]">{label}</span>
    </motion.button>
  );
}

const ICON = (src: string) => <img src={src} alt="" className="size-[21px]" />;

const TABS = [
  { label: "All", icon: tabAll },
  { label: "Prepaid", icon: tabPrepaid },
  { label: "Postpaid", icon: tabPostpaid, unlimited: true },
  { label: "Wi-Fi", icon: tabWifi },
  { label: "Digital TV", icon: tabDtv },
];

/**
 * Curated for you · Refer a App ingress (Figma refer_2, frame 81784:17004).
 * Built from the frame's layers so the copy and the Invite Friends button are live.
 */
/**
 * Curated for you · Refer banner. Same world as the Refer story it opens: black card, Airtel-red glow,
 * the 3D Airtel logo framed by the "Airtel family" of small logos, and the prize up front.
 */
function CuratedReferCard({ yearly, onOpen }: { yearly: number; onOpen: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      data-testid="home-refer-banner"
      className="relative h-[182px] w-[303px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-[16px] bg-black text-white"
    >
      {/* Ember glow, rising behind the logo */}
      <motion.div
        className="pointer-events-none absolute -bottom-16 -right-10 h-[220px] w-[300px]"
        style={{ background: "radial-gradient(closest-side, #FF4A2E 0%, #E2262C 30%, #A3161C 55%, rgba(0,0,0,0) 100%)" }}
        animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      {/* The Airtel family around the big logo */}
      <div className="absolute inset-y-0 right-0 w-[170px] [mask-image:radial-gradient(closest-side,#000_45%,transparent_100%)]">
        <LogoFamily width={170} height={182} cx={92} cy={86} gap={27} icon={14} hole={50} tone="dark" />
      </div>
      <div className="absolute left-[191px] top-[48px]">
        <LogoTile size={76} depth={8} glow={false} />
      </div>

      <div className="relative flex h-full flex-col justify-between p-5 pr-0">
        <div>
          <p className="text-[10.5px] font-semibold uppercase leading-[12px] tracking-[2.5px] text-white/65">Refer &amp; win</p>
          <p className="mt-2 text-[14px] font-medium leading-[16px] text-white/90">Win up to</p>
          <p className="mt-0.5 text-[38px] font-bold leading-[42px] tracking-[-0.8px] tabular">{inr(yearly)}</p>
          <p className="text-[13px] leading-[16px] text-white/75">a year</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          aria-label={`Invite friends and win up to ${inr(yearly)} a year`}
          className="flex h-9 w-fit items-center justify-center rounded-full bg-white px-4 text-[12.6px] font-medium leading-[14.4px] text-black active:bg-white/85"
        >
          Invite friends
        </button>
      </div>
    </motion.div>
  );
}

export function HomeScreen() {
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState(0);
  const navigate = useProto((s) => s.navigate);
  const rules = useProto((s) => s.rules);

  const openRefer = (entry: "home_creative" | "menu") => {
    haptic(8);
    setMenu(false);
    setTimeout(() => navigate("a_intro", { entry }), entry === "menu" ? 180 : 0);
  };

  return (
    <Screen className="relative bg-white">
      {/* Gen4 Top Nav · L0 */}
      <header className="flex h-[69px] shrink-0 items-center justify-between bg-white px-5">
        <button aria-label="Open menu" onClick={() => setMenu(true)} className="flex size-10 items-center justify-center rounded-full active:bg-black/5">
          <img src={navMenu} alt="" className="h-[11.4px] w-[17.2px]" />
        </button>
        <div className="flex items-center gap-1">
          <button aria-label="Search" onClick={() => outOfScope("Search")} className="flex size-10 items-center justify-center rounded-full active:bg-black/5">
            <img src={navSearch} alt="" className="size-[26.7px]" />
          </button>
          <button aria-label="Scan QR" onClick={() => outOfScope("Scan QR")} className="h-10 w-[100px]">
            <img src={navScanQr} alt="" className="size-full object-contain" />
          </button>
        </div>
      </header>

      <ScreenBody className="pb-[150px]">
        {/* App top nav tabs */}
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pt-3" role="tablist" aria-label="Services">
          {TABS.map((t, i) => {
            const on = i === tab;
            return (
              <button key={t.label} role="tab" aria-selected={on} onClick={() => setTab(i)} className="flex w-16 shrink-0 flex-col items-center gap-2">
                <span className={cn("relative size-16 overflow-hidden rounded-[16px]", on ? "bg-[#CDD3DD]" : "bg-[#F0F4F9]")}>
                  {on && (
                    <>
                      <img src={tabAllBg} alt="" className="absolute inset-[1.5%] size-[97%]" />
                      <img src={tabAllBg2} alt="" className="absolute inset-[1.5%] size-[97%]" />
                    </>
                  )}
                  {t.unlimited && (
                    <span className="absolute bottom-0 left-0 h-[17.8px] w-full">
                      <img src={tabUnlimited} alt="" className="absolute inset-0 size-full" />
                      <span className="absolute inset-x-0 top-[1.7px] text-center text-[10px] font-semibold italic leading-[12px] text-[#04388B]">Unlimited</span>
                    </span>
                  )}
                  <img src={t.icon} alt="" className={cn("absolute left-1/2 -translate-x-1/2 -translate-y-1/2", t.unlimited ? "top-[42%] size-7" : "top-1/2 size-7")} />
                </span>
                <span className={cn("flex h-7 items-center text-[12px] leading-[14px] text-[#292C31]", on ? "font-bold" : "font-normal")}>{t.label}</span>
                <span className={cn("-mt-2 h-[2px] w-8 rounded-full", on ? "bg-gradient-to-b from-[#FC5252] to-[#E32121]" : "bg-transparent")} />
              </button>
            );
          })}
        </div>

        {/* Next Best Action on #F0F4F9 band */}
        <section className="mt-2 bg-[#F0F4F9] px-4 py-[22px]">
          <div className={cn("relative flex flex-col items-center gap-5 rounded-[16px] px-4 pb-6 pt-5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.04)]", CARD)}>
            <span className="absolute -top-[7px] left-1/2 -translate-x-1/2">
              <ClipTag tone="red">Pack Status</ClipTag>
            </span>
            <div className="flex w-full items-center gap-4">
              <span className="flex flex-1 items-center gap-1">
                <img src={nbaPrepaid} alt="" className="size-[13.3px]" />
                <span className="text-[12px] font-semibold leading-[14px] text-[#FD2F36]">Prepaid</span>
              </span>
              <span className="flex-1 text-right text-[12px] font-semibold leading-[14px] text-[#292C31] tabular">9876543210</span>
            </div>
            <div className="flex w-full flex-col gap-1 pb-2 pt-1 text-center text-[14px]">
              <p className="font-bold leading-[16px] text-[#292C31]">Your ₹399 pack is expiring today</p>
              <p className="font-medium leading-[20px] text-[#3E4146]">Recharge now to avoid service interruption and continue enjoying your benefits.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button onClick={() => outOfScope("Explore Packs")} className="h-10 w-[163.5px] rounded-[12px] border border-[#E6E9EF] bg-white text-[14px] font-medium leading-[16px] text-[#485B76] active:scale-[0.98]">
              Explore Packs
            </button>
            <button onClick={() => outOfScope("Recharge")} className="h-10 w-[163.5px] rounded-[12px] border border-black bg-black text-[14px] font-medium leading-[16px] text-white active:scale-[0.98]">
              Recharge Now
            </button>
          </div>
        </section>

        {/* My services */}
        <section className="mt-8 px-4">
          <SectionTitle>my services</SectionTitle>
          <div className="mt-[14px] flex gap-2">
            <button onClick={() => outOfScope("My services")} className={cn("relative h-[72px] w-[170px] shrink-0 rounded-full text-left", CARD)}>
              <img src={svc1} alt="" className="absolute left-[9px] top-[9px] size-[52px] rounded-full object-cover" />
              <span className="absolute left-[69px] top-[16px] text-[13px] font-bold leading-[18px] text-black">5 Services</span>
              <span className="absolute left-[71px] top-[34px] h-[26px] w-[82px] overflow-hidden">
                <motion.span
                  className="absolute top-[4px] whitespace-nowrap text-[12px] leading-[18px] text-[#DA9802]"
                  animate={{ x: [0, -168] }}
                  transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                >
                  Prepaid expiring in 1 day&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Prepaid expiring in 1 day
                </motion.span>
              </span>
            </button>
            <button onClick={() => outOfScope("My services")} className={cn("relative h-[72px] w-[170px] shrink-0 rounded-full text-left", CARD)}>
              <img src={svc2Ring} alt="" className="absolute left-[9px] top-[9px] size-[52px]" />
              <img src={svc2} alt="" className="absolute left-[20px] top-[20px] size-[31px] object-cover" />
              <span className="absolute left-[69px] top-[16px] text-[13px] font-bold leading-[18px] text-black">XXX9929</span>
              <span className="absolute left-[69px] top-[36px] flex items-center gap-0 text-[13px] leading-[18px] text-[#656565]">
                ₹
                {[0, 1, 2, 3].map((i) => (
                  <img key={i} src={asterisk} alt="" className="size-3" />
                ))}
              </span>
            </button>
          </div>
        </section>

        {/* Buy airtel products */}
        <section className="mt-8 px-4">
          <SectionTitle action={<ViewAll label="Buy airtel products" />}>Buy airtel products</SectionTitle>
          <div className="mt-4 grid grid-cols-[repeat(3,103px)] gap-x-[17px] gap-y-4">
            {[
              ["Insta EMI Card", buy1],
              ["Gold Loan", buy2],
              ["Credit Card", buy3],
              ["Fixed Deposit", buy4],
              ["Refer Wi-Fi", buy5, "₹300 off"],
              ["Postpaid", buy6],
              ["IPTV", buy7],
              ["Bundle your services", buy8],
              ["New Prepaid", buy9],
            ].map(([l, img, tag]) => (
              <GridTile key={l} label={l} img={img} tag={tag} />
            ))}
          </div>
        </section>

        {/* Manage services */}
        <section className="mt-8 px-4">
          <SectionTitle>Manage services</SectionTitle>
          <div className="mt-4 grid grid-cols-[repeat(4,74px)] gap-x-[16px] gap-y-4">
            <IconAction label="Recharge" icon={ICON(icn1)} highlight />
            <IconAction label="Pay Bills" icon={ICON(icn2)} />
            <IconAction label="Claim OTTs & More" icon={ICON(icn3)} />
            <IconAction label="International Roaming" icon={ICON(icn4)} />
            <IconAction label="My Wi-Fi" icon={ICON(icn5)} />
            <IconAction label="Upgrade to Postpaid" icon={ICON(icn6)} />
            <IconAction label="Manage Family" icon={ICON(icn7)} />
            <IconAction
              label="More"
              icon={
                <span className="grid size-5 grid-cols-2 gap-[3.3px]" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="border-[1.2px] border-black" />
                  ))}
                </span>
              }
            />
          </div>
        </section>

        {/* Explore airtel products */}
        <section className="mt-8 px-4">
          <SectionTitle style={{ lineHeight: "14px" }}>Explore airtel products</SectionTitle>
          <div className="mt-4 flex gap-2">
            <ExploreCard label={["Fast Lane", "Postpaid"]} bg="linear-gradient(138deg,#E80000 4.3%,#FF4100 100%)" pattern={exPostpaidBg}>
              <img src={exPostpaid} alt="" className="absolute left-[60px] top-[8px] h-[34px] w-[31px] object-contain object-bottom" />
            </ExploreCard>
            <ExploreCard label={["Prepaid", "SIM"]} bg="linear-gradient(138.6deg,#B41E65 4.8%,#E43387 98%)">
              <img src={exPrepaidE1} alt="" className="absolute left-[29px] top-[-30px] size-24" />
              <img src={exPrepaidE2} alt="" className="absolute left-[43px] top-[-16px] size-[69px]" />
              <img src={exPrepaid} alt="" className="absolute left-[55px] top-[6px] h-[37px] w-[44.6px] object-cover" />
            </ExploreCard>
            <ExploreCard label={["Expert", "Wi-Fi"]} bg="linear-gradient(#413982,#5B5493)" pattern={exWifiBg}>
              <img src={exWifi} alt="" className="absolute left-[60.5px] top-[6px] size-[37px] object-cover opacity-90" />
            </ExploreCard>
          </div>
        </section>

        {/* Curated for you — Refer a App ingress */}
        <section className="mt-8">
          <SectionTitle className="mx-4">curated for you</SectionTitle>
          <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4">
            <CuratedReferCard yearly={rules.yearlyEarningCap} onOpen={() => openRefer("home_creative")} />
            <button onClick={() => outOfScope("Offer")} className="relative h-[182px] w-[303px] shrink-0 snap-start overflow-hidden rounded-[16px]">
              <img src={curated2} alt="" className="size-full object-cover" />
            </button>
            <span className="w-px shrink-0" aria-hidden />
          </div>
        </section>

        {/* Quick tiles */}
        <section className="mt-8 flex gap-4 px-4">
          <GridTile label="Call Manager" img={gridCall} />
          <GridTile label="Rewards & OTTs" img={gridRewards} />
          <GridTile label="Refer & Get ₹300" img={gridRefer} onClick={() => openRefer("home_creative")} />
        </section>

        {/* Recharge for others */}
        <section className="mt-8">
          <SectionTitle className="ml-[21px]" style={{ letterSpacing: "2.76px" }}>
            Recharge for others
          </SectionTitle>
          <button onClick={() => outOfScope("Recharge for others")} className="ml-1 mt-[6px] block h-[185px] w-[371px]">
            <img src={rechargeOthers} alt="Box Office Pack ₹200 and 3GB/day for 3 days ₹39" className="size-full object-cover" />
          </button>
        </section>

        {/* You might like */}
        <section className="mt-8 pl-5">
          <SectionTitle style={{ color: "#3E4146" }}>you might like</SectionTitle>
          <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto pr-4">
            {[like1, like2, like3].map((src, i) => (
              <button key={i} onClick={() => outOfScope("Offer")} className="h-[240px] w-[160px] shrink-0 overflow-hidden rounded-[16px]">
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* Featuring fresh */}
        <section className="mt-8">
          <SectionTitle className="mx-4">featuring fresh</SectionTitle>
          <div className="mt-4 flex items-center justify-center gap-4 overflow-hidden">
            <img src={fresh1} alt="" className="h-[274px] w-[264px] shrink-0" />
            <button onClick={() => outOfScope("Watch CN Classics")} className="shrink-0">
              <img src={fresh2} alt="Watch CN Classics on channel 445" className="h-[306px] w-[300px]" />
            </button>
            <img src={fresh3} alt="" className="h-[274px] w-[264px] shrink-0" />
          </div>
        </section>

        {/* Claim your benefits */}
        <section className="relative mt-8 h-[374px] overflow-hidden">
          <img src={claimBg} alt="" className="absolute inset-0 size-full object-cover" />
          <p className="absolute left-[22px] top-[63px] text-[42px] font-bold leading-[50px] tracking-[-0.63px] text-white">Claim</p>
          <p className="absolute left-[25px] top-[117px] text-[12px] font-bold uppercase tracking-[4px] text-white">Your benefits</p>
          <div className="no-scrollbar absolute bottom-6 left-0 flex w-full gap-3 overflow-x-auto px-4">
            {[
              { logo: claimAdobe, t: "Adobe Express", d: "12 months for FREE worth ₹4000" },
              { logo: claimNetflix, t: "Netflix", d: "1 month FREE worth ₹999" },
              { logo: claim3, t: "More benefits", d: "Explore everything included in your plan." },
            ].map((c) => (
              <button key={c.t} onClick={() => outOfScope(c.t)} className="flex h-[180px] w-[158px] shrink-0 flex-col gap-3 rounded-[16px] border border-white bg-white/10 p-4 text-left text-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <img src={c.logo} alt="" className="size-12 rounded-[4px] bg-white object-contain" />
                <span className="flex flex-col gap-1">
                  <span className="text-[14px] font-bold leading-[20px]">{c.t}</span>
                  <span className="text-[12px] leading-[18px]">{c.d}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold leading-[14px]">
                  CLAIM NOW <img src={arrowWhite16} alt="" className="size-[13.3px]" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </ScreenBody>

      {/* Gen4 Bottom Nav · Refresh */}
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[120px] bg-gradient-to-b from-[rgba(247,249,252,0)] from-10% via-[#F7F9FC] via-[38%] to-[#F7F9FC]" aria-label="Primary">
        <div className="pointer-events-auto absolute bottom-6 left-1/2 h-16 w-[343px] -translate-x-1/2 rounded-full border border-[#E6F0FF] bg-white">
          <span className="absolute left-[5px] top-[3px] h-14 w-[100px] rounded-full border border-[#E6F0FF] bg-[#FBFCFD]" aria-hidden />
          <div className="relative flex h-16 items-center gap-[34px] px-8">
            {[
              { l: "Manage", i: bnManage, on: true },
              { l: "Finance", i: bnFinance },
              { l: "Family", i: bnFamily },
              { l: "Ask Us", i: bnAskUs },
            ].map((b) => (
              <button key={b.l} aria-current={b.on ? "page" : undefined} onClick={() => (b.on ? undefined : outOfScope(b.l))} className="flex size-11 flex-col items-center justify-center">
                <span className="flex size-8 items-center justify-center">
                  <img src={b.i} alt="" className="size-[21px]" />
                </span>
                <span className={cn("text-[10px] leading-[12px]", b.on ? "font-bold text-[#FD2F36]" : "text-[#292C31]")}>{b.l}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hamburger menu drawer — second Refer entry point */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[300px] pt-[var(--sb,44px)]" hideClose>
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

/** Gen4 product tile (109 × 119) with gradient, decorative art and arrow */
function ExploreCard({ label, bg, pattern, children }: { label: [string, string]; bg: string; pattern?: string; children: ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => outOfScope(label.join(" "))}
      className="relative h-[119px] w-[109px] shrink-0 overflow-hidden rounded-[16px] text-left"
      style={{ backgroundImage: bg }}
    >
      {pattern && <img src={pattern} alt="" className="absolute inset-0 size-full" />}
      {children}
      <span className="absolute left-3 top-[73px] text-[11px] font-semibold leading-[16px] text-white">
        {label[0]}
        <br />
        {label[1]}
      </span>
      <img src={arrowWhite} alt="" className="absolute left-[82px] top-[89.5px] size-[15px]" />
    </motion.button>
  );
}
