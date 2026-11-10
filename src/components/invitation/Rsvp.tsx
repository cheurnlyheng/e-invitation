"use client";

import { useState } from "react";
import { ui } from "@/config/strings";
import { submitRsvp } from "@/lib/api";
import { num } from "@/lib/format";
import { closeRsvp, openRsvp, useRsvpOpen } from "@/lib/rsvp-store";
import { Sheet } from "@/components/ui/Sheet";
import { useT } from "./context";

const MAX_GUESTS = 5;

function Choice({ checked, onSelect, children }: { checked: boolean; onSelect: () => void; children: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[0.95rem] font-medium transition ${
        checked ? "border-leaf bg-leaf/10 text-ink" : "border-black/10 bg-white text-ink/80"
      }`}
    >
      <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs ${checked ? "bg-leaf text-white" : "bg-black/10 text-transparent"}`}>✓</span>
      {children}
    </button>
  );
}

/** "Confirm Attendance" button plus its modal form. */
export function Rsvp() {
  const { lang, t } = useT();
  const open = useRsvpOpen();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const canSubmit = name.trim().length > 0 && attending !== null && state !== "sending";

  async function submit() {
    if (!canSubmit || attending === null) return;
    setState("sending");
    try {
      await submitRsvp({ name, attending, guests });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center">
      <button
        type="button"
        onClick={openRsvp}
        className="inline-flex items-center justify-center rounded-[7px] bg-leaf px-8 py-2 font-tnr text-[13px] uppercase text-btn-text transition-transform hover:scale-[1.03]"
      >
        <span className="relative z-10 flex min-h-0 items-center justify-center gap-2">
          <span>{t(ui.reception.confirm)}</span>
        </span>
      </button>

      <Sheet open={open} onClose={closeRsvp} title={t(ui.rsvp.title)} closeLabel={t(ui.rsvp.close)}>
        {state === "done" ? (
          <div className="py-8 text-center">
            <svg viewBox="0 0 24 24" className="mx-auto size-12 text-rose-400" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <p className="mt-4 text-[1rem] leading-relaxed text-ink">{t(attending ? ui.rsvp.thanksYes : ui.rsvp.thanksNo)}</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-4"
          >
            <p className="text-sm leading-relaxed text-ink/65">{t(ui.rsvp.intro)}</p>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink/80">{t(ui.rsvp.name)}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder={t(ui.rsvp.namePh)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/25"
              />
            </label>

            <div role="radiogroup" aria-label={t(ui.rsvp.question)} className="space-y-2">
              <span className="block text-sm font-semibold text-ink/80">{t(ui.rsvp.question)}</span>
              <Choice checked={attending === true} onSelect={() => setAttending(true)}>
                {t(ui.rsvp.yes)}
              </Choice>
              <Choice checked={attending === false} onSelect={() => setAttending(false)}>
                {t(ui.rsvp.no)}
              </Choice>
            </div>

            {attending && (
              <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-2.5">
                <span className="text-sm font-semibold text-ink/80">{t(ui.rsvp.guests)}</span>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="−" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid size-8 place-items-center rounded-full bg-black/5 text-lg">
                    −
                  </button>
                  <span className="w-5 text-center font-semibold">{num(guests, lang)}</span>
                  <button type="button" aria-label="+" onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))} className="grid size-8 place-items-center rounded-full bg-black/5 text-lg">
                    +
                  </button>
                </div>
              </div>
            )}

            {state === "error" && <p className="text-sm text-red-600">{t(ui.rsvp.error)}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-leaf py-3 text-base font-semibold text-white transition enabled:active:scale-[0.98] disabled:bg-leaf/35"
            >
              {t(state === "sending" ? ui.rsvp.sending : ui.rsvp.submit)}
            </button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
