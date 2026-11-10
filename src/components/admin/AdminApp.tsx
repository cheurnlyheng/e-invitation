"use client";

import { useCallback, useEffect, useState } from "react";
import type { Rsvp, Stats, Wish } from "@/server/store";
import { GuestLinks } from "./GuestLinks";
import { Overview } from "./Overview";
import { RsvpList } from "./RsvpList";
import { WishList } from "./WishList";

export type Summary = {
  rsvps: Rsvp[];
  wishes: Wish[];
  stats: Stats;
  totals: { yes: number; no: number; guestsAttending: number };
};

type Status = "loading" | "login" | "ready" | "unconfigured" | "nostorage" | "error";
type Tab = "overview" | "rsvps" | "wishes" | "links";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "rsvps", label: "RSVPs" },
  { id: "wishes", label: "Wishes" },
  { id: "links", label: "Links" },
];

type Result = { status: Exclude<Status, "loading">; data?: Summary };

async function fetchSummary(): Promise<Result> {
  try {
    const res = await fetch("/api/admin/summary", { cache: "no-store" });
    if (res.ok) return { status: "ready", data: (await res.json()) as Summary };
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401) return { status: "login" };
    if (res.status === 503) return { status: err.error === "storage_not_configured" ? "nostorage" : "unconfigured" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <div className="mt-2 text-sm leading-relaxed text-ink/70">{children}</div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      if (res.ok) return onDone();
      setError(res.status === 429 ? "Too many attempts. Please wait a minute." : "Wrong password.");
    } catch {
      setError("Could not reach the server.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-ink">Wedding dashboard</h1>
      <p className="mt-1 text-sm text-ink/60">Enter the shared password to see RSVPs and wishes.</p>
      <input
        type="password"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mt-4 w-full rounded-xl border border-black/15 px-4 py-3 text-base outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/25"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy || !password} className="mt-4 w-full rounded-xl bg-leaf py-3 font-semibold text-white transition enabled:active:scale-[0.99] disabled:opacity-50">
        {busy ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

export function AdminApp() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<Summary | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  const apply = useCallback((r: Result) => {
    if (r.data) setData(r.data);
    setStatus(r.status);
  }, []);
  const load = useCallback(() => fetchSummary().then(apply), [apply]);

  useEffect(() => {
    let live = true;
    void fetchSummary().then((r) => live && apply(r));
    return () => {
      live = false;
    };
  }, [apply]);

  /** Runs a change (delete, hide…) and refreshes the numbers. */
  const change = useCallback(
    async (url: string, init: RequestInit) => {
      const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
      if (res.status === 401) return setStatus("login");
      await load();
    },
    [load],
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setData(null);
    setStatus("login");
  }

  let body: React.ReactNode;
  if (status === "loading") body = <p className="mt-24 text-center text-sm text-ink/60">Loading…</p>;
  else if (status === "login") body = <Login onDone={() => void load()} />;
  else if (status === "unconfigured")
    body = (
      <Notice title="Dashboard is locked">
        No admin password is set. Add <code className="rounded bg-black/5 px-1">ADMIN_PASSWORD</code> (at least 6 characters) to the site&apos;s environment variables and reload.
      </Notice>
    );
  else if (status === "nostorage")
    body = (
      <Notice title="No database yet">
        Add a Postgres database and set <code className="rounded bg-black/5 px-1">DATABASE_URL</code> so RSVPs and wishes can be saved.
      </Notice>
    );
  else if (status === "error" || !data)
    body = (
      <Notice title="Something went wrong">
        The dashboard could not load.{" "}
        <button type="button" className="font-semibold text-leaf underline" onClick={() => void load()}>
          Try again
        </button>
      </Notice>
    );
  else
    body = (
      <>
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-ink">Wedding dashboard</h1>
          <div className="flex gap-2">
            <button type="button" onClick={() => void load()} className="rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-sm text-ink/80 hover:bg-black/5">
              Refresh
            </button>
            <button type="button" onClick={logout} className="rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-sm text-ink/80 hover:bg-black/5">
              Sign out
            </button>
          </div>
        </header>

        <nav role="tablist" aria-label="Sections" className="mt-4 flex gap-1 overflow-x-auto rounded-full bg-black/5 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${tab === t.id ? "bg-white text-leaf shadow-sm" : "text-ink/60 hover:text-ink"}`}
            >
              {t.label}
              {t.id === "rsvps" && <span className="ml-1 text-xs opacity-60">{data.rsvps.length}</span>}
              {t.id === "wishes" && <span className="ml-1 text-xs opacity-60">{data.wishes.length}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-5">
          {tab === "overview" && <Overview data={data} onOpen={setTab} />}
          {tab === "rsvps" && <RsvpList rsvps={data.rsvps} onDelete={(id) => change(`/api/admin/rsvps/${id}`, { method: "DELETE" })} />}
          {tab === "wishes" && (
            <WishList
              wishes={data.wishes}
              onHide={(id, hidden) => change(`/api/admin/wishes/${id}`, { method: "PATCH", body: JSON.stringify({ hidden }) })}
              onDelete={(id) => change(`/api/admin/wishes/${id}`, { method: "DELETE" })}
            />
          )}
          {tab === "links" && <GuestLinks data={data} />}
        </div>
      </>
    );

  return (
    <main className="min-h-screen bg-[#f6f4ea] px-4 py-6 font-roboto text-ink">
      <div className="mx-auto w-full max-w-3xl">{body}</div>
    </main>
  );
}
