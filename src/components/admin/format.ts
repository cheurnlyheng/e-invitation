/** "10 Nov, 14:05" in Phnom Penh time, whatever the viewer's timezone. */
export function when(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Phnom_Penh", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
