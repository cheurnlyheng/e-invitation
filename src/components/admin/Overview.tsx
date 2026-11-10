"use client";

import type { Summary } from "./AdminApp";
import { when } from "./format";

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/55">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-leaf tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/55">{sub}</p>}
    </div>
  );
}

/** Headline numbers and the latest answers. */
export function Overview({ data, onOpen }: { data: Summary; onOpen: (tab: "rsvps" | "wishes") => void }) {
  const { totals, rsvps, wishes } = data;
  const hidden = wishes.filter((w) => w.hidden).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Guests coming" value={totals.guestsAttending} sub={`${totals.yes} ${totals.yes === 1 ? "reply" : "replies"} saying yes`} />
        <Stat label="Can't come" value={totals.no} sub="replies saying no" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Latest replies</h2>
            <button type="button" className="text-xs font-medium text-leaf underline" onClick={() => onOpen("rsvps")}>
              See all
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {rsvps.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-baseline justify-between gap-3">
                <span className="truncate">
                  {r.name} <span className={r.attending ? "text-leaf" : "text-red-600/80"}>· {r.attending ? `coming (${r.guests})` : "can't come"}</span>
                </span>
                <span className="shrink-0 text-xs text-ink/50">{when(r.createdAt)}</span>
              </li>
            ))}
            {rsvps.length === 0 && <li className="text-ink/50">No replies yet.</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Latest wishes</h2>
            <button type="button" className="text-xs font-medium text-leaf underline" onClick={() => onOpen("wishes")}>
              See all{hidden ? ` (${hidden} hidden)` : ""}
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {wishes.slice(0, 4).map((w) => (
              <li key={w.id} className={w.hidden ? "opacity-50" : ""}>
                <span className="font-medium text-leaf">{w.name}</span>
                <span className="text-ink/70"> — {w.message.length > 70 ? `${w.message.slice(0, 70)}…` : w.message}</span>
              </li>
            ))}
            {wishes.length === 0 && <li className="text-ink/50">No wishes yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
