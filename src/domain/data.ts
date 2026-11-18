import type { Contact } from "./types";

export const REFERRER = { name: "Aarav Mehta", first: "Aarav", phone: "+91 98100 24567" };

export const CONTACTS: Contact[] = [
  { id: "c_rahul", name: "Rahul Sharma", phone: "+91 98765 43210", hue: 12 },
  { id: "c_priya", name: "Priya Nair", phone: "+91 99887 66554", hue: 320 },
  { id: "c_ankit", name: "Ankit Verma", phone: "+91 91234 56789", hue: 210 },
  { id: "c_neha", name: "Neha Kapoor", phone: "+91 90000 11223", hue: 280 },
  { id: "c_rohan", name: "Rohan Gupta", phone: "+91 97654 32109", hue: 150 },
  { id: "c_sneha", name: "Sneha Iyer", phone: "+91 93456 78123", hue: 40 },
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
