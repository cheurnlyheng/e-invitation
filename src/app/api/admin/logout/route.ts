import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/server/auth";
import { json } from "@/server/http";

export async function POST() {
  (await cookies()).delete(ADMIN_COOKIE);
  return json({ ok: true });
}
