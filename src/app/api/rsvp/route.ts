import { guard, json, rateLimited, readJson, str } from "@/server/http";
import { getStore } from "@/server/store";

/** A guest's answer: name, coming or not, and how many people. */
export function POST(req: Request) {
  return guard(async () => {
    if (rateLimited(req, "rsvp", 8)) return json({ error: "too_many_requests" }, 429);
    const body = await readJson(req);
    const name = str(body?.name, 60);
    if (!body || !name || typeof body.attending !== "boolean") return json({ error: "invalid" }, 400);

    const guests = body.attending ? Math.min(10, Math.max(1, Math.trunc(Number(body.guests)) || 1)) : 0;
    await getStore().addRsvp({ name, attending: body.attending, guests, invitedAs: str(body.invitedAs, 60) });
    return json({ ok: true }, 201);
  });
}
