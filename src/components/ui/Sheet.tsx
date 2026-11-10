"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Portal } from "./Portal";

/**
 * Modal that slides up from the bottom on phones and centres on larger screens.
 * Closes on backdrop click, the X button and Escape. `tone="green"` is the
 * gift-box style (green title bar on cream); `light` is the plain RSVP card.
 */
export function Sheet({
  open,
  onClose,
  title,
  closeLabel,
  tone = "light",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  closeLabel: string;
  tone?: "light" | "green";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
    };
  }, [open, onClose]);

  const green = tone === "green";

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className={`relative max-h-[90vh] w-full overflow-y-auto overscroll-contain shadow-2xl ${
                green
                  ? "max-w-lg rounded-t-[16px] bg-paper sm:max-w-xl sm:rounded-[16px]"
                  : "max-w-[440px] rounded-t-[28px] bg-[#fffdf3] font-roboto sm:rounded-[28px]"
              }`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={green ? "bg-leaf px-6 pb-4 pt-6 text-center" : "px-6 pt-6"}>
                <h3
                  className={
                    green
                      ? "font-tnr text-[20px] font-bold uppercase text-white md:text-[24px]"
                      : "pr-10 text-xl font-semibold text-ink"
                  }
                  style={green ? { textShadow: "1px 1px 2px rgba(0,0,0,0.2)" } : undefined}
                >
                  {title}
                </h3>
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={onClose}
                  className={`absolute grid size-8 place-items-center rounded-full text-base leading-none transition ${
                    green
                      ? "right-3 top-3 text-white/80 hover:bg-white/20 hover:text-white"
                      : "right-4 top-4 bg-black/5 text-ink/70 hover:bg-black/10"
                  }`}
                >
                  ✕
                </button>
              </div>
              <div className={green ? "p-4 sm:p-6" : "px-6 pb-7 pt-4"}>{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
