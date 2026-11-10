"use client";

import { LANGS } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";

const LABEL = { km: "ខ្មែរ", en: "EN" } as const;

/** Khmer / English toggle. Reads and writes the shared language store. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex overflow-hidden rounded-full border border-leaf/40 bg-paper/90 font-roboto text-[13px] shadow-sm backdrop-blur ${className}`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`px-3.5 py-1 transition ${lang === l ? "bg-leaf text-white" : "text-ink hover:bg-leaf/10"}`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
