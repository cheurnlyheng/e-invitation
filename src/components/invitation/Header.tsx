"use client";

import Image from "next/image";
import { invitation } from "@/config/invitation";
import { Flower, GhostFlower, ParallaxFlower } from "@/components/decor/Flower";
import { HERO_CLIP_PATH } from "./hero-clip";
import { useT } from "./context";

const CLIP_ID = "hero-clip";

/** SVG definition of the hero photo's outline; render once per page. */
export function HeroClipDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d={HERO_CLIP_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Names over a huge faded "&", then the photo inside its scalloped outline. */
export function Header() {
  const { t } = useT();
  const { groom, bride } = invitation.couple;
  const name = "block whitespace-nowrap font-tnr text-[32px] md:text-[38px] font-normal uppercase italic leading-tight text-leaf";

  return (
    <header className="relative isolate flex w-full flex-col items-center pb-[61px] pt-[92px]">
      <GhostFlower art="flower3" left="26.82%" top="21%" width={73.16} rotate={-155.73} flipY />
      <GhostFlower art="flower3" left="82.96%" top="69%" width={73.16} rotate={-24.27} />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-0 select-none font-whisper text-[400px] leading-none md:text-[460px]"
        style={{ left: "22.1%", top: 110, transform: "translate(-50%, -50%)", color: "rgba(11, 46, 0, 0.1)" }}
      >
        &amp;
      </span>

      <div className="relative z-20 w-full">
        <div className="w-full pl-[16.8%] pr-[6%] text-left">
          <span className={name}>{t(groom.name)}</span>
        </div>
        <div className="mt-[11px] w-full pl-[6%] pr-[16.8%] text-right">
          <span className={name}>{t(bride.name)}</span>
        </div>
      </div>

      <div className="relative z-10 mt-[14px] w-[81.98%]" style={{ aspectRatio: "724 / 1142" }}>
        <div className="absolute inset-0" style={{ clipPath: `url(#${CLIP_ID})` }}>
          <Image src={invitation.photos.hero} alt="" fill sizes="(min-width: 768px) 740px, 400px" priority className="object-cover" />
          <svg aria-hidden="true" viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <path d={HERO_CLIP_PATH} fill="none" stroke="#5e813c" strokeWidth="6" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <Flower eager art="flower10" left="14.7%" top="90.75%" width={41.9} rotate={172.39} flipY />
      </div>

      <ParallaxFlower eager art="flower6" left="96.84%" top="80px" width={43.99} rotate={-53.61} flipX speed={-0.055} />
    </header>
  );
}
