import { requireAdmin } from "@/server/auth";
import { guard, json } from "@/server/http";
import { getStore } from "@/server/store";

// Quote every cell, and defuse spreadsheet formulas (=, +, -, @) in guest-typed text.
const cell = (v: string | number | boolean) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
const line = (cols: (string | number | boolean)[]) => cols.map(cell).join(",");

/** CSV download: /api/admin/export?type=rsvps or ?type=wishes (UTF-8 with BOM so Excel shows Khmer). */
export function GET(req: Request) {
  return guard(async () => {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const type = new URL(req.url).searchParams.get("type");
    const store = getStore();
    let rows: string[];
    if (type === "rsvps") {
      const list = await store.listRsvps();
      rows = [line(["Name", "Attending", "Guests", "Invited as", "Answered at"]), ...list.map((r) => line([r.name, r.attending ? "yes" : "no", r.guests, r.invitedAs, r.createdAt]))];
    } else if (type === "wishes") {
      const list = await store.listWishes({ includeHidden: true });
      rows = [line(["Name", "Message", "Hidden", "Sent at"]), ...list.map((w) => line([w.name, w.message, w.hidden ? "yes" : "no", w.createdAt]))];
    } else return json({ error: "invalid" }, 400);

    return new Response("﻿" + rows.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
