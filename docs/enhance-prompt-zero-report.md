# Enhance Prompt Zero — Report

Branch: `enhance` · Scope: Refer & Earn landing (A02) and its two entry points. Visual language unchanged (Airtel Gen4 tokens, existing cards, buttons, coins, medals, illustrations).

## UX gaps found (audit)
| Area | Gap |
|---|---|
| Hero | Annual potential was a secondary dark strip; headline led with "₹25 each". Copy said reward is "credited when your friend registers", which contradicts the engine and the eligibility rules. |
| CTA | Primary action named "Invite from contacts", only in the footer. |
| How it works | 3 steps; qualifying action, deadline and cashback validity only in T&C. |
| Milestones | Track only — no badge, no cumulative earnings, no unlock moment, no motivation. Earned total and milestone count used different data (historic successes excluded from earnings). |
| Tracking | Landing showed counts only; statuses only in My Referrals. |
| FAQ / T&C | 4 FAQs; T&C incomplete (no caps, validity, attribution, badges). No support route. |
| States | No offline / empty activity state on the landing; repeated CTA taps could double-navigate. |
| Analytics | No analytics framework in the project. |

## Improvements implemented
1. **Hero** — "Earn up to ₹5,000 a year" is the primary message with a count-up (₹25 × 200/year cap). Existing `RewardCoin`s drop in and float. Chips: "Up to 50 invitations a month", "₹25 per successful referral". Disclaimer: maximum potential, not guaranteed. Primary CTA **Invite Friends** inside the hero.
2. **Sticky CTA** — appears only after the hero CTA scrolls away; tap-guarded against duplicates.
3. **How it works** — Invite → They join → Eligible action → You earn, plus a visible **Reward conditions** table.
4. **Your referral progress** — current badge (existing `MilestoneMedal`), cumulative earned, successful count, next achievement with `x / y` progress, existing `MilestoneTrack`, motivational line, Invite action. Empty state for no badge. Note: badges are recognition only.
5. **Milestone unlock moment** — sheet with badge reveal, earnings, next achievement, Invite Friends; shown once per new badge.
6. **Referral activity** — latest 3 invites with plain status + explanation; never "delivered" before confirmation, never "successful" on link open. Empty and offline (Retry) states.
7. **FAQs** — 9 questions from the brief, answered from configured rules. **T&C** — complete list incl. caps, validity, attribution, exclusions. **Support** row.
8. **Entry points** — Home card renamed "Invite a Friend", menu row renamed "Refer a Friend"; both open the same landing with the same state.
9. **Analytics** — `src/lib/analytics.ts` (`track`, `trackWhenVisible`); page view, hero CTA, invite, section views, milestone unlocked, activity opened, FAQ, terms, support.
10. **Data** — `earned` now includes historic successes so earnings, badges and milestones agree everywhere.

## Components reused
RewardCoin, MilestoneMedal, MilestoneTrack, ReferralLinkField, ShareRow, IconAction, SectionTitle, LinkButton, CARD surface, Button, Sheet, Accordion, ContactAvatar, existing hero illustration (gradient, rings, megaphone, avatars).

## Files changed
- `src/journeys/referrer/LandingScreen.tsx` (recomposed)
- `src/components/app/refer/EarnHero.tsx`, `HowItWorks.tsx`, `ReferralProgress.tsx`, `ReferralActivity.tsx`, `MilestoneUnlockSheet.tsx` (new)
- `src/lib/analytics.ts` (new)
- `src/store/useProto.ts` (cumulative earned)
- `src/components/app/AirtelHome.tsx`, `src/components/app/HamburgerMenu.tsx` (entry-point labels)

## Tests performed
Headless Chrome against the dev build: hero animation frames; count-up; reduced motion (375px) shows ₹5,000 immediately; 390px full-screen mobile; new user (empty progress + empty activity); 8 successful referrals (Bronze, 8/15 to Silver, unlock sheet); invites in activity; offline state + Retry; sticky CTA visibility; double-tap guard (single navigation); both entry points land on A02; analytics events emitted; no runtime errors; `tsc` + production build pass.

## Business rules requiring confirmation
1. **Referrer trigger** — the incentive doc says ₹25 "for every user that registers"; the mechanisms doc says ₹100 minimum transaction "for reward eligibility". The page now says the friend must complete an eligible recharge/bill payment of ₹100+ (matches the prototype engine). Confirm which is final.
2. **Caps** — 50/month, 200/year: is the cap on rewarded referrals or on invitations sent? Copy uses "invitations" in the hero chip per the brief and "rewarded referrals" in T&C.
3. **₹5,000/year** — derived from 200 × ₹25; confirm this is the approved headline figure.
4. **Milestone thresholds** — 1 / 5 / 15 / 30 are illustrative.
5. **10-day friend deadline, 30-day validation, 24-hour link validity** — carried over working assumptions.
6. **Cashback validity** — 30 days from allocation.

## Remaining blockers
- Referral caps are communicated but not enforced by the prototype engine.
- No real analytics SDK; events are buffered on `window.__referEvents`.
- Support route is simulated (toast).
