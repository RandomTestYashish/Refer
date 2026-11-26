/**
 * Device share capabilities. Everything here degrades gracefully: when a native
 * handoff is not available the caller must fall back to a clearly-labelled simulation.
 */

/** True on phones/tablets where an `sms:` URL opens the OS message composer. */
export function canUseNativeSms() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Opens the native SMS composer pre-filled. We cannot observe whether the user actually sends it. */
export function openSmsComposer(phones: string[], body: string) {
  const to = phones.map((p) => p.replace(/\s/g, "")).join(",");
  const sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "&" : "?";
  window.location.href = `sms:${to}${sep}body=${encodeURIComponent(body)}`;
}

/** Copies text. Returns false when the clipboard is blocked (e.g. inside some iframes). */
export async function copyText(text: string) {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Short haptic tick where supported (Android Chrome). Silently ignored elsewhere. */
export function haptic(pattern: number | number[] = 10) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
