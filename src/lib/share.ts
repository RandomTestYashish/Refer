/**
 * Share handoffs. These only OPEN another app with a pre-filled message — they never
 * confirm that anything was sent, so the UI must not claim a message was delivered.
 */

export type HandoffResult = "shared" | "opened" | "cancelled" | "unsupported";

const isMobileUA = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/** Opens WhatsApp with a pre-filled message (wa.me works on mobile and web). */
export function openWhatsApp(text: string): HandoffResult {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const w = window.open(url, "_blank", "noopener,noreferrer");
  return w === null && !isMobileUA() ? "unsupported" : "opened";
}

/** Opens the SMS composer. Only meaningful on phones; desktop browsers usually ignore `sms:`. */
export function openSms(text: string, phone = ""): HandoffResult {
  if (!isMobileUA()) return "unsupported";
  const sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "&" : "?";
  window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(text)}`;
  return "opened";
}

/** Native share sheet with an optional image. Falls back to "unsupported" so callers can offer alternatives. */
export async function nativeShare(data: { title?: string; text: string; url?: string; file?: File }): Promise<HandoffResult> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (!nav.share) return "unsupported";
  const withFile: ShareData = data.file ? { title: data.title, text: data.text, url: data.url, files: [data.file] } : { title: data.title, text: data.text, url: data.url };
  const payload = data.file && nav.canShare && !nav.canShare(withFile) ? { title: data.title, text: data.text, url: data.url } : withFile;
  try {
    await nav.share(payload);
    return "shared";
  } catch (e) {
    return (e as DOMException)?.name === "AbortError" ? "cancelled" : "unsupported";
  }
}

/** Saves a blob as a file (used when the share sheet can't take images). */
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
