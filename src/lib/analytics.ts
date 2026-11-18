/**
 * Minimal analytics hook for the prototype. There is no analytics SDK in this project, so events
 * are buffered on `window.__referEvents` and logged in development. Swap `send` for the real
 * client (e.g. the app's existing tracker) when this ships.
 */
export type ReferEvent =
  | "refer_page_viewed"
  | "hero_cta_clicked"
  | "invite_friends_clicked"
  | "how_it_works_viewed"
  | "milestone_section_viewed"
  | "milestone_unlocked"
  | "referral_activity_opened"
  | "faq_opened"
  | "terms_viewed"
  | "support_clicked"
  | "successful_referral"
  | "reward_credited";

type Payload = Record<string, string | number | boolean | undefined>;

function send(event: ReferEvent, props: Payload) {
  const w = window as unknown as { __referEvents?: { event: ReferEvent; props: Payload; at: number }[] };
  (w.__referEvents ??= []).push({ event, props, at: Date.now() });
  if (import.meta.env.DEV) console.debug("[analytics]", event, props);
}

export function track(event: ReferEvent, props: Payload = {}) {
  try {
    send(event, props);
  } catch {
    /* analytics must never break the UI */
  }
}

/** Fire `event` once when the element first scrolls into view. */
export function trackWhenVisible(el: Element | null, event: ReferEvent, props: Payload = {}) {
  if (!el || typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        track(event, props);
        io.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  io.observe(el);
  return () => io.disconnect();
}
