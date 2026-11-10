import type { EventInfo } from "@/config/invitation";
import type { Lang } from "./i18n";
import { eventStart } from "./format";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

/** Build an .ics file with one VEVENT per wedding event, in the given language. */
export function buildIcs(events: EventInfo[], lang: Lang, heading: string): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//e-invitation//EN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    const start = eventStart(e.date, e.time);
    const end = new Date(start.getTime() + e.durationMin * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}-${e.date}@e-invitation`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(`${heading} · ${e.title[lang]}`)}`,
      `LOCATION:${esc(`${e.venue[lang]}, ${e.address[lang]}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(content: string, filename = "wedding.ics") {
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
