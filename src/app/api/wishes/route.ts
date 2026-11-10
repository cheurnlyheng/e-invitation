import { guard, json, rateLimited, readJson, str } from "@/server/http";
import { getStore } from "@/server/store";

/** Wishes shown in the public guestbook (hidden ones are left out). */
export function GET() {
  return guard(async () => {
    const wishes = await getStore().listWishes();
    return json({ wishes: wishes.map(({ id, name, message, createdAt }) => ({ id, name, message, createdAt })) });
  });
}

export function POST(req: Request) {
  return guard(async () => {
    if (rateLimited(req, "wish", 6)) return json({ error: "too_many_requests" }, 429);
    const body = await readJson(req);
    const name = str(body?.name, 60);
    const message = str(body?.message, 400);
    if (!name || !message) return json({ error: "invalid" }, 400);

    const wish = await getStore().addWish({ name, message });
    return json({ ok: true, wish: { id: wish.id, name: wish.name, message: wish.message, createdAt: wish.createdAt } }, 201);
  });
}
