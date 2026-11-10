import { unstable_rethrow } from "next/navigation";
import { StorageNotConfigured } from "./store";

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Parses a small JSON body; returns null for anything oversized or malformed. */
export async function readJson(req: Request, maxBytes = 8_000): Promise<Record<string, unknown> | null> {
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    const v: unknown = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Trimmed, length-capped string with control characters removed. */
export function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

// Best-effort limiter: counts live per server instance, which is enough to stop casual spam.
const hits = new Map<string, number[]>();

/** True when this IP has made `max` or more requests to `bucket` within the window. */
export function rateLimited(req: Request, bucket: string, max: number, windowMs = 60_000): boolean {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) for (const [k, v] of hits) if (v.every((t) => now - t > windowMs)) hits.delete(k);
  return recent.length > max;
}

/** Wraps a handler so storage problems become clean JSON errors instead of stack traces. */
export async function guard(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    unstable_rethrow(e); // let Next handle its own control-flow errors (e.g. "this route is dynamic")
    if (e instanceof StorageNotConfigured) return json({ error: "storage_not_configured" }, 503);
    console.error("[api]", e);
    return json({ error: "server_error" }, 500);
  }
}
