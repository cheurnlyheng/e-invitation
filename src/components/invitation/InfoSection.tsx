"use client";

import { invitation, type EventInfo, type Person } from "@/config/invitation";
import { ui } from "@/config/strings";
import { MONTHS, WEEKDAYS, formatTime, num, pad2, parseYmd, weekdayOf } from "@/lib/format";
import { GhostFlower, ParallaxFlower } from "@/components/decor/Flower";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useT } from "./context";

function Parents({ person }: { person: Person }) {
  const { t } = useT();
  const names = "text-[12px] font-semibold text-leaf [overflow-wrap:anywhere] md:text-[14px]";
  return (
    <div className="row-span-4 grid min-w-0 grid-rows-subgrid justify-items-center">
      <span className="text-[12px] text-ink md:text-[14px]">{t(ui.info.mrMrs)}</span>
      <span className={names}>{t(person.parents.father)}</span>
      <span className={names}>{t(person.parents.mother)}</span>
    </div>
  );
}

/** "07 | JANUARY 2027" with the big day numeral. Shared by the info and reception sections. */
export function DateBlock({ date }: { date: string }) {
  const { lang } = useT();
  const d = parseYmd(date);
  return (
    <div className="flex items-center justify-center gap-[9px] text-leaf">
      <span className="font-bask text-[52px] leading-none md:text-[57px]">{num(pad2(d.d), lang)}</span>
      <div className="h-[46px] w-px bg-leaf" />
      <div className="flex flex-col items-start justify-center gap-1 text-left font-tnr">
        <span className="text-[16px] uppercase md:text-[17px]">{MONTHS[lang][d.m - 1]}</span>
        <span className="text-[16px] uppercase md:text-[17px]">{num(d.y, lang)}</span>
      </div>
    </div>
  );
}

export function weekdayLabel(date: string, lang: "km" | "en") {
  const name = WEEKDAYS[lang][weekdayOf(parseYmd(date))];
  return lang === "km" ? `ថ្ងៃ${name}` : name;
}

function EventBlock({ event }: { event: EventInfo }) {
  const { lang, t } = useT();
  return (
    <div className="relative flex flex-col items-center gap-[6px] text-center font-bask">
      <div className="text-leaf">
        <span className="whitespace-pre-line text-center text-[16px] font-normal uppercase md:text-[20px]">
          {t(event.title)}
          {"\n"}
          {t(event.venue)}
        </span>
      </div>
      <div className="flex min-w-max items-center justify-center gap-[15px] whitespace-nowrap font-tnr text-[12px] uppercase text-ink md:text-[14px]">
        <span>
          {t(ui.info.at)}
          {lang === "en" && " "}
          {formatTime(event.time, lang)}
        </span>
        <span>{weekdayLabel(event.date, lang)}</span>
      </div>
      <DateBlock date={event.date} />
    </div>
  );
}

/** Parents, the invitation line, the couple's names and both events. */
export function InfoSection() {
  const { t } = useT();
  const { groom, bride } = invitation.couple;
  const name =
    "flex min-h-[80px] w-[80%] items-center justify-center whitespace-nowrap font-names text-[37px] leading-[54px] text-leaf km:text-[30px] md:text-[43px] md:leading-[62px] md:km:text-[36px]";

  return (
    <section className="relative isolate flex w-full flex-col items-center">
      <GhostFlower art="flower6" left="10.33%" top="33%" width={76.43} rotate={-158.91} flipY />
      <GhostFlower art="flower6" left="85.16%" top="81%" width={76.43} rotate={-21.09} />
      <ParallaxFlower art="flower6" left="107%" top="40%" width={43.99} speed={0.07} />
      <ParallaxFlower art="flower3" left="-4.5%" top="80%" width={42.86} rotate={4.817} flipX speed={-0.07} />

      <div className="relative z-10 flex w-full max-w-[366px] flex-col items-center gap-[14px] px-4 md:max-w-[520px] md:gap-[20px] md:px-8">
        <SectionTitle>{t(ui.info.title)}</SectionTitle>

        <div className="relative grid w-full grid-cols-[1fr_auto_1fr] grid-rows-[repeat(4,auto)] justify-center gap-x-[14px] gap-y-[3px] text-center font-bask text-leaf">
          <Parents person={groom} />
          <div className="row-span-4 h-[50px] w-px shrink-0 self-center bg-leaf md:h-[60px]" />
          <Parents person={bride} />
        </div>

        <div className="relative mx-auto flex flex-col gap-[3px] whitespace-pre-line text-center font-bask text-[16px] uppercase text-leaf md:max-w-[560px] md:text-[20px]">
          <span>{t(ui.info.together)}</span>
        </div>

        <div className="relative flex w-full min-w-0 flex-col items-center gap-3 text-center md:gap-4">
          <h3 className={name}>{t(groom.fullName)}</h3>
          <div className="text-[10px] uppercase md:text-[12px]" style={{ color: "#124d00", letterSpacing: "0.14em" }} />
          <div className="font-amp text-[35px] leading-none text-leaf">&amp;</div>
          <h3 className={name}>{t(bride.fullName)}</h3>
          <div className="text-[10px] uppercase md:text-[12px]" style={{ color: "#124d00", letterSpacing: "0.14em" }} />
        </div>

        {invitation.events.map((e) => (
          <EventBlock key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}
