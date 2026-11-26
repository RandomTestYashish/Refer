# Airtel Refer & Earn — Interactive Prototype

High-fidelity, clickable prototype of the Refer & Earn experience for both journeys:

- **User A — Referrer**: homepage (bottom "Invite a Friend" creative + hamburger "Refer a Friend"), landing, milestones, contact permission, contact selection, invitation preview, sending animation, My Referrals, referral detail timeline, pending reward, reward unlocked.
- **User B — Referred friend**: incoming SMS on a phone mock → link tap → app installed (direct deep link) **or** app-store install (deferred deep link with automatic referral restore) → sign-in/OTP → eligibility (3 segments) → welcome home + benefit sheet → plans → payment → recharge success → referral completed.

Both journeys share one mock referral store (Zustand, persisted to `localStorage`), so User A sees User B's progress live.

## Run locally

```bash
npm install
npm run dev
```

Production build: `npm run build` (output in `dist/`, relative base so it works on any sub-path).

## Refer a Friend — Pull, Aim & Invite (A02)

The referrer landing leads with **Earn up to ₹5,000 a year.** An "Invite a friend" card rests at the bottom on an elastic cord, with friends shown above it. Pull the card down like a slingshot and move it sideways: a beam aims at a friend. Let go to confirm on the "Invite Priya?" screen, then send by SMS or copy the link. A short pull, `Esc` or a pointer cancel springs it back. Without contact access, letting go asks for permission and then returns you to aim. Tapping a friend, arrow keys + `Enter`, and "Or choose from your contacts" are the non-gesture routes.

- Gesture logic: `src/features/pull-invite/usePullGesture.ts` (rubber-band resistance, threshold + aim, haptics, keyboard, reduced motion)
- Presentation: `src/features/pull-invite/PullToInvite.tsx`. The interaction accent is a single token, `--invite`, in `src/index.css`.
- Invite copy: `src/lib/invite.ts`. Device handoff (native SMS composer, clipboard, vibrate): `src/lib/share.ts`

Simulated sends are always labelled. On a real phone, SMS opens the native composer and the user confirms whether they sent it.

Tests: `npm run dev`, then `npm run test:e2e` (uses the Playwright runtime; set `SHOTS=<dir>` for screenshots).

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
