"use client";

import { useEffect, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { invitation } from "@/config/invitation";
import { ui } from "@/config/strings";
import { formatDate } from "@/lib/format";
import { useGuestName } from "@/lib/use-guest-name";
import { ART } from "@/components/decor/Flower";
import { Blossoms } from "@/components/decor/Blossoms";
import { LangSwitch } from "./LangSwitch";
import { useT } from "./context";

const CARD_PAPER =
  'linear-gradient(rgba(255,251,237,0.5), rgba(255,251,237,0.5)), url("/ref/paper-grain.svg") 50% 0 / 600px auto repeat, #fffbed';

function CornerFlower({ className, style }: { className: string; style?: CSSProperties }) {
  const a = ART.flower6;
  return (
    <Image src={a.src} width={a.w} height={a.h} alt="" aria-hidden="true" unoptimized loading="eager" className={`pointer-events-none absolute z-0 h-36 w-auto max-w-none opacity-90 md:h-60 ${className}`} style={style} />
  );
}

/** Full-screen cover. Tapping Open starts the music (browsers need a tap) and reveals the page. */
export function Cover({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const { lang, t } = useT();
  const guest = useGuestName();
  const { groom, bride } = invitation.couple;
  const first = invitation.events[0];

  // Keep the page behind the cover from scrolling until it is opened.
  useEffect(() => {
    if (opened) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [opened]);

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          key="cover"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at top, #e9efdc 0%, #dbe5c9 55%, #c7d4b1 100%)" }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Blossoms count={14} />
          <LangSwitch className="absolute right-4 top-4 z-20" />

          <div className="relative" style={{ zIndex: 10 }}>
            <motion.div
              className="relative w-[310px] sm:w-[340px] md:w-[520px] lg:w-[600px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="absolute left-1/2 z-30 flex items-center justify-center rounded-full"
                style={
                  {
                    top: 50,
                    width: 56,
                    height: 56,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle at 30% 30%, #5e813c, rgb(64, 99, 30))",
                    "--shadow-color": "rgba(94, 129, 60, 0.5)",
                    boxShadow: "0 4px 20px rgba(94, 129, 60, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
                    animation: "seal-pulse 2s ease-in-out infinite",
                  } as CSSProperties
                }
              >
                <svg viewBox="0 0 24 24" className="size-7" style={{ fill: "#fefbf4" }} aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              <div className="relative rounded-lg" style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.2), 0 0 40px rgba(94,129,60,0.15)" }}>
                <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ background: CARD_PAPER, border: "1px solid rgba(94,129,60,0.15)", clipPath: "inset(0 round 8px)" }}>
                  <CornerFlower className="left-[-14px] top-[-5%] -translate-x-[6%] rotate-[25deg] md:left-[-26px] md:top-[10%] md:-translate-x-[11%]" />
                  <CornerFlower className="bottom-[-8%] right-[-14px] translate-x-[6%] -rotate-[25deg] -scale-x-100 md:bottom-[32%] md:right-[-26px] md:translate-x-[11%]" />
                </div>

                <div className="relative z-10 px-6 pb-14 pt-28 text-center md:pb-8 md:pt-24">
                  <h1 className="mb-2 flex flex-col items-center text-3xl leading-tight text-leaf sm:text-4xl" style={{ fontFamily: "var(--font-names)" }}>
                    <span className="block w-full text-center">{t(groom.name)}</span>
                    <span className="block w-full text-center text-lg leading-none sm:text-xl" style={{ fontFamily: "var(--font-amp)" }}>
                      &amp;
                    </span>
                    <span className="block w-full text-center">{t(bride.name)}</span>
                  </h1>

                  <div className="mb-2 flex items-center justify-center gap-3">
                    <div className="h-px w-10" style={{ background: "linear-gradient(to right, transparent, #5e813c)" }} />
                    <span className="text-sm text-leaf" style={{ opacity: 0.7 }}>
                      ❦
                    </span>
                    <div className="h-px w-10" style={{ background: "linear-gradient(to left, transparent, #5e813c)" }} />
                  </div>

                  <div className="mb-5 flex flex-col items-center font-lora text-[18px] text-ink">
                    <span>{formatDate(first.date, lang)}</span>
                  </div>

                  <div className="mx-auto mb-6 max-w-[300px] md:max-w-[380px] lg:max-w-[440px]">
                    <p className="mb-2 font-lora text-[18px] font-light text-ink">
                      <span>{t(ui.cover.invites)}</span>
                    </p>
                    {guest && <p className="break-words font-lora text-[20px] font-semibold text-leaf">{guest}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={onOpen}
                    className="relative mx-auto flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full px-8 py-2.5 font-lora text-lg font-semibold shadow-lg sm:font-medium"
                    style={{ backgroundColor: "#5e813c", color: "#fefbf4", boxShadow: "0 4px 14px rgba(94,129,60,0.35)" }}
                  >
                    <span>{t(ui.cover.open)}</span>
                    <div
                      className="pointer-events-none absolute top-0 h-full w-8"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "shine 3s ease-in-out infinite" }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
