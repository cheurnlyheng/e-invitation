"use client";

import { useSyncExternalStore } from "react";
import { readGuestFromUrl } from "./use-guest-name";

/** Browser-side calls to the site's own API (src/app/api). */

export type Wish = { id: number; name: string; message: string; createdAt: string };
export type RsvpInput = { name: string; attending: boolean; guests: number };

async function post(url: string, body: unknown): Promise<Response> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  await res.text(); // always read the body so the connection is released
  if (!res.ok) throw new Error(`${url} failed with ${res.status}`);
  return res;
}

export async function submitRsvp(input: RsvpInput): Promise<void> {
  // invitedAs = the name in a personal link (?to=Sokha), so the couple can match answers to invitations
  await post("/api/rsvp", { ...input, invitedAs: readGuestFromUrl() });
}

// ---------------------------------------------------------------------------
// Guestbook: one shared list, loaded on first use and refreshed after posting
// ---------------------------------------------------------------------------

const EMPTY: Wish[] = [];
const listeners = new Set<() => void>();
let wishes: Wish[] = EMPTY;
let started = false;

async function refreshWishes() {
  try {
    const res = await fetch("/api/wishes", { cache: "no-store" });
    if (!res.ok) return;
    wishes = ((await res.json()) as { wishes: Wish[] }).wishes;
    listeners.forEach((l) => l());
  } catch {
    // offline or the server is down: keep showing whatever we already have
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!started) {
    started = true;
    void refreshWishes();
  }
  return () => {
    listeners.delete(cb);
  };
}

/** Public wishes, newest first. Empty on the server and until the first load finishes. */
export function useWishes(): Wish[] {
  return useSyncExternalStore(subscribe, () => wishes, () => EMPTY);
}

export async function submitWish(input: { name: string; message: string }): Promise<void> {
  await post("/api/wishes", input);
  await refreshWishes();
}

// ---------------------------------------------------------------------------
// Visit tracking: "view" = page loaded, "open" = guest tapped Open
// ---------------------------------------------------------------------------

function visitorId(): string {
  try {
    let id = window.localStorage.getItem("ei:visitor");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem("ei:visitor", id);
    }
    return id;
  } catch {
    return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function trackEvent(kind: "view" | "open"): void {
  try {
    // count a page view once per browser tab, not on every refresh
    if (kind === "view") {
      if (window.sessionStorage.getItem("ei:viewed")) return;
      window.sessionStorage.setItem("ei:viewed", "1");
    }
  } catch {
    // storage blocked: just count it
  }
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, visitor: visitorId(), guest: readGuestFromUrl() }),
  })
    .then((res) => res.text()) // read the body so the request completes cleanly
    .catch(() => {});
}
