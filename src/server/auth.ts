import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { json } from "./http";

/**
 * Admin sign-in: one shared password (ADMIN_PASSWORD). A successful login sets a
 * signed, HttpOnly cookie that expires after a week. There is deliberately no
 * default password: without ADMIN_PASSWORD the dashboard stays locked.
 */

export const ADMIN_COOKIE = "ei_admin";
const WEEK_S = 7 * 24 * 3600;

const password = () => process.env.ADMIN_PASSWORD || "";
const signingKey = () => process.env.ADMIN_SECRET || password();
const sign = (payload: string) => createHmac("sha256", signingKey()).update(payload).digest("hex");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminEnabled = () => password().length >= 6;

export function passwordMatches(input: string): boolean {
  // compare hashes so the check takes the same time whatever the input length
  const h = (s: string) => createHmac("sha256", "pw-check").update(s).digest("hex");
  return adminEnabled() && safeEqual(h(input), h(password()));
}

export function newSessionToken(): string {
  const exp = String(Math.floor(Date.now() / 1000) + WEEK_S);
  return `${exp}.${sign(exp)}`;
}

function tokenValid(token: string | undefined): boolean {
  if (!token || !adminEnabled()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  return Number(exp) > Date.now() / 1000 && safeEqual(sig, sign(exp));
}

export const sessionCookie = (token: string) => ({
  name: ADMIN_COOKIE,
  value: token,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK_S,
});

/**
 * Call at the top of every admin route handler. Returns an error Response when the
 * caller is not allowed (send it straight back), or null when the request is fine.
 */
export async function requireAdmin(req: Request): Promise<Response | null> {
  if (!adminEnabled()) return json({ error: "admin_disabled" }, 503);
  if (!tokenValid((await cookies()).get(ADMIN_COOKIE)?.value)) return json({ error: "unauthorized" }, 401);
  // belt and braces against cross-site form posts: a browser-supplied Origin must be this site
  const origin = req.headers.get("origin");
  if (origin && req.method !== "GET" && new URL(origin).host !== req.headers.get("host")) return json({ error: "forbidden" }, 403);
  return null;
}
