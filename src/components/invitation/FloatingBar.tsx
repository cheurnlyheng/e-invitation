"use client";

import { MusicButton } from "./MusicButton";
import { RsvpFab } from "./RsvpFab";

/**
 * The bottom strip that stays on screen: "Confirm Attendance" in the middle and the music
 * button on the right, both on the same horizontal line. Pop-ups (z-100) cover it.
 */
export function FloatingBar({ playing, onToggleMusic }: { playing: boolean; onToggleMusic: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 z-40" style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
      <div className="relative mx-auto flex w-full max-w-[var(--column)] items-center justify-center px-4">
        <RsvpFab />
        <MusicButton playing={playing} onToggle={onToggleMusic} />
      </div>
    </div>
  );
}
