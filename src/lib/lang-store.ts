"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "./i18n";

const KEY = "ei:lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

// ?lang=en|km wins (shared links), then the visitor's saved choice, then Khmer.
function detect(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "en" || fromUrl === "km") return fromUrl;
    const saved = window.localStorage.getItem(KEY);
    if (saved === "en" || saved === "km") return saved;
  } catch {
    // storage can be blocked (private mode); fall through to the default
  }
  return "km";
}

function getSnapshot(): Lang {
  if (current === null) current = detect();
  return current;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    // ignore, the choice just won't persist
  }
  listeners.forEach((l) => l());
}

export function useLang() {
  // The server always renders Khmer; the client switches right after hydration.
  const lang = useSyncExternalStore(subscribe, getSnapshot, (): Lang => "km");
  return { lang, setLang };
}
