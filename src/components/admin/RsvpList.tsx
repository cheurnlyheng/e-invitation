"use client";

import { useState } from "react";
import type { Rsvp } from "@/server/store";
import { when } from "./format";

export function RsvpList({ rsvps, onDelete }: { rsvps: Rsvp[]; onDelete: (id: number) => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");

  const shown = rsvps.filter(
    (r) => (filter === "all" || (filter === "yes") === r.attending) && `${r.name} ${r.invitedAs}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const chip = (id: typeof filter, label: string) => (
    <button type="button" onClick={() => setFilter(id)} className={`rounded-full px-3 py-1 text-sm ${filter === id ? "bg-leaf text-white" : "bg-white text-ink/70 ring-1 ring-black/10"}`}>
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3.5 py-2 text-sm outline-none focus:border-leaf" />
        {chip("all", "All")}
        {chip("yes", "Coming")}
        {chip("no", "Can't come")}
        <a href="/api/admin/export?type=rsvps" download className="rounded-full bg-white px-3 py-1 text-sm text-leaf ring-1 ring-leaf/40 hover:bg-leaf/10">
          Download CSV
        </a>
      </div>

      <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        {shown.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.name}</p>
              <p className="truncate text-xs text-ink/55">
                {when(r.createdAt)}
                {r.invitedAs && r.invitedAs.toLowerCase() !== r.name.toLowerCase() ? ` · link for “${r.invitedAs}”` : ""}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${r.attending ? "bg-leaf/15 text-leaf" : "bg-red-100 text-red-700"}`}>
              {r.attending ? `Coming · ${r.guests}` : "Can't come"}
            </span>
            <button
              type="button"
              aria-label={`Delete reply from ${r.name}`}
              onClick={() => window.confirm(`Delete the reply from ${r.name}?`) && onDelete(r.id)}
              className="shrink-0 rounded-full px-2 py-1 text-sm text-ink/40 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink/50">{rsvps.length ? "Nothing matches." : "No replies yet."}</li>}
      </ul>
    </div>
  );
}
