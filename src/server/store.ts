import { promises as fs } from "node:fs";
import path from "node:path";
import { X509Certificate } from "node:crypto";
import type tls from "node:tls";
import { Pool } from "pg";

/**
 * Where RSVPs, wishes and visits are kept.
 *  - DATABASE_URL (or POSTGRES_URL) set  -> Postgres (Railway in production). Used on Vercel.
 *  - not set, and not in production      -> a JSON file in .data/, so the site and
 *                                           the dashboard work locally with no setup.
 *  - not set, in production              -> StorageNotConfigured (never lose guest data silently).
 */

export type Rsvp = { id: number; name: string; attending: boolean; guests: number; invitedAs: string; createdAt: string };
export type Wish = { id: number; name: string; message: string; hidden: boolean; createdAt: string };
export type VisitKind = "view" | "open";
export type Visit = { kind: VisitKind; visitor: string; guest: string; createdAt: string };

export type Stats = {
  views: number;
  opens: number;
  uniqueVisitors: number;
  uniqueOpeners: number;
  /** Opens per personal-link name (the ?to= value), newest first. */
  byGuest: { guest: string; opens: number; lastAt: string }[];
};

export class StorageNotConfigured extends Error {
  constructor() {
    super("No database configured: set DATABASE_URL.");
  }
}

export interface Store {
  addRsvp(r: Omit<Rsvp, "id" | "createdAt">): Promise<void>;
  listRsvps(): Promise<Rsvp[]>;
  deleteRsvp(id: number): Promise<void>;
  addWish(w: Pick<Wish, "name" | "message">): Promise<Wish>;
  /** Newest first. Hidden wishes are only included when asked for (admin). */
  listWishes(opts?: { includeHidden?: boolean }): Promise<Wish[]>;
  setWishHidden(id: number, hidden: boolean): Promise<void>;
  deleteWish(id: number): Promise<void>;
  addVisit(v: Omit<Visit, "createdAt">): Promise<void>;
  stats(): Promise<Stats>;
}

export function computeStats(visits: Visit[]): Stats {
  const views = visits.filter((v) => v.kind === "view");
  const opens = visits.filter((v) => v.kind === "open");
  const guests = new Map<string, { opens: number; lastAt: string }>();
  for (const v of opens) {
    if (!v.guest) continue;
    const g = guests.get(v.guest) ?? { opens: 0, lastAt: v.createdAt };
    g.opens += 1;
    if (v.createdAt > g.lastAt) g.lastAt = v.createdAt;
    guests.set(v.guest, g);
  }
  return {
    views: views.length,
    opens: opens.length,
    uniqueVisitors: new Set(views.map((v) => v.visitor)).size,
    uniqueOpeners: new Set(opens.map((v) => v.visitor)).size,
    byGuest: [...guests.entries()].map(([guest, g]) => ({ guest, ...g })).sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1)),
  };
}

// ---------------------------------------------------------------------------
// Postgres
// ---------------------------------------------------------------------------

/**
 * Connection settings for the pool.
 *
 * Production databases are reached over an encrypted connection whose certificate is checked:
 *  - Railway's Postgres signs its own certificate with a private authority, which no public
 *    list knows about. Put that authority's certificate (public, not secret) in DATABASE_CA and
 *    the connection is trusted only if the server's certificate was issued by it. The server's
 *    certificate is made for "localhost", so the name check is replaced by that issuer check.
 *  - With no DATABASE_CA the normal public-authority check applies (right for Neon, Supabase...).
 *  - Local databases (localhost) and "?sslmode=disable" use no encryption.
 */
function sslFor(url: URL): false | true | tls.ConnectionOptions {
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  if (local || url.searchParams.get("sslmode") === "disable") return false;

  const caPem = process.env.DATABASE_CA?.replace(/\\n/g, "\n").trim();
  if (!caPem) return true;

  const caKey = new X509Certificate(caPem).publicKey;
  return {
    ca: caPem,
    checkServerIdentity: (_host, cert) =>
      new X509Certificate(cert.raw).verify(caKey) ? undefined : new Error("The database's certificate was not issued by the trusted authority in DATABASE_CA"),
  };
}

/** A small connection pool: a few connections per server instance are plenty for a wedding site. */
function makePool(raw: string): Pool {
  const url = new URL(raw);
  const ssl = sslFor(url);
  url.searchParams.delete("sslmode"); // decided above, so the URL's own setting cannot conflict
  const pool = new Pool({ connectionString: url.toString(), ssl, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 10_000, allowExitOnIdle: true });
  pool.on("error", (e) => console.error("[db] idle connection error:", e.message)); // a dropped idle connection must not crash the server
  return pool;
}

function pgStore(url: string): Store {
  const pool = makePool(url);
  type Row = Record<string, unknown>;
  const query = async (text: string, values: unknown[] = []) => (await pool.query(text, values)).rows as Row[];
  let ready: Promise<void> | null = null;

  const init = () =>
    (ready ??= (async () => {
      await query(`CREATE TABLE IF NOT EXISTS rsvps (id SERIAL PRIMARY KEY, name TEXT NOT NULL, attending BOOLEAN NOT NULL, guests INT NOT NULL DEFAULT 0, invited_as TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
      await query(`CREATE TABLE IF NOT EXISTS wishes (id SERIAL PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL, hidden BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
      await query(`CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, kind TEXT NOT NULL, visitor TEXT NOT NULL, guest TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
      await query(`CREATE INDEX IF NOT EXISTS visits_created_idx ON visits (created_at)`);
    })().catch((e) => {
      ready = null; // let the next request retry instead of caching the failure
      throw e;
    }));

  const iso = (v: unknown) => new Date(v as string | Date).toISOString();
  const wish = (r: Row): Wish => ({ id: Number(r.id), name: String(r.name), message: String(r.message), hidden: Boolean(r.hidden), createdAt: iso(r.created_at) });

  return {
    async addRsvp(r) {
      await init();
      await query(`INSERT INTO rsvps (name, attending, guests, invited_as) VALUES ($1, $2, $3, $4)`, [r.name, r.attending, r.guests, r.invitedAs]);
    },
    async listRsvps() {
      await init();
      const rows = await query(`SELECT id, name, attending, guests, invited_as, created_at FROM rsvps ORDER BY created_at DESC`);
      return rows.map((r) => ({ id: Number(r.id), name: String(r.name), attending: Boolean(r.attending), guests: Number(r.guests), invitedAs: String(r.invited_as), createdAt: iso(r.created_at) }));
    },
    async deleteRsvp(id) {
      await init();
      await query(`DELETE FROM rsvps WHERE id = $1`, [id]);
    },
    async addWish(w) {
      await init();
      const rows = await query(`INSERT INTO wishes (name, message) VALUES ($1, $2) RETURNING id, name, message, hidden, created_at`, [w.name, w.message]);
      return wish(rows[0]);
    },
    async listWishes({ includeHidden = false } = {}) {
      await init();
      const where = includeHidden ? "" : " WHERE hidden = false";
      const rows = await query(`SELECT id, name, message, hidden, created_at FROM wishes${where} ORDER BY created_at DESC`);
      return rows.map(wish);
    },
    async setWishHidden(id, hidden) {
      await init();
      await query(`UPDATE wishes SET hidden = $1 WHERE id = $2`, [hidden, id]);
    },
    async deleteWish(id) {
      await init();
      await query(`DELETE FROM wishes WHERE id = $1`, [id]);
    },
    async addVisit(v) {
      await init();
      await query(`INSERT INTO visits (kind, visitor, guest) VALUES ($1, $2, $3)`, [v.kind, v.visitor, v.guest]);
    },
    async stats() {
      await init();
      const rows = await query(`SELECT kind, visitor, guest, created_at FROM visits`);
      return computeStats(rows.map((r) => ({ kind: r.kind as VisitKind, visitor: String(r.visitor), guest: String(r.guest), createdAt: iso(r.created_at) })));
    },
  };
}

// ---------------------------------------------------------------------------
// Local JSON file (development only)
// ---------------------------------------------------------------------------

type FileData = { seq: number; rsvps: Rsvp[]; wishes: Wish[]; visits: Visit[] };

function fileStore(): Store {
  const file = path.join(process.cwd(), ".data", "store.json");
  let queue: Promise<unknown> = Promise.resolve();

  const read = async (): Promise<FileData> => {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as FileData;
    } catch {
      return { seq: 0, rsvps: [], wishes: [], visits: [] };
    }
  };
  // run read-modify-write one at a time so concurrent requests cannot clobber each other
  const update = <T>(fn: (d: FileData) => T): Promise<T> => {
    const run = queue.then(async () => {
      const d = await read();
      const out = fn(d);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(d, null, 1));
      return out;
    });
    queue = run.catch(() => undefined);
    return run;
  };
  const now = () => new Date().toISOString();

  return {
    addRsvp: (r) => update((d) => void d.rsvps.push({ ...r, id: ++d.seq, createdAt: now() })),
    listRsvps: async () => (await read()).rsvps.slice().reverse(),
    deleteRsvp: (id) => update((d) => void (d.rsvps = d.rsvps.filter((r) => r.id !== id))),
    addWish: (w) =>
      update((d) => {
        const item: Wish = { ...w, id: ++d.seq, hidden: false, createdAt: now() };
        d.wishes.push(item);
        return item;
      }),
    listWishes: async ({ includeHidden = false } = {}) => (await read()).wishes.filter((w) => includeHidden || !w.hidden).reverse(),
    setWishHidden: (id, hidden) => update((d) => void d.wishes.forEach((w) => w.id === id && (w.hidden = hidden))),
    deleteWish: (id) => update((d) => void (d.wishes = d.wishes.filter((w) => w.id !== id))),
    addVisit: (v) => update((d) => void d.visits.push({ ...v, createdAt: now() })),
    stats: async () => computeStats((await read()).visits),
  };
}

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) cached = pgStore(url);
  else if (process.env.NODE_ENV !== "production") cached = fileStore();
  else throw new StorageNotConfigured();
  return cached;
}
