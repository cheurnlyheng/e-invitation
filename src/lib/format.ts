import type { Lang } from "./i18n";

const KH_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

/** Render digits in the active script (Khmer numerals for km). */
export function num(n: number | string, lang: Lang): string {
  const s = String(n);
  return lang === "km" ? s.replace(/\d/g, (d) => KH_DIGITS[Number(d)]) : s;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const MONTHS: Record<Lang, string[]> = {
  km: [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

export const WEEKDAYS: Record<Lang, string[]> = {
  km: ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"],
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  km: ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"],
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
};

export type Ymd = { y: number; m: number; d: number };

/** Dates are stored as plain "YYYY-MM-DD" so the viewer's timezone never shifts them. */
export function parseYmd(s: string): Ymd {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

export function weekdayOf({ y, m, d }: Ymd): number {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function daysInMonth({ y, m }: Ymd): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function formatDate(s: string, lang: Lang): string {
  const p = parseYmd(s);
  const wd = WEEKDAYS[lang][weekdayOf(p)];
  const mo = MONTHS[lang][p.m - 1];
  return lang === "km"
    ? `ថ្ងៃ${wd} ទី${num(p.d, lang)} ខែ${mo} ឆ្នាំ${num(p.y, lang)}`
    : `${wd}, ${mo} ${p.d}, ${p.y}`;
}

export function formatTime(hhmm: string, lang: Lang): string {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (lang === "km") {
    const period = h < 12 ? "ព្រឹក" : h < 17 ? "រសៀល" : "ល្ងាច";
    return `ម៉ោង ${num(h12, lang)}:${num(pad2(m), lang)} ${period}`;
  }
  return `${pad2(h)}:${pad2(m)}`;
}

/** Cambodia is UTC+7 all year; events are authored in local venue time. */
export function eventStart(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+07:00`);
}

/** "YYYY-MM-DD HH:mm"-style stamp of an ISO instant, in Phnom Penh time. */
export function formatStamp(iso: string, lang: Lang): string {
  const t = new Date(Date.parse(iso) + 7 * 3600_000);
  const day = `${num(t.getUTCDate(), lang)} ${MONTHS[lang][t.getUTCMonth()]} ${num(
    t.getUTCFullYear(),
    lang,
  )}`;
  return day;
}
