# Airtel Refer & Earn — Interactive Prototype

High-fidelity, clickable prototype of the Refer & Earn experience for both journeys:

- **User A — Referrer**: homepage (bottom "Invite a Friend" creative + hamburger "Refer a Friend"), landing, milestones, contact permission, contact selection, invitation preview, sending animation, My Referrals, referral detail timeline, pending reward, reward unlocked.
- **User B — Referred friend**: incoming SMS on a phone mock → link tap → app installed (direct deep link) **or** app-store install (deferred deep link with automatic referral restore) → sign-in/OTP → eligibility (3 segments) → welcome home + benefit sheet → plans → payment → recharge success → referral completed.

Both journeys share one mock referral store (Zustand, persisted to `localStorage`), so User A sees User B's progress live.

## Refer a App experience (branch `refer-card`)

The referrer journey is rebuilt around one connected flow:

1. **Header**: back, "Refer a App", help sheet (how it works, FAQs, T&C, customer care).
2. **Proposition**: "Earn up to ₹5,000 a year" (from `yearlyEarningCap`).
3. **Interactive referral card** (`components/refer/ReferralCard.tsx`): shimmer, pointer/finger tilt with a responsive shadow and glare, spring 3D flip. The back explains how it works. Tap the card, press Enter/Space, or use "How it works".
4. **Invite a friend**: Invite Friends → permission → searchable multi-select contacts → **personalised envelope** (`InviteEnvelope.tsx`). The card slides into the envelope, a handwritten "Hi Priya, Aarav invited you to try Airtel!" appears, you confirm, it seals and flies, then "Your invite is sent!". Nothing is recorded before you confirm, and failure/offline states offer a retry.
5. **WhatsApp / SMS / any app** (`ShareCreative.tsx`): a customisable 1080×1350 creative (theme, friend name, personal note) exported as a PNG through the native share sheet, with `wa.me` / `sms:` fallbacks. The app never claims a message was sent. It asks "Did you send your invite?" before tracking it.
6. **Milestones** (`AchievementBadge.tsx`, `MilestoneCollection.tsx`): Bronze, Silver, Gold and Platinum collectible badges (metal rim, enamel, die-cut sticker edge). Tap one to flip it and see its status (earned / in progress / locked), reward, requirement and next tier. Each newly earned tier gets a one-time unlock celebration. Progress is capped at Platinum per month.
7. Minimal **How it works**, separate **FAQ** and **Terms & conditions** accordions, and a **Refer more. Earn more.** footer.

Visuals follow the **Gen4 Foundations** Figma library (decoded from the `.fig` export): semantic colour tokens (`refer.*` in `tailwind.config.js` map to `color/accent/heavy`, `color/primary/*`, `color/secondary/light`), the Inter type scale (Headline H5/H3 Black, Body SM/XS, Title SM/MD tracked caps), Shadow-Level2 (Default), and component specs for Top Nav (L1, 72px), Button · Primary · lg (56px, r16, Inter Bold 14), Card · Gradient (#FFF→#F5F5F5, #E6E9EF border, r16), Info Tag (pill, Bold Italic 11), Icon Action (64 ring / 60 cell), Carousel Dot and Link List.

Motion respects `prefers-reduced-motion`. On phone-sized screens (≤ 520px) the prototype runs full-screen without the device frame, so it can be tried on a real phone (`npm run dev -- --host`, then open the Network URL).

### Business rules awaiting confirmation

All values live in `src/config/businessRules.ts` and are editable in the developer panel. Unconfirmed ones are placeholders (dashed fields in the panel):

| Item | Status |
|---|---|
| First referral = ₹25 + Bronze | Confirmed |
| Platinum = ₹200, highest tier per month | Confirmed (threshold **not** confirmed, placeholder 30) |
| Silver / Gold thresholds and rewards | **Not confirmed**: placeholders 5 / 15, reward "to be announced" |
| Friend data benefit | **Not confirmed**: configurable, shown as "2 GB" |
| Reward release timing / validation window | **Not confirmed** |
| Final eligibility wording and legal T&C | **Not confirmed**: T&C shows only rule-derived points plus "Full programme terms will be published by Airtel" |
| Existing users with no qualifying transaction | **Not confirmed** (toggle in panel) |

### Tests

```bash
npm run test:e2e
```

Playwright runs every journey at 375×812, Pixel 7, 320×568 and in the desktop device frame: card flip, contacts, envelope send (single/multi/failure/offline), sharing hand-offs, milestones (earned/pending/locked/monthly cap), accordions, keyboard, reduced motion and layout overflow.

## Run locally

```bash
npm install
npm run dev
```

Production build: `npm run build` (output in `dist/`, relative base so it works on any sub-path).

## Preview controls (outside the phone)

- Journey dropdown, current screen, Prev / Next, progress, Reset journey, Reset prototype.
- **Scenario panel**: app installed, user segment, existing-user eligibility rule, link valid/expired/invalid, install / context-restore / registration outcomes, attribution, deadline, payment, contacts, network, share outcome, reward outcome, simulated past successes.
- **Jump to error / edge case**: all 20 User A and 16 User B error scenarios.
- **Business rules (provisional)**: reward amounts, ₹100 minimum, 24h link validity, 10-day first-transaction deadline, 30-day reward validation — editable live.

## Design system

UI components follow the **Gen4 Foundations** Figma library: colour primitives (black, blue-grey, gen4 red, green, yellow, blue), the Inter type scale (Headline H1–H6, Body XL–3XS, Title), Shadow-Level2, and component specs for Button (Primary/Brand/Secondary/Ghost/Accent/Tertiary/Alternate · 40/48/56), Info Tag, Card, Toast, Callout, Bottom Sheet/Modal, Top Nav, Field, Checkbox, Radio, Switch, Tabs, Progress bar and Notifier. Tokens live in `tailwind.config.js` (`airtel.*` / `gen4.*`); components in `src/components/ui`.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui components (Radix primitives, customised with Airtel tokens in `src/components/ui`) · Framer Motion · Lucide · Sonner · Zustand.

## Structure

```
src/
  config/businessRules.ts   provisional, configurable rules
  domain/                   types, statuses, screen registry, mock data
  store/useProto.ts         shared referral state + business logic
  components/ui/            shadcn/ui components (Airtel-styled)
  components/app/           app-level building blocks (timeline, error state, milestones…)
  components/device/        phone frame, status bar, screen transitions
  journeys/referrer/        User A screens (A01–A11)
  journeys/friend/          User B screens (B01–B10 + errors)
  panel/                    developer controls & scenario jumper
```

## Deploying to GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys on every push. One-time setup: **Settings → Pages → Source: GitHub Actions**.

All payments, SMS, installs and OTPs are simulated. No real transactions occur.
