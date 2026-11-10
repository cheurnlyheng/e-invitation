"use client";

import { useSyncExternalStore } from "react";

// One shared 1s ticker for every countdown on the page. The server snapshot is
// null so prerendered HTML never contains a time that differs from the client's.
const listeners = new Set<() => void>();
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) clearInterval(timer);
  };
}

function getSnapshot() {
  if (now === 0) now = Date.now();
  return now;
}

/** Current time in ms, ticking every second; null until the client has hydrated. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
