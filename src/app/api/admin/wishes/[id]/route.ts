import { requireAdmin } from "@/server/auth";
import { guard, json, readJson } from "@/server/http";
import { getStore } from "@/server/store";

const parseId = (raw: string) => (/^\d{1,9}$/.test(raw) ? Number(raw) : null);

/** Hide or show a wish in the public guestbook. */
export function PATCH(req: Request, ctx: RouteContext<"/api/admin/wishes/[id]">) {
  return guard(async () => {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const id = parseId((await ctx.params).id);
    const body = await readJson(req);
    if (id === null || typeof body?.hidden !== "boolean") return json({ error: "invalid" }, 400);
    await getStore().setWishHidden(id, body.hidden);
    return json({ ok: true });
  });
}

export function DELETE(req: Request, ctx: RouteContext<"/api/admin/wishes/[id]">) {
  return guard(async () => {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const id = parseId((await ctx.params).id);
    if (id === null) return json({ error: "invalid" }, 400);
    await getStore().deleteWish(id);
    return json({ ok: true });
  });
}
