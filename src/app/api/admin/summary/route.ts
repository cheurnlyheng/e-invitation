import { requireAdmin } from "@/server/auth";
import { guard, json } from "@/server/http";
import { getStore } from "@/server/store";

/** Everything the dashboard shows, in one request. */
export function GET(req: Request) {
  return guard(async () => {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const store = getStore();
    const [rsvps, wishes, stats] = await Promise.all([store.listRsvps(), store.listWishes({ includeHidden: true }), store.stats()]);
    const attending = rsvps.filter((r) => r.attending);
    return json({
      rsvps,
      wishes,
      stats,
      totals: {
        yes: attending.length,
        no: rsvps.length - attending.length,
        guestsAttending: attending.reduce((n, r) => n + r.guests, 0),
      },
    });
  });
}
