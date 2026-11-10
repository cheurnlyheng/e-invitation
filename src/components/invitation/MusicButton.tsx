"use client";

import { ui } from "@/config/strings";
import { useT } from "./context";

const BARS = [
  { cls: "animate-dance-1", h: "60%" },
  { cls: "animate-dance-2", h: "100%" },
  { cls: "animate-dance-3", h: "40%" },
  { cls: "animate-dance-4", h: "80%" },
];

/** Floating spinning-disc button with dancing bars; mutes / resumes the background music. */
export function MusicButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  const { t } = useT();
  return (
    <div className="pointer-events-auto absolute right-4 top-1/2 flex -translate-y-1/2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={t(playing ? ui.music.on : ui.music.off)}
        aria-pressed={playing}
        className="relative size-12 cursor-pointer rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none active:scale-95"
      >
        <div
          className={`absolute inset-0 rounded-full ${playing ? "animate-spin-cd" : ""}`}
          style={{ background: "linear-gradient(to right bottom, rgba(94,129,60,0.8), rgb(94,129,60), rgba(94,129,60,0.867))" }}
        >
          <div className="absolute inset-1 rounded-full border border-white/20" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
            {BARS.map((b) => (
              <div key={b.cls} className={`w-1 origin-bottom rounded-full bg-white ${playing ? b.cls : ""}`} style={{ height: b.h, transform: playing ? undefined : "scaleY(0.5)" }} />
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}
