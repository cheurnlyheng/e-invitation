import { guard, json, rateLimited, readJson, str } from "@/server/http";
import { getStore, type VisitKind } from "@/server/store";

/** Counts a page view ("view") or a tap on Open ("open"). `visitor` is a random id kept in the guest's browser. */
export function POST(req: Request) {
  return guard(async () => {
    if (rateLimited(req, "track", 30)) return json({ error: "too_many_requests" }, 429);
    const body = await readJson(req);
    const kind = body?.kind === "view" || body?.kind === "open" ? (body.kind as VisitKind) : null;
    const visitor = str(body?.visitor, 64);
    if (!kind || !/^[A-Za-z0-9-]{8,64}$/.test(visitor)) return json({ error: "invalid" }, 400);

    await getStore().addVisit({ kind, visitor, guest: str(body?.guest, 60) });
    return json({ ok: true }, 201);
  });
}
