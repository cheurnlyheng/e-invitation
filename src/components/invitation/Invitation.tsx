"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MotionConfig } from "motion/react";
import { invitation } from "@/config/invitation";
import { ui } from "@/config/strings";
import { ART } from "@/components/decor/Flower";
import { trackEvent } from "@/lib/api";
import { useLang } from "@/lib/lang-store";
import { useAutoScroll } from "@/lib/use-auto-scroll";
import { Cover } from "./Cover";
import { Gallery } from "./Gallery";
import { GiftBox } from "./GiftBox";
import { Guestbook } from "./Guestbook";
import { Header, HeroClipDefs } from "./Header";
import { InfoSection } from "./InfoSection";
import { LangSwitch } from "./LangSwitch";
import { ReceptionInfo } from "./ReceptionInfo";
import { Rsvp } from "./Rsvp";
import { FloatingBar } from "./FloatingBar";
import { Schedule } from "./Schedule";
import { Venue } from "./Venue";
import { useT } from "./context";

/** Background music: starts from the Open tap (browsers require a gesture) and pauses while the tab is hidden. */
function useMusic(src: string, volume: number) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const resumeOnVisible = useRef(false);

  const play = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    a.volume = volume;
    a.play().catch(() => {
      // blocked or the file is missing; the button stays in the "off" state
    });
  }, [volume]);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) play();
    else a.pause();
  }, [play]);

  useEffect(() => {
    const onVisibility = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden && !a.paused) {
        a.pause();
        resumeOnVisible.current = true;
      } else if (!document.hidden && resumeOnVisible.current) {
        resumeOnVisible.current = false;
        play();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [play]);

  const element = <audio ref={audio} src={src} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />;
  return { element, playing, play, toggle };
}

/** Thank-you line and the big lotus that closes the page. */
function Closing() {
  const { t } = useT();
  const a = ART.flower4Bottom;
  return (
    <>
      <span className="mx-auto flex flex-col items-center gap-1 whitespace-pre-line px-6 text-center font-roboto text-[11px] text-leaf md:max-w-[560px] md:text-[13px]">
        <span>{t(ui.gift.note)}</span>
      </span>
      <div className="pointer-events-none relative z-[1] mt-[-24px] flex w-full justify-center overflow-hidden" style={{ aspectRatio: "441 / 300" }}>
        <Image
          src={a.src}
          width={a.w}
          height={a.h}
          alt=""
          aria-hidden="true"
          unoptimized
          className="mt-[10%] block h-auto w-[120.63%] max-w-none shrink-0 self-start object-contain"
          style={{ transform: "scaleX(-1)", filter: "drop-shadow(rgba(18, 77, 0, 0.18) 3px 4px 3px)" }}
        />
      </div>
    </>
  );
}

export function Invitation() {
  const [opened, setOpened] = useState(false);
  const { lang } = useLang();
  const music = useMusic(invitation.music.src, invitation.music.volume);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => trackEvent("view"), []);
  useAutoScroll(opened, 51);

  const open = () => {
    music.play(); // must run inside the tap handler to be allowed to autoplay
    trackEvent("open");
    setOpened(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      {music.element}
      <Cover opened={opened} onOpen={open} />

      <main className="min-h-screen w-full" aria-hidden={!opened}>
        <div className="flex w-full justify-center overflow-x-clip bg-white">
          <div
            className="relative isolate w-full max-w-[480px] overflow-hidden md:mx-auto md:max-w-[900px] md:border md:border-[#5e813c33]"
            style={{ backgroundColor: "#fffbed", color: "#124d00" }}
          >
            <div className="paper-grain pointer-events-none absolute inset-0 z-0 mix-blend-multiply" style={{ opacity: 0.5 }} />
            <HeroClipDefs />

            <div className="relative z-10 flex flex-col items-center gap-[23px]">
              <Header />
              <InfoSection />
              <Gallery />
              <ReceptionInfo />
              <Rsvp />
              <Venue />
              <Schedule />
              <Guestbook />
              <GiftBox />
              <Closing />
            </div>
          </div>
        </div>
      </main>

      {opened && (
        <>
          <LangSwitch className="fixed top-3 z-40 right-[max(0.75rem,calc((100vw_-_var(--column))/2_+_0.75rem))]" />
          <FloatingBar playing={music.playing} onToggleMusic={music.toggle} />
        </>
      )}
    </MotionConfig>
  );
}
