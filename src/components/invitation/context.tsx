"use client";

import { useLang } from "@/lib/lang-store";
import type { L10n } from "@/lib/i18n";

/** Returns a translator bound to the active language: t(ui.cover.open). */
export function useT() {
  const { lang } = useLang();
  return { lang, t: (v: L10n) => v[lang] };
}
