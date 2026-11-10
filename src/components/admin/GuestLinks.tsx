"use client";

import { useState, useSyncExternalStore } from "react";
import type { Summary } from "./AdminApp";

const KEY = "ei:admin:guests";

// The guest list lives in this browser only; it is a convenience for making links, not site data.
const listeners = new Set<() => void>();
const read = () => {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
const write = (v: string) => {
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    // storage blocked: the list just won't be remembered
  }
  listeners.forEach((l) => l());
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Make one link per guest (…/?to=Name) and see who has opened it and who has replied. */
export function GuestLinks({ data }: { data: Summary }) {
  const text = useSyncExternalStore(subscribe, read, () => "");
  const origin = useSyncExternalStore(subscribe, () => window.location.origin, () => "");
  const [copied, setCopied] = useState("");

  const names = [...new Set(text.split("\n").map((n) => n.trim()).filter(Boolean))];
  const link = (name?: string) => (name ? `${origin}/?to=${encodeURIComponent(name)}` : origin + "/");
  const opened = new Map(data.stats.byGuest.map((g) => [g.guest.toLowerCase(), g.opens]));
  const replied = new Map<string, boolean>();
  for (const r of data.rsvps) {
    replied.set((r.invitedAs || r.name).toLowerCase(), r.attending);
    replied.set(r.name.toLowerCase(), r.attending);
  }

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      window.prompt("Copy this:", value);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Guest list</h2>
        <p className="mt-0.5 text-xs text-ink/55">One name per line. Each guest gets their own link; their name shows on the cover and you can see who opened it.</p>
        <textarea
          value={text}
          onChange={(e) => write(e.target.value)}
          rows={5}
          placeholder={"Sokha\nMaly & Piseth\nUncle Vannak"}
          className="mt-3 w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/25"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" disabled={!names.length} onClick={() => copy("all", names.map((n) => `${n}: ${link(n)}`).join("\n"))} className="rounded-full bg-leaf px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40">
            {copied === "all" ? "Copied" : `Copy all ${names.length || ""} links`}
          </button>
          <button type="button" onClick={() => copy("generic", link())} className="rounded-full bg-white px-4 py-1.5 text-sm text-leaf ring-1 ring-leaf/40 hover:bg-leaf/10">
            {copied === "generic" ? "Copied" : "Copy the general link (no name)"}
          </button>
        </div>
      </section>

      {names.length > 0 && (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {names.map((n) => {
            const opens = opened.get(n.toLowerCase());
            const answer = replied.get(n.toLowerCase());
            return (
              <li key={n} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{n}</p>
                  <p className="truncate text-xs text-ink/50">{link(n)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${opens ? "bg-leaf/15 text-leaf" : "bg-black/5 text-ink/50"}`}>{opens ? `Opened${opens > 1 ? ` ×${opens}` : ""}` : "Not opened"}</span>
                <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs sm:inline ${answer === undefined ? "bg-black/5 text-ink/50" : answer ? "bg-leaf/15 text-leaf" : "bg-red-100 text-red-700"}`}>
                  {answer === undefined ? "No reply" : answer ? "Coming" : "Can't come"}
                </span>
                <button type="button" onClick={() => copy(n, link(n))} className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-leaf ring-1 ring-leaf/40 hover:bg-leaf/10">
                  {copied === n ? "Copied" : "Copy link"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
