"use client";

import type { Wish } from "@/server/store";
import { when } from "./format";

export function WishList({ wishes, onHide, onDelete }: { wishes: Wish[]; onHide: (id: number, hidden: boolean) => void; onDelete: (id: number) => void }) {
  const btn = "rounded-full px-3 py-1 text-xs font-medium ring-1 transition";
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink/60">Hidden wishes stay here but disappear from the guestbook.</p>
        <a href="/api/admin/export?type=wishes" download className="shrink-0 rounded-full bg-white px-3 py-1 text-sm text-leaf ring-1 ring-leaf/40 hover:bg-leaf/10">
          Download CSV
        </a>
      </div>

      <ul className="mt-3 space-y-3">
        {wishes.map((w) => (
          <li key={w.id} className={`rounded-2xl border border-black/10 bg-white p-4 shadow-sm ${w.hidden ? "opacity-60" : ""}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-leaf">{w.name}</p>
              <p className="shrink-0 text-xs text-ink/50">{when(w.createdAt)}</p>
            </div>
            <p className="mt-1.5 whitespace-pre-line break-words text-sm">{w.message}</p>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => onHide(w.id, !w.hidden)} className={`${btn} text-ink/70 ring-black/15 hover:bg-black/5`}>
                {w.hidden ? "Show in guestbook" : "Hide from guestbook"}
              </button>
              <button type="button" onClick={() => window.confirm("Delete this wish for good?") && onDelete(w.id)} className={`${btn} text-red-600 ring-red-200 hover:bg-red-50`}>
                Delete
              </button>
              {w.hidden && <span className="text-xs text-ink/50">Hidden from guests</span>}
            </div>
          </li>
        ))}
        {wishes.length === 0 && <li className="rounded-2xl border border-black/10 bg-white px-4 py-8 text-center text-sm text-ink/50">No wishes yet.</li>}
      </ul>
    </div>
  );
}
