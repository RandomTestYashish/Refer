import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, ScreenBody } from "@/components/app/primitives";
import { HamburgerMenu } from "@/components/app/HamburgerMenu";
import { HeroCard } from "@/components/app/gen4";
import { home } from "@/assets/home";
import { useProto } from "@/store/useProto";
import { cn } from "@/lib/utils";

/**
 * Airtel home ("Manage Landing"), built 1:1 from Figma
 * Yashis-Imaginarium_22-jun · Page 31 · node 81392:10135.
 * Referral entry points: the "Refer & Get" tile, the "Refer Wi-Fi" tile, the curated
 * "Refer Wi-Fi" banner, and the hamburger menu (Rewards & OTTs → Refer a Friend).
 */

const outOfScope = (what: string) => toast(what, { description: "Not part of this Refer & Earn prototype." });

/* ---------- Shared atoms (Gen4 tokens copied from the Figma file) ---------- */

/** Section Title ✅ — Title/SM: Inter Bold 11/12, tracking 1.76px, uppercase, #3E4146. */
function SectionTitle({ children, action, tracking = 1.76, className }: { children: React.ReactNode; action?: React.ReactNode; tracking?: number; className?: string }) {
  return (
    <div className={cn("flex w-[343px] items-start gap-2", className)}>
      <p className="flex-1 text-[11px] font-bold uppercase leading-[12px] text-[#3E4146]" style={{ letterSpacing: tracking }}>
        {children}
      </p>
      {action}
    </div>
  );
}

/** Clip Tag ✅ — gradient label with SVG "ankles". */
function ClipTag({ children, size }: { children: React.ReactNode; size: "lg" | "sm" }) {
  const lg = size === "lg";
  return (
    <div className="flex items-center" style={{ height: lg ? 20 : 16 }}>
      <img src={home(lg ? "clip-left-lg.svg" : "clip-left-sm.svg")} alt="" style={{ width: lg ? 13.012 : 10.41, height: lg ? 20 : 16 }} />
      <div
        className={cn("flex items-center justify-center whitespace-nowrap py-[2px] font-bold italic text-white", lg ? "h-5 text-[12px] leading-[14px]" : "h-4 text-[10px] leading-[12px]")}
        style={{ backgroundImage: lg ? "linear-gradient(180deg,#FC5252,#E32121)" : "linear-gradient(0deg,#000,#2D2B2B)" }}
      >
        {children}
      </div>
      <img src={home(lg ? "clip-right-lg.svg" : "clip-right-sm.svg")} alt="" style={{ width: lg ? 13.012 : 10.409, height: lg ? 20 : 16 }} />
    </div>
  );
}

const CARD_SURFACE = "border border-[#E6E9EF] bg-[linear-gradient(180deg,#FFFFFF,#F5F5F5)]";

/** _ATOM - Illustrative Grid Tiles 🚫 — 103×112 card, title on top, art in the bottom 60px. */
function GridTile({ label, img, tag, onClick }: { label: string; img: string; tag?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("relative flex h-[112px] w-[103px] shrink-0 flex-col items-center rounded-[16px] pt-4 active:scale-[0.97]", CARD_SURFACE)}>
      <img src={home(img)} alt="" className="absolute bottom-0 left-0 h-[60px] w-[101px] rounded-b-[16px] object-cover" />
      {tag && (
        <div className="absolute left-1/2 top-[-5px] -translate-x-1/2">
          <ClipTag size="sm">{tag}</ClipTag>
        </div>
      )}
      <p className="relative w-full px-4 text-center text-[12px] font-semibold leading-[14px] text-[#292C31]">{label}</p>
    </button>
  );
}

/** Icon-action base: 60px elevated circle inside a 64px ring, with Shadow-Level1. */
function IconActionShell({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative size-[60px] drop-shadow-[0_5px_2.81px_rgba(143,165,227,0.2)]">
      <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F0F4F9]" />
      <span className="absolute left-1/2 top-1/2 size-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[linear-gradient(180deg,#F0F4F9,#FFFFFF)]" />
      {children}
    </span>
  );
}

/** Icon-action ✅ — icon + 11px label. `highlight` adds the gradient ring used on Recharge. */
function IconAction({ label, icon, highlight, onClick }: { label: string; icon?: string; highlight?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-[74px] shrink-0 flex-col items-center gap-2 active:scale-95">
      <IconActionShell>
        {highlight && (
          // Icon-button ✅ highlight ring (Figma 81392:10174), flipped vertically as in the file.
          <span className="absolute left-1/2 top-1/2 size-[60px] -translate-x-1/2 -translate-y-1/2 -scale-y-100">
            <img src={home("ms-hl-last.svg")} alt="" className="absolute inset-0 size-full" />
            <img src={home("ms-hl-flourish.svg")} alt="" className="absolute left-[-2px] top-[-2px] size-16 max-w-none" />
          </span>
        )}
        {icon ? (
          <img src={home(icon)} alt="" className="absolute left-1/2 top-1/2 size-[21px] -translate-x-1/2 -translate-y-1/2" />
        ) : (
          // Outline/Categories — 2×2 squares drawn with 1.2px borders.
          <span className="absolute left-1/2 top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 grid-cols-2 gap-[3.4px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="border-[1.2px] border-black" />
            ))}
          </span>
        )}
      </IconActionShell>
      <span className="w-full text-center text-[11px] font-medium leading-[14px] text-[#292C31]">{label}</span>
    </button>
  );
}

function Arrow({ src, size }: { src: string; size: number }) {
  return (
    <span className="relative block" style={{ width: size, height: size, padding: size * 0.0833 }}>
      <img src={home(src)} alt="" className="size-full" />
    </span>
  );
}

/* ---------- Screen ---------- */

export type ReferEntry = "home_creative" | "menu";

/**
 * The Airtel Home ("Manage Landing"), shared by both journeys.
 * `top` fills the blue-grey band (Pack Status for the referrer, Welcome + reward for the friend).
 * Referral entry points only appear when `onRefer` is provided.
 */
export function AirtelHome({
  top,
  onRefer,
  onMyReferrals,
  onRecharge,
  profile,
}: {
  top: React.ReactNode;
  onRefer?: (entry: ReferEntry) => void;
  onMyReferrals?: () => void;
  onRecharge?: () => void;
  profile?: { initials: string; name: string; phone: string };
}) {
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState("All");
  const rules = useProto((s) => s.rules);

  const closeMenuThen = (fn: () => void) => {
    setMenu(false);
    setTimeout(fn, 220);
  };
  const refer = () => (onRefer ? onRefer("home_creative") : outOfScope("Refer & Earn"));
  const recharge = () => (onRecharge ? onRecharge() : outOfScope("Recharge"));

  return (
    <Screen className="bg-white">
      <ScreenBody className="pb-[150px]">
        {/* Top Nav Component ✅ — 81392:10177 */}
        <header className="flex h-[69px] items-center px-5">
          <button aria-label="Open menu" onClick={() => setMenu(true)} className="p-1 active:opacity-60">
            <span className="flex size-8 items-center justify-center">
              <img src={home("nav-menu.svg")} alt="" className="h-[11.42px] w-[17.2px]" />
            </span>
          </button>
          <div className="flex-1" />
          <button aria-label="Search" onClick={() => outOfScope("Search")} className="p-1 active:opacity-60">
            <span className="flex size-8 items-center justify-center">
              <img src={home("nav-search.svg")} alt="" className="size-[26.67px]" />
            </span>
          </button>
          <button aria-label="Scan QR" onClick={() => outOfScope("Scan QR")} className="ml-1 active:opacity-70">
            <img src={home("nav-scanqr.png")} alt="" className="h-10 w-[100px] object-contain" />
          </button>
        </header>

        {/* App-Top-Nav_Refresh ✅ — 81392:10136 */}
        <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-4 pb-[14px]">
          {[
            { label: "All", icon: "cat-all-home.svg", w: 24.64, h: 25.6 },
            { label: "Prepaid", icon: "cat-prepaid.svg", w: 26.67, h: 26.67 },
            { label: "Postpaid", icon: "cat-postpaid.svg", w: 21.33, h: 28, tag: true },
            { label: "Wi-Fi", icon: "cat-wifi.svg", w: 25.5, h: 28 },
            { label: "Digital TV", icon: "cat-tv.svg", w: 28, h: 28 },
          ].map((c) => {
            const active = tab === c.label;
            return (
              <button key={c.label} onClick={() => (c.label === "All" ? setTab("All") : outOfScope(c.label))} className="flex w-16 shrink-0 flex-col items-center gap-2">
                <span className={cn("relative size-16 overflow-hidden rounded-[16px]", active ? "bg-[#CDD3DD]" : "bg-[#F0F4F9]")}>
                  {active && (
                    <>
                      {[0, 1, 2, 3].map((i) => (
                        <img key={i} src={home("cat-all-bg.svg")} alt="" className="absolute left-[0.94px] top-[0.94px] size-[62px]" />
                      ))}
                      <img src={home("cat-all-bg2.svg")} alt="" className="absolute left-[0.94px] top-[0.94px] size-[62px]" />
                    </>
                  )}
                  {c.tag && (
                    <>
                      <img src={home("cat-postpaid-tag.svg")} alt="" className="absolute left-[0.26px] top-[46.17px] h-[17.835px] w-[63.487px]" />
                      <span className="absolute left-[32.5px] top-[47.88px] -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold italic leading-[12px] text-[#04388B]">Unlimited</span>
                    </>
                  )}
                  <img src={home(c.icon)} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: c.w, height: c.h }} />
                </span>
                <span className="flex h-7 flex-col items-center justify-center gap-2">
                  <span className={cn("text-[12px] leading-[14px] text-[#292C31]", active ? "font-bold" : "font-normal")}>{c.label}</span>
                  {active && <span className="h-[2px] w-8 rounded-full bg-[linear-gradient(0deg,#FC5252,#E32121)]" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top band — Rectangle 81392:10137; the card inside is supplied per user (Pack Status / Welcome) */}
        <div className="bg-[#F0F4F9] px-4 pb-4 pt-[22px]">
          <div className="flex flex-col items-center gap-4">{top}</div>
        </div>

        {/* My services — 81392:10138 */}
        <div className="mt-8 px-4">
          <SectionTitle>my services</SectionTitle>
          <div className="mt-[14px] flex gap-2">
            <button onClick={() => outOfScope("My services")} className={cn("relative h-[72px] w-[170px] shrink-0 overflow-hidden rounded-full text-left", CARD_SURFACE)}>
              <img src={home("svc-airtel.png")} alt="" className="absolute left-[9px] top-[9px] size-[52px] rounded-full object-cover" />
              <p className="absolute left-[68px] right-3 top-4 text-[13px] font-bold leading-[18px] text-black">5 Services</p>
              <span className="absolute left-[70px] top-[34px] h-[26px] w-[82px] overflow-hidden">
                <span className="mt-1 inline-flex animate-marquee whitespace-nowrap text-[12px] leading-[18px] text-[#DA9802]">
                  {Array.from({ length: 4 }, (_, i) => (
                    <span key={i} className="pr-6">
                      Prepaid expiring in 1 day
                    </span>
                  ))}
                </span>
              </span>
            </button>
            <button onClick={() => outOfScope("Airtel Payments Bank")} className={cn("relative h-[72px] w-[170px] shrink-0 rounded-full text-left", CARD_SURFACE)}>
              <img src={home("svc-bank-circle.svg")} alt="" className="absolute left-[9px] top-[9px] size-[52px]" />
              <img src={home("svc-bank.png")} alt="" className="absolute left-5 top-5 size-[31px] object-cover" />
              <p className="absolute left-[68px] right-3 top-4 text-[13px] font-bold leading-[18px] text-black">XXX9929</p>
              <p className="absolute left-[68px] top-9 text-[13px] leading-[18px] text-[#656565]">₹</p>
              <span className="absolute left-[80px] top-[39px] flex">
                {[0, 1, 2, 3].map((i) => (
                  <img key={i} src={home("svc-asterisk.svg")} alt="" className="size-3" />
                ))}
              </span>
            </button>
          </div>
        </div>

        {/* Refer & Earn ingress — composed from Next Best Action atoms */}
        {onRefer && (
        <div className="mt-8 px-4">
          <SectionTitle>invite &amp; earn</SectionTitle>
          <HeroCard className="mt-4">
            <button onClick={refer} className="flex w-full items-center gap-3 text-left" aria-label="Refer & Earn">
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-5 text-[#292C31]">Invite a Friend</span>
                <span className="mt-1 block text-[12px] leading-[18px] text-[#3E4146]">
                  Earn up to ₹{(rules.referrerReward * rules.referralCapYear).toLocaleString("en-IN")} a year. ₹{rules.referrerReward} cashback for every successful referral.
                </span>
              </span>
              <img src={home("tile-refer.png")} alt="" className="h-[64px] w-[104px] shrink-0 object-contain" />
            </button>
            <div className="mt-4 flex gap-3">
              <button onClick={() => (onMyReferrals ? onMyReferrals() : outOfScope("My Referrals"))} className="flex h-10 flex-1 items-center justify-center rounded-[12px] border border-[#E6E9EF] bg-white text-[14px] font-medium text-[#485B76] active:bg-[#F0F4F9]">
                My Referrals
              </button>
              <button onClick={refer} className="flex h-10 flex-1 items-center justify-center rounded-[12px] bg-black text-[14px] font-medium text-white active:bg-[#3E4146]">
                Invite now
              </button>
            </div>
          </HeroCard>
        </div>
        )}

        {/* Buy Airtel products — Illustrative Grid ✅ 81392:10171 */}
        <div className="mt-8 flex flex-col gap-4 px-4">
          <SectionTitle
            action={
              <button onClick={() => outOfScope("View all")} className="-mt-1 flex h-5 items-center text-[14px] font-medium leading-4 text-[#075EE8]">
                View all
              </button>
            }
          >
            Buy airtel products
          </SectionTitle>
          {[
            [
              { l: "Insta EMI Card", i: "buy-emi.png" },
              { l: "Gold Loan", i: "buy-gold.png" },
              { l: "Credit Card", i: "buy-credit.png" },
            ],
            [
              { l: "Fixed Deposit", i: "buy-fd.png" },
              { l: "Refer Wi-Fi", i: "buy-referwifi.png", tag: `₹${rules.referrerReward} off`, refer: true },
              { l: "Postpaid", i: "buy-postpaid.png" },
            ],
            [
              { l: "IPTV", i: "buy-iptv.png" },
              { l: "Bundle your services", i: "buy-bundle.png" },
              { l: "New Prepaid", i: "buy-prepaid.png" },
            ],
          ].map((row, r) => (
            <div key={r} className="flex gap-[17px]">
              {row.map((t) => (
                <GridTile key={t.l} label={t.l} img={t.i} tag={"tag" in t ? t.tag : undefined} onClick={"refer" in t ? refer : () => outOfScope(t.l)} />
              ))}
            </div>
          ))}
        </div>

        {/* Manage services — Icon Action Grid_Refresh ✅ 81392:10173 */}
        <div className="mt-[34px] flex flex-col gap-4 px-4">
          <SectionTitle>Manage services</SectionTitle>
          {[
            [
              { l: "Recharge", i: "ms-recharge.svg", hl: true },
              { l: "Pay Bills", i: "ms-paybill.svg" },
              { l: "Claim OTTs & More", i: "ms-claim.svg" },
              { l: "International Roaming", i: "ms-roaming.svg" },
            ],
            [
              { l: "My Wi-Fi", i: "ms-wifi.svg" },
              { l: "Upgrade to Postpaid", i: "ms-upgrade.svg" },
              { l: "Manage Family", i: "ms-family.svg" },
              { l: "More", i: undefined },
            ],
          ].map((row, r) => (
            <div key={r} className="flex items-start gap-4">
              {row.map((a) => (
                <IconAction key={a.l} label={a.l} icon={a.i} highlight={"hl" in a} onClick={a.l === "Recharge" ? recharge : () => outOfScope(a.l)} />
              ))}
            </div>
          ))}
        </div>

        {/* Explore Airtel products — 81392:10178 */}
        <div className="mt-8 flex flex-col gap-4 px-4">
          <SectionTitle>Explore AIRTEL PRODUCTS</SectionTitle>
          <div className="flex gap-2">
            <button onClick={() => outOfScope("Fast Lane Postpaid")} className="relative h-[119px] w-[109px] shrink-0 overflow-hidden rounded-[16px] text-left active:scale-[0.97]" style={{ backgroundImage: "linear-gradient(138.15deg, #E80000 4.33%, #FF4100 100%)" }}>
              <img src={home("ex-postpaid-bg.svg")} alt="" className="absolute left-0 top-0 h-[119px] w-[109px]" />
              <img src={home("ex-fastlane.png")} alt="" className="absolute left-[60px] top-2 h-[34px] w-[31px] object-contain object-bottom" />
              <p className="absolute left-3 top-[73px] w-[59px] text-[11px] font-semibold leading-4 text-white">
                Fast Lane
                <br />
                Postpaid
              </p>
              <span className="absolute left-[80.5px] top-[88px]">
                <Arrow src="ex-arrow.svg" size={18} />
              </span>
            </button>
            <button onClick={() => outOfScope("Prepaid SIM")} className="relative h-[119px] w-[109px] shrink-0 overflow-hidden rounded-[16px] text-left active:scale-[0.97]" style={{ backgroundImage: "linear-gradient(138.64deg, #B41E65 4.84%, #E43387 98.16%)" }}>
              <img src={home("ex-prepaid-c1.svg")} alt="" className="absolute left-[29px] top-[-30px] size-24" />
              <img src={home("ex-prepaid-c2.svg")} alt="" className="absolute left-[43px] top-[-16px] size-[69px]" />
              <img src={home("ex-sim-shadow.svg")} alt="" className="absolute left-[66.54px] top-[37.45px] h-[3.1px] w-[22px] -rotate-[2.87deg]" />
              <img src={home("ex-sim.png")} alt="" className="absolute left-[55px] top-[6px] h-[37px] w-[44.6px] object-cover" />
              <p className="absolute left-3 top-[74px] w-16 text-[11px] font-semibold leading-4 text-white">
                Prepaid
                <br />
                SIM
              </p>
              <span className="absolute left-[80.5px] top-[88px]">
                <Arrow src="ex-arrow.svg" size={18} />
              </span>
            </button>
            <button onClick={() => outOfScope("Expert Wi-Fi")} className="relative h-[119px] w-[109px] shrink-0 overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#413982,#5B5493)] text-left active:scale-[0.97]">
              <img src={home("ex-wifi-bg.svg")} alt="" className="absolute left-0 top-0 h-[119px] w-[109px]" />
              <img src={home("ex-wifi.png")} alt="" className="absolute left-[60.5px] top-[6px] size-[37px] object-cover opacity-[0.89]" />
              <p className="absolute left-3 top-[74px] w-[57px] text-[11px] font-semibold leading-4 text-white">
                Expert
                <br />
                Wi-Fi
              </p>
              <span className="absolute left-[80.5px] top-[89px]">
                <Arrow src="ex-arrow.svg" size={18} />
              </span>
            </button>
          </div>
        </div>

        {/* Curated for you — Growth Inventory_New ✅ 81392:10214 */}
        <div className="mt-8 flex flex-col gap-4">
          <SectionTitle className="mx-4">curated for you</SectionTitle>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4">
            <button onClick={refer} className="shrink-0 snap-start active:scale-[0.99]" aria-label="Refer Wi-Fi">
              <img src={home("cur-1.png")} alt="Get ₹300 off on your next bill — Refer Wi-Fi" className="h-[182px] w-[303px] rounded-[16px] object-cover" />
            </button>
            <button onClick={() => outOfScope("Offer")} className="shrink-0 snap-start active:scale-[0.99]">
              <img src={home("cur-2.png")} alt="" className="h-[182px] w-[303px] rounded-[16px] object-cover" />
            </button>
          </div>
        </div>

        {/* Call Manager / Rewards & OTTs / Refer & Get — Illustrative Grid ✅ 81392:10224 */}
        <div className="mt-8 flex gap-4 px-4">
          <GridTile label="Call Manager" img="tile-callmgr.png" onClick={() => outOfScope("Call Manager")} />
          <GridTile label="Rewards & OTTs" img="tile-rewards.png" onClick={() => outOfScope("Rewards & OTTs")} />
          <GridTile label={`Refer & Get ₹${rules.referrerReward}`} img="tile-refer.png" onClick={refer} />
        </div>

        {/* Recharge for others — 81392:10215 */}
        <div className="mt-8">
          <SectionTitle className="ml-[21px]" tracking={2.76}>
            RECHARGE FOR OTHERS
          </SectionTitle>
          <button onClick={() => outOfScope("Recharge for others")} className="ml-1 mt-[6px] block active:opacity-90">
            <img src={home("rfo.jpg")} alt="Box Office Pack ₹200 · 3GB/day for 3 days ₹39" className="h-[185px] w-[371px] object-cover" />
          </button>
        </div>

        {/* You might like — Growth inventory_Old ✅ 81392:10218 */}
        <div className="ml-5 mt-8 flex w-[355px] flex-col gap-3">
          <SectionTitle className="w-[335px]">you might like</SectionTitle>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pr-4">
            {["like-1.png", "like-2.png", "like-3.png"].map((src, i) => (
              <button key={src} onClick={() => outOfScope(["Get a free SIM", "Combine services", "Offer"][i])} className="h-[240px] w-[160px] shrink-0 overflow-hidden rounded-[16px] active:scale-[0.99]">
                <img src={home(src)} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Featuring fresh — Growth Inventory_New ✅ 81392:10219 */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <SectionTitle>featuring fresh</SectionTitle>
          <div className="flex w-[375px] items-center justify-center gap-4 overflow-hidden">
            <img src={home("fresh-1.png")} alt="" className="h-[274px] w-[264px] shrink-0" />
            <button onClick={() => outOfScope("CN Classics")} className="shrink-0 active:scale-[0.99]">
              <img src={home("fresh-2.png")} alt="Watch CN Classics on channel 445" className="h-[306px] w-[300px]" />
            </button>
            <img src={home("fresh-3.png")} alt="" className="h-[274px] w-[264px] shrink-0" />
          </div>
        </div>

        {/* Claim your benefits — Product Showcase ✅ 81392:10221 */}
        <div className="relative mt-8 h-[374px] w-[375px] overflow-hidden">
          <img src={home("show-bg.png")} alt="" className="absolute inset-0 size-full object-cover" />
          <p className="absolute left-[22px] top-[63px] text-[42px] font-bold leading-[50px] tracking-[-0.63px] text-white">Claim</p>
          <p className="absolute left-[25px] top-[117px] text-[12px] font-bold uppercase leading-normal tracking-[4px] text-white">YOUR benefits</p>
          <div className="no-scrollbar absolute bottom-6 left-0 right-0 flex gap-3 overflow-x-auto px-4">
            {[
              { logo: "show-adobe.png", t: "Adobe Express", d: ["12 months for FREE worth ₹4000"], cta: "CLAIM NOW" },
              { logo: "show-netflix.png", t: "Netflix", d: ["1 month FREE", "worth ₹999"], cta: "CLAIM NOW" },
              { logo: "show-third.png", t: "Lorem ipsum", d: ["Lorem ipsum dolor sit amet consectetur."], cta: "BUTTON" },
            ].map((c) => (
              <button
                key={c.t}
                onClick={() => outOfScope(c.t)}
                className="flex h-[180px] w-[158px] shrink-0 flex-col items-start gap-3 rounded-[16px] border border-white bg-white/10 p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              >
                <img src={home(c.logo)} alt="" className="size-12 rounded-[4px] object-cover" />
                <span className="flex w-full flex-col gap-3">
                  <span className="flex flex-col gap-1 text-white">
                    <span className="text-[14px] font-bold leading-5 mix-blend-luminosity">{c.t}</span>
                    <span className="text-[12px] leading-[18px]">
                      {c.d.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[11px] font-bold leading-[14px] text-white mix-blend-luminosity">{c.cta}</span>
                    <Arrow src="show-arrow.svg" size={16} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </ScreenBody>

      {/* Bottom Nav_Refresh ✅ — 81392:10176 */}
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[152px]">
        <div className="absolute bottom-0 h-[120px] w-full bg-[linear-gradient(180deg,rgba(247,249,252,0)_10%,#F7F9FC_38.17%,#F7F9FC_80.42%)]" />
        <div className="pointer-events-auto absolute left-1/2 top-16 h-16 w-[343px] -translate-x-1/2 rounded-full border border-[#E6F0FF] bg-white">
          <span className="absolute left-[5px] top-[3px] h-14 w-[100px] rounded-full border border-[#E6F0FF] bg-[#FBFCFD]" />
          <div className="relative flex h-16 items-center gap-[34px] px-8 py-1">
            {[
              { l: "Manage", i: "bn-manage.svg", active: true },
              { l: "Finance", i: "bn-finance.svg" },
              { l: "Family", i: "bn-family.svg" },
              { l: "Ask Us", i: "bn-askus.svg" },
            ].map((n) => (
              <button key={n.l} onClick={() => !n.active && outOfScope(n.l)} className="flex size-11 shrink-0 flex-col items-center justify-center">
                <span className="flex size-8 items-center justify-center">
                  <img src={home(n.i)} alt="" className="size-[21px]" />
                </span>
                <span className={cn("whitespace-nowrap text-[10px] leading-3", n.active ? "font-bold text-[#FD2F36]" : "font-normal text-[#292C31]")}>{n.l}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <HamburgerMenu
        open={menu}
        onOpenChange={setMenu}
        profile={profile}
        onRefer={onRefer ? () => closeMenuThen(() => onRefer("menu")) : undefined}
        onMyReferrals={onMyReferrals ? () => closeMenuThen(onMyReferrals) : undefined}
      />
    </Screen>
  );
}

/** Next Best Action_Refresh ✅ (81392:10175) — the referrer's Pack Status card. */
export function PackStatusTop({ onRecharge }: { onRecharge?: () => void }) {
  return (
    <>
            <div className={cn("relative flex w-[343px] flex-col items-center gap-5 rounded-[16px] px-4 pb-6 pt-5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.04)]", CARD_SURFACE)}>
              <div className="flex w-full items-center gap-4">
                <div className="flex flex-1 items-center gap-1">
                  <span className="relative size-4">
                    <img src={home("nba-prepaid.svg")} alt="" className="absolute left-[1.33px] top-[1.33px] size-[13.33px]" />
                  </span>
                  <p className="text-[12px] font-semibold leading-[14px] text-[#FD2F36]">Prepaid</p>
                </div>
                <p className="flex-1 text-right text-[12px] font-semibold leading-[14px] text-[#292C31]">9876543210</p>
              </div>
              <div className="flex w-full flex-col gap-1 pb-2 pt-1 text-center text-[14px]">
                <p className="font-bold leading-4 text-[#292C31]">Your ₹399 pack is expiring today</p>
                <p className="font-medium leading-5 text-[#3E4146]">Recharge now to avoid service interruption and continue enjoying your benefits.</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-center gap-4">
              <button onClick={() => outOfScope("Explore Packs")} className="flex h-10 w-[163.5px] items-center justify-center rounded-[12px] border border-[#E6E9EF] bg-white px-3 text-[14px] font-medium leading-4 text-[#485B76] active:bg-[#F0F4F9]">
                Explore Packs
              </button>
              <button onClick={() => (onRecharge ? onRecharge() : outOfScope("Recharge"))} className="flex h-10 w-[163.5px] items-center justify-center rounded-[12px] border border-black bg-black px-1 text-[14px] font-medium leading-4 text-white active:bg-[#3E4146]">
                Recharge Now
              </button>
            </div>
    </>
  );
}
