import { PERSONAL_LINK } from "@/domain/data";

/**
 * Predefined invitation copy. Not user-editable: no product requirement for custom
 * messages has been confirmed, so the text stays consistent for every friend.
 */
export function inviteMessage(friendFirstName: string | undefined, link = `https://${PERSONAL_LINK}`) {
  const greeting = friendFirstName ? `Hey ${friendFirstName},` : "Hey,";
  return `${greeting}\n\nI thought you'd like Airtel. Join using my referral link and enjoy the benefits!\n\n${link}`;
}

export const firstName = (name: string) => name.split(" ")[0];

export function nameList(names: string[]) {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}
