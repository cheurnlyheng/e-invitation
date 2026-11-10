"use client";

import { useSyncExternalStore } from "react";

// Whether the RSVP form is open. Shared so the button in the page and the floating
// button can both open the one form.
let open = false;
const listeners = new Set<() => void>();

function set(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((l) => l());
}

export const openRsvp = () => set(true);
export const closeRsvp = () => set(false);

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useRsvpOpen = () => useSyncExternalStore(subscribe, () => open, () => false);
