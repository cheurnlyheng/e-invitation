"use client";

import { ui } from "@/config/strings";
import { openRsvp } from "@/lib/rsvp-store";
import { useT } from "./context";

/**
 * "Confirm Attendance" pinned to the bottom centre of the screen so guests who are not used
 * to websites can always find it. It opens the same form as the button further down the page.
 * Rendered inside <FloatingBar>, which handles the positioning.
 */
export function RsvpFab() {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={openRsvp}
      className="pointer-events-auto relative inline-flex max-w-full items-center justify-center overflow-hidden rounded-full px-4 py-3 font-tnr text-[12px] font-bold uppercase min-[380px]:px-7 min-[380px]:text-[14px] text-btn-text shadow-[0_8px_24px_rgba(47,79,39,0.45)] ring-1 ring-white/40 transition-transform hover:scale-[1.03] active:scale-95"
      style={{ background: "linear-gradient(to bottom, #6a8f45, #5e813c)" }}
    >
      <span className="relative z-10">{t(ui.reception.confirm)}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 h-full w-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", animation: "shine 3.2s ease-in-out infinite" }}
      />
    </button>
  );
}
