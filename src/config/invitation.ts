import type { L10n } from "@/lib/i18n";

/**
 * Everything that changes from wedding to wedding lives in this file.
 * All names, dates, venues and bank details below are PLACEHOLDERS, and the
 * photos / artwork in public/ref are temporary stand-ins from the reference
 * template that must be replaced before the link is shared publicly.
 * Khmer text is a draft and should be proofread by a native speaker.
 */

export type EventInfo = {
  id: string;
  title: L10n;
  /** Local venue date "YYYY-MM-DD" and 24h time "HH:mm" (Cambodia, UTC+7). */
  date: string;
  time: string;
  durationMin: number;
  venue: L10n;
  address: L10n;
  /** Google Maps search text; omit to hide the map for this event. */
  mapQuery?: string;
};

export type GiftAccount = {
  id: string;
  label: L10n;
  bank: string;
  accountName: string;
  accountNumber: string;
  /** KHQR / payment QR image from the bank app, e.g. "/gift/aba-qr.png". */
  qr?: string;
};

export type ScheduleItem = {
  time: string;
  label: L10n;
  /** Little illustrated medallion shown beside the time. */
  icon?: "ring" | "drink" | "cake";
};

export type Person = {
  name: L10n;
  fullName: L10n;
  parents: { father: L10n; mother: L10n };
};

export const invitation = {
  couple: {
    groom: {
      name: { km: "ដារ៉ា", en: "Dara" },
      fullName: { km: "សុខ ដារ៉ា", en: "Sok Dara" },
      parents: {
        father: { km: "សុខ សុភាព", en: "Sok Sopheap" },
        mother: { km: "ម៉ម សុខា", en: "Mom Sokha" },
      },
    },
    bride: {
      name: { km: "ស្រីនាង", en: "Sreyneang" },
      fullName: { km: "ជា ស្រីនាង", en: "Chea Sreyneang" },
      parents: {
        father: { km: "ជា វិបុល", en: "Chea Vibol" },
        mother: { km: "លី ចាន់ធី", en: "Ly Chanthy" },
      },
    },
  } satisfies Record<"groom" | "bride", Person>,

  events: [
    {
      id: "ceremony",
      title: { km: "ពិធីមង្គលការ", en: "Wedding Ceremony" },
      date: "2027-01-16",
      time: "08:00",
      durationMin: 240,
      venue: { km: "គេហដ្ឋានខាងកូនស្រី", en: "Bride's Family Home" },
      address: { km: "ក្រុងភ្នំពេញ", en: "Phnom Penh" },
    },
    {
      id: "reception",
      title: { km: "ពិធីជប់លៀង", en: "Reception" },
      date: "2027-01-16",
      time: "18:00",
      durationMin: 240,
      venue: { km: "សាលពិធីអាពាហ៍ពិពាហ៍", en: "Wedding Hall (venue name)" },
      address: {
        km: "ក្រុងភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា",
        en: "Phnom Penh, Cambodia",
      },
      mapQuery: "Independence Monument, Phnom Penh",
    },
  ] satisfies EventInfo[],

  /** Guests are welcomed this much before the reception starts. */
  welcomeTime: "17:00",

  photos: {
    hero: "/ref/gallery/02.webp",
    gallery: Array.from({ length: 10 }, (_, i) => ({
      src: `/ref/gallery/${String(i + 1).padStart(2, "0")}.webp`,
      alt: { km: `រូបភាពទី ${i + 1}`, en: `Wedding photo ${i + 1}` } satisfies L10n,
    })),
  },

  schedule: [
    { time: "06:30", label: { km: "ពិធីសូត្រមន្ត", en: "Monks' blessing chant" } },
    { time: "08:00", label: { km: "ពិធីហែជំនូន", en: "Groom's procession" } },
    { time: "09:30", label: { km: "ពិធីកាត់សក់បង្កក់សិរី", en: "Hair-cutting ceremony" } },
    { time: "10:30", label: { km: "ពិធីចងដៃ", en: "Hand-tying blessing" }, icon: "ring" },
    { time: "11:30", label: { km: "ពិធីសំពះផ្ទឹម", en: "Bridal chamber ceremony" } },
    { time: "18:00", label: { km: "ទទួលភ្ញៀវ និងអាហារពេលល្ងាច", en: "Reception & dinner" }, icon: "drink" },
    { time: "20:30", label: { km: "កាត់នំខេក និងរាំលេង", en: "Cake cutting & dancing" }, icon: "cake" },
  ] satisfies ScheduleItem[],

  gifts: [
    {
      id: "aba",
      label: { km: "កូនកំលោះ", en: "Groom" },
      bank: "ABA Bank",
      accountName: "SOK DARA",
      accountNumber: "000 000 000",
      qr: "/gift/qr-placeholder.svg",
    },
    {
      id: "acleda",
      label: { km: "កូនក្រមុំ", en: "Bride" },
      bank: "ACLEDA Bank",
      accountName: "CHEA SREYNEANG",
      accountNumber: "0000 0000 0000 00",
    },
  ] satisfies GiftAccount[],

  music: {
    // Placeholder tune. Replace with a track you have the right to use.
    src: "/audio/nisai.mp3",
    volume: 0.5,
  },

};

export type Invitation = typeof invitation;
