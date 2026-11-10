"use client";

import { useSyncExternalStore } from "react";

// Personalised links look like /?to=Sokha — the name shows on the cover.
// React renders it as text, so the value can't inject markup.
const noop = () => () => {};

/** The ?to= name from the current URL, trimmed and capped (empty when there is none). */
export function readGuestFromUrl(): string {
  return (new URLSearchParams(window.location.search).get("to") ?? "").trim().slice(0, 60);
}

export function useGuestName(): string {
  return useSyncExternalStore(noop, readGuestFromUrl, () => "");
}
