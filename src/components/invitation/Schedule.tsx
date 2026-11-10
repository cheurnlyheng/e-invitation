"use client";

import Image from "next/image";
import { invitation, type ScheduleItem } from "@/config/invitation";
import { ui } from "@/config/strings";
import { num } from "@/lib/format";
import { GhostFlower, ParallaxFlower } from "@/components/decor/Flower";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useT } from "./context";

const MEDALLION = {
  ring: { src: "/ref/medallion-ring.webp", w: 88, h: 88 },
  drink: { src: "/ref/medallion-drink.webp", w: 88, h: 88 },
  cake: { src: "/ref/medallion-cake.webp", w: 67, h: 88 },
} as const;

function Row({ item, first, last }: { item: ScheduleItem; first: boolean; last: boolean }) {
  const { lang, t } = useT();
  const [h, m] = item.time.split(":");
  const icon = item.icon && MEDALLION[item.icon];
  // the vertical rule runs from this dot to the next row's dot (and from the previous one)
  const line = `absolute left-1/2 w-px -translate-x-1/2 bg-leaf ${first ? "top-1/2" : "-top-8 md:-top-10"} ${last ? "bottom-1/2" : "-bottom-8 md:-bottom-10"}`;

  return (
    <li className="contents">
      <span className="pt-0.5 text-right text-[16px] leading-snug tracking-wide text-leaf tabular-nums md:text-[17px]">
        <span className="relative inline-block">
          {icon && (
            <span aria-hidden="true" className="absolute right-full top-1/2 flex w-max -translate-y-1/2 items-center justify-center" style={{ marginRight: 30 }}>
              <Image src={icon.src} width={icon.w} height={icon.h} alt="" unoptimized className="block h-11 w-auto shrink-0 object-contain" style={{ filter: "drop-shadow(rgba(18, 77, 0, 0.18) 3px 4px 3px)" }} />
            </span>
          )}
          {num(h, lang)}:{num(m, lang)}
        </span>
      </span>
      <span aria-hidden="true" className="relative flex items-center justify-center self-stretch">
        <span className={line} />
        <span className="relative block size-2.5 rounded-full bg-leaf" style={{ boxShadow: "color-mix(in srgb, #5e813c 13%, transparent) 0 0 0 2px" }} />
      </span>
      <span className="pt-0.5 text-start text-[13px] leading-snug text-leaf md:text-[15px]">
        <span>{t(item.label)}</span>
      </span>
    </li>
  );
}

/** Vertical timeline of the wedding day, with small medallions beside a few times. */
export function Schedule() {
  const { t } = useT();
  const items = invitation.schedule;

  return (
    <section className="relative isolate flex w-full flex-col items-center">
      <GhostFlower art="flower6" left="10.33%" top="56%" width={76.43} rotate={-158.91} flipY />
      <ParallaxFlower art="flower1" left="107.02%" top="-5%" width={41.73} rotate={-20.63} speed={0.07} />

      <div className="relative z-10 flex w-full flex-col items-center gap-[13px] px-6 py-[37px]">
        <SectionTitle>{t(ui.schedule.title)}</SectionTitle>
        <ol className="relative mx-auto grid w-full max-w-[460px] grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-x-6 gap-y-8 font-tnr md:gap-x-8 md:gap-y-10">
          {items.map((item, i) => (
            <Row key={item.time + i} item={item} first={i === 0} last={i === items.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
