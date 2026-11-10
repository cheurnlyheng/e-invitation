import { cookies } from "next/headers";
import { adminEnabled, newSessionToken, passwordMatches, sessionCookie } from "@/server/auth";
import { guard, json, rateLimited, readJson, str } from "@/server/http";

export function POST(req: Request) {
  return guard(async () => {
    if (!adminEnabled()) return json({ error: "admin_disabled" }, 503);
    if (rateLimited(req, "login", 6)) return json({ error: "too_many_attempts" }, 429);

    const body = await readJson(req);
    if (!passwordMatches(str(body?.password, 200))) {
      await new Promise((r) => setTimeout(r, 400)); // slow down guessing
      return json({ error: "wrong_password" }, 401);
    }
    (await cookies()).set(sessionCookie(newSessionToken()));
    return json({ ok: true });
  });
}
