import type { Contact } from "./types";

export const REFERRER = { name: "Aarav Mehta", first: "Aarav", phone: "+91 98100 24567" };

export const CONTACTS: Contact[] = [
  { id: "c_rahul", name: "Rahul Sharma", phone: "+91 98765 43210", hue: 12 },
  { id: "c_priya", name: "Priya Nair", phone: "+91 99887 66554", hue: 320 },
  { id: "c_ankit", name: "Ankit Verma", phone: "+91 91234 56789", hue: 210 },
  { id: "c_neha", name: "Neha Kapoor", phone: "+91 90000 11223", hue: 280 },
  { id: "c_rohan", name: "Rohan Gupta", phone: "+91 97654 32109", hue: 150 },
  { id: "c_sneha", name: "Sneha Iyer", phone: "+91 93456 78123", hue: 40 },
  { id: "c_aditi", name: "Aditi Rao", phone: "+91 98201 33445", hue: 190 },
  { id: "c_farhan", name: "Farhan Qureshi", phone: "+91 99300 55821", hue: 100 },
  { id: "c_kavya", name: "Kavya Menon", phone: "+91 94470 21987", hue: 340 },
  { id: "c_manish", name: "Manish Joshi", phone: "+91 98290 66710", hue: 25 },
  { id: "c_pooja", name: "Pooja Desai", phone: "+91 97240 13579", hue: 260 },
  { id: "c_vikram", name: "Vikram Singh", phone: "+91 98110 90876", hue: 170 },
];

export interface Plan {
  id: string;
  price: number;
  validity: string;
  data: string;
  calls: string;
  extras: string[];
  tag?: string;
}

export const PLANS: Plan[] = [
  { id: "p79", price: 79, validity: "28 days", data: "200 MB", calls: "₹64 talktime", extras: ["Local & STD at 1p/sec"], tag: "Below ₹100" },
  { id: "p199", price: 199, validity: "28 days", data: "1.5 GB/day", calls: "Unlimited", extras: ["100 SMS/day", "HelloTune free"], tag: "Popular" },
  { id: "p299", price: 299, validity: "28 days", data: "2 GB/day", calls: "Unlimited", extras: ["100 SMS/day", "Unlimited 5G", "Airtel Xstream Play"], tag: "Best value" },
  { id: "p479", price: 479, validity: "56 days", data: "1.5 GB/day", calls: "Unlimited", extras: ["100 SMS/day", "Unlimited 5G"] },
];

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** User A's personal (reusable) invite link, shown on the landing page and in the QR sheet. */
export const PERSONAL_CODE = `${REFERRER.first.toUpperCase()}-7K2Q`;
export const PERSONAL_LINK = `airtel.in/r/${PERSONAL_CODE}`;
