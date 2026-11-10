"use client";

import { useEffect } from "react";

const NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
const FIELD = "input, textarea, select, [contenteditable='true']";
// Things a visitor operates rather than reads. Tapping one of these never resumes the scroll.
// Mark any other interactive block (like the photo gallery) with data-no-autoscroll.
const DYNAMIC = "a, button, input, textarea, select, label, summary, iframe, video, audio, [role='button'], [role='radio'], [role='dialog'], [contenteditable='true'], [data-no-autoscroll]";

/**
 * Gently scrolls the page down on its own once the invitation is opened, like
 * the reference template.
 *  - Scrolling by hand (wheel, swipe, arrow keys, dragging the scrollbar) pauses it.
 *  - Tapping or clicking a plain part of the page (background, text, decoration) resumes it.
 *    Tapping something interactive does not: text boxes, buttons, links, the photo gallery
 *    (so a guest can type a wish or browse photos without the page sliding away).
 *  - It holds still while a pop-up (RSVP, gift box, photo viewer) is open.
 *  - It is skipped entirely for visitors who prefer reduced motion.
 */
export function useAutoScroll(active: boolean, pxPerSecond = 51, startDelayMs = 1200) {
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mountedAt = performance.now();
    let running = false;
    let raf = 0;
    let pos = 0;
    let last = 0;

    const popupOpen = () => document.querySelector('[role="dialog"]') !== null;

    const pause = () => {
      running = false;
      clearTimeout(starter);
      cancelAnimationFrame(raf);
    };

    const tick = (now: number) => {
      if (!running) return;
      // The browser rounds scroll offsets; a bigger jump means someone else moved the page.
      if (Math.abs(window.scrollY - pos) > 4) return pause();
      if (popupOpen()) {
        pos = window.scrollY;
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      pos += ((now - last) / 1000) * pxPerSecond;
      last = now;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (pos >= max) return pause(); // reached the end
      window.scrollTo(0, pos);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      pos = window.scrollY;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onKey = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key) && !(e.target instanceof Element && e.target.closest(FIELD))) pause();
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.matches(FIELD)) pause();
    };
    const onClick = (e: MouseEvent) => {
      // the tap on "Open" that revealed the page is still being delivered; it must not count
      if (e.timeStamp < mountedAt) return;
      if (e.target instanceof Element && e.target.closest(DYNAMIC)) return;
      // wait a tick so a click that opens a pop-up is judged after the pop-up exists
      setTimeout(() => {
        if (!popupOpen()) start();
      }, 0);
    };

    const starter = setTimeout(start, startDelayMs);
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchmove", pause, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("focusin", onFocus);
    window.addEventListener("click", onClick);

    return () => {
      pause();
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchmove", pause);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("focusin", onFocus);
      window.removeEventListener("click", onClick);
    };
  }, [active, pxPerSecond, startDelayMs]);
}
