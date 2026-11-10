"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { invitation } from "@/config/invitation";
import { ui } from "@/config/strings";
import { num } from "@/lib/format";
import { GhostFlower } from "@/components/decor/Flower";
import { Portal } from "@/components/ui/Portal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useT } from "./context";

const AUTOPLAY_MS = 3600;
const PAUSE_AFTER_TOUCH_MS = 9000;
const SWIPE_PX = 40;
const pauseDeadline = () => Date.now() + PAUSE_AFTER_TOUCH_MS;

/** Transform for a slide `o` positions away from the active one (same table as the reference). */
function slideStyle(o: number): CSSProperties {
  const a = Math.abs(o);
  return {
    aspectRatio: "0.8 / 1",
    transitionDuration: "1100ms",
    transform: `translateX(${o * 60}%) translateZ(${-150 * a}px) rotateY(${o * 45}deg) scale(${a === 0 ? 1 : a === 1 ? 0.85 : 0.7})`,
    opacity: [1, 0.75, 0.5, 0.3, 0.3, 0.3][Math.min(a, 5)],
    zIndex: 100 - a,
  };
}

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Lightbox({ index, onChange, onClose }: { index: number | null; onChange: (i: number) => void; onClose: () => void }) {
  const { lang, t } = useT();
  const photos = invitation.photos.gallery;
  const n = photos.length;
  const open = index !== null;
  const cur = index ?? 0;
  const step = useCallback((d: number) => onChange(((cur + d) % n + n) % n), [cur, n, onChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
    };
  }, [open, onClose, step]);

  const arrow = "absolute z-10 grid size-9 place-items-center rounded-full text-2xl text-white hover:bg-white/20 sm:size-11 sm:text-4xl";

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col items-center bg-black/85 px-2 pb-4 pt-10 sm:px-4 sm:pb-6 sm:pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute left-2 top-2 z-10 rounded-full bg-black/40 px-2 py-1 text-sm text-white shadow-md sm:left-4 sm:top-4 sm:px-3 sm:text-lg">
              {num(cur + 1, lang)} / {num(n, lang)}
            </div>
            <button type="button" aria-label={t(ui.lightbox.close)} onClick={onClose} className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full text-xl text-white hover:bg-white/20 sm:right-4 sm:top-4 sm:text-2xl">
              ✕
            </button>

            <div className="relative flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center px-8 sm:px-12">
              <button type="button" aria-label={t(ui.lightbox.prev)} onClick={(e) => { e.stopPropagation(); step(-1); }} className={`${arrow} left-0 sm:left-2`}>
                ‹
              </button>
              <Image
                key={cur}
                src={photos[cur].src}
                alt={t(photos[cur].alt)}
                width={1080}
                height={1350}
                sizes="(min-width: 640px) 700px, 90vw"
                className="max-h-full w-auto max-w-full select-none rounded-xl object-contain shadow-2xl sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button type="button" aria-label={t(ui.lightbox.next)} onClick={(e) => { e.stopPropagation(); step(1); }} className={`${arrow} right-0 sm:right-2`}>
                ›
              </button>
            </div>

            <div
              className="mt-3 flex max-w-[90vw] flex-shrink-0 gap-2 overflow-x-auto rounded-lg bg-black/30 px-2 py-2 backdrop-blur-sm sm:mt-4 sm:max-w-[80vw] sm:gap-3 sm:px-4 sm:py-3"
              style={{ scrollbarWidth: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  aria-label={t(p.alt)}
                  onClick={() => onChange(i)}
                  className={`relative size-12 flex-shrink-0 overflow-hidden rounded-md transition-all duration-200 sm:size-16 sm:rounded-lg ${i === cur ? "scale-105 shadow-lg" : "opacity-60 hover:opacity-100"}`}
                  style={i === cur ? { outline: "2px solid #5e813c", outlineOffset: 2 } : undefined}
                >
                  <Image src={p.src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/** 3D coverflow carousel: tap a side photo to bring it forward, tap the centre one to enlarge it. */
export function Gallery() {
  const { lang, t } = useT();
  const photos = invitation.photos.gallery;
  const n = photos.length;
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useRef(false);
  const pausedUntil = useRef(0);
  const dragStart = useRef<number | null>(null);
  const swiped = useRef(false);

  const go = useCallback((to: number) => setIndex(((to % n) + n) % n), [n]);
  const interact = () => {
    pausedUntil.current = pauseDeadline();
  };

  // advance on its own, but only while on screen and not right after the visitor touched it
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const id = setInterval(() => {
      if (inView.current && Date.now() >= pausedUntil.current) setIndex((i) => (i + 1) % n);
    }, AUTOPLAY_MS);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, [n]);

  const btn = "absolute top-1/2 z-[200] hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70 md:flex";

  return (
    <section className="relative isolate flex w-full flex-col items-center py-[35px]">
      <GhostFlower art="flower6" left="10.44%" top="43%" width={76.43} rotate={-158.91} flipY />

      <div className="relative z-10 flex w-full flex-col items-center px-6">
        <SectionTitle>{t(ui.gallery.title)}</SectionTitle>

        <div data-no-autoscroll className="relative z-10 mt-[18px] w-full max-w-[334px] md:max-w-[560px]">
          <div
            ref={stage}
            className="relative h-[340px] touch-pan-y select-none md:h-[520px]"
            onPointerDown={(e) => {
              dragStart.current = e.clientX;
              swiped.current = false;
            }}
            onPointerUp={(e) => {
              if (dragStart.current === null) return;
              const dx = e.clientX - dragStart.current;
              dragStart.current = null;
              if (Math.abs(dx) > SWIPE_PX) {
                swiped.current = true;
                interact();
                go(index + (dx < 0 ? 1 : -1));
              }
            }}
          >
            <button type="button" aria-label="Previous photo" className={`${btn} left-0`} onClick={() => { interact(); go(index - 1); }}>
              <Chevron dir="l" />
            </button>
            <button type="button" aria-label="Next photo" className={`${btn} right-0`} onClick={() => { interact(); go(index + 1); }}>
              <Chevron dir="r" />
            </button>

            <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: 1000 }}>
              {photos.map((p, i) => {
                const d = (((i - index) % n) + n) % n;
                const o = d >= n / 2 ? d - n : d;
                return (
                  <div
                    key={p.src}
                    role="button"
                    tabIndex={0}
                    aria-label={t(p.alt)}
                    className={`absolute h-[92%] cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all ease-in-out ${o === 0 ? "ring-2 ring-white/30" : ""}`}
                    style={slideStyle(o)}
                    onClick={() => {
                      if (swiped.current) return;
                      interact();
                      if (o === 0) setLightbox(i);
                      else go(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (o === 0) setLightbox(i);
                        else go(i);
                      }
                    }}
                  >
                    <Image src={p.src} alt="" fill sizes="(min-width: 768px) 420px, 260px" className="object-cover" draggable={false} priority={i < 2} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <span className="text-sm tabular-nums opacity-60">
              {num(index + 1, lang)} / {num(n, lang)}
            </span>
          </div>
        </div>
      </div>

      <Lightbox index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
