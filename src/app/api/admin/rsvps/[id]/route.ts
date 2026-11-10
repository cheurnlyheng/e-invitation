import { requireAdmin } from "@/server/auth";
import { guard, json } from "@/server/http";
import { getStore } from "@/server/store";

export function DELETE(req: Request, ctx: RouteContext<"/api/admin/rsvps/[id]">) {
  return guard(async () => {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const raw = (await ctx.params).id;
    if (!/^\d{1,9}$/.test(raw)) return json({ error: "invalid" }, 400);
    await getStore().deleteRsvp(Number(raw));
    return json({ ok: true });
  });
}
