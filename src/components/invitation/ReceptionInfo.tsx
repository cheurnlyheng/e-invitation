"use client";

import { invitation } from "@/config/invitation";
import { ui } from "@/config/strings";
import { MONTHS, WEEKDAYS_SHORT, daysInMonth, eventStart, formatTime, num, parseYmd, weekdayOf } from "@/lib/format";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { useNow } from "@/lib/use-now";
import { GhostFlower, ParallaxFlower } from "@/components/decor/Flower";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { DateBlock, weekdayLabel } from "./InfoSection";
import { useT } from "./context";

/** "58 days 1 hours 44 min 53 sec", ticking. Shows dashes until the client has the current time. */
function Countdown() {
  const { lang, t } = useT();
  const now = useNow();
  const first = invitation.events[0];
  const target = eventStart(first.date, first.time).getTime();

  if (now !== null && now >= target) return <p>{t(ui.reception.today)}</p>;

  const s = now === null ? null : Math.floor((target - now) / 1000);
  const part = (v: number | null) => (v === null ? "--" : num(v, lang));
  const d = s === null ? null : Math.floor(s / 86400);
  const h = s === null ? null : Math.floor((s % 86400) / 3600);
  const m = s === null ? null : Math.floor((s % 3600) / 60);
  const sec = s === null ? null : s % 60;
  return (
    <p role="timer" aria-live="off">
      {part(d)} {t(ui.reception.days)} {part(h)} {t(ui.reception.hours)} {part(m)} {t(ui.reception.minutes)} {part(sec)} {t(ui.reception.seconds)}
    </p>
  );
}

/** Monday-first month grid with the wedding day marked by a heart. */
function Calendar({ date }: { date: string }) {
  const { lang } = useT();
  const ymd = parseYmd(date);
  const mondayFirst = [1, 2, 3, 4, 5, 6, 0].map((i) => WEEKDAYS_SHORT[lang][i]);
  const lead = (weekdayOf({ ...ymd, d: 1 }) + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: daysInMonth(ymd) }, (_, i) => i + 1)];

  return (
    <div className="mt-4 w-full max-w-[300px] px-2 md:max-w-[360px]">
      <div className="mx-auto w-full overflow-hidden rounded-lg text-leaf">
        <div className="border-b py-2.5 text-center font-nautigal text-[25px] font-semibold tracking-wide km:font-tnr km:text-[20px] md:text-[28px]" style={{ borderColor: "color-mix(in srgb, #5e813c 27%, transparent)" }}>
          {MONTHS[lang][ymd.m - 1]} {num(ymd.y, lang)}
        </div>
        <div className="grid grid-cols-7 border-b-2 border-leaf">
          {mondayFirst.map((w) => (
            <div key={w} className="py-1.5 text-center text-[10px] font-medium opacity-60 md:text-[11px]">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 px-1 py-2">
          {cells.map((d, i) => (
            <div key={i} className="flex h-[30px] items-center justify-center md:h-[34px]">
              {d === ymd.d ? (
                <span className="relative grid size-[28px] place-items-center text-white">
                  <svg viewBox="0 0 24 24" className="absolute inset-0 size-full text-leaf" fill="currentColor" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <b className="relative text-[11px] font-bold">{num(d, lang)}</b>
                </span>
              ) : (
                d !== null && <span className="text-[12px] font-light">{num(d, lang)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Reception details, welcome time, countdown, calendar and the add-to-calendar link. */
export function ReceptionInfo() {
  const { lang, t } = useT();
  const { events, couple, welcomeTime } = invitation;
  const reception = events.find((e) => e.id === "reception") ?? events[events.length - 1];
  const heading = `${couple.groom.name[lang]} & ${couple.bride.name[lang]}`;
  const label = "text-[11px] uppercase text-ink md:text-[13px]";
  const time = "mt-1 text-[20px] font-semibold text-leaf";

  return (
    <section className="relative isolate flex w-full flex-col items-center">
      <GhostFlower art="flower6" left="8.29%" top="33%" width={76.43} rotate={-158.91} flipY />
      <GhostFlower art="flower6" left="83.12%" top="70%" width={76.43} rotate={-21.09} />
      <ParallaxFlower art="flower6" left="-4.95%" top="50%" width={43.99} rotate={15} speed={-0.07} />
      <ParallaxFlower art="flower3" left="106.67%" top="44%" width={42.86} rotate={-10.98} speed={0.07} />

      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center gap-[28px] px-5 md:max-w-[560px] md:px-8">
        <SectionTitle>{t(ui.reception.title)}</SectionTitle>

        <div className="flex w-full flex-col items-center gap-[10px] text-center font-bask text-leaf">
          <h3 className="flex flex-col items-center text-[16px] font-semibold uppercase text-ink md:text-[20px]">
            <span>{t(ui.reception.takePlace)}</span>
          </h3>
          <div className="flex min-w-max items-center justify-center gap-[25px] whitespace-nowrap text-[14px] font-semibold uppercase text-ink md:text-[15px]">
            <span>{formatTime(reception.time, lang)}</span>
            <span>{weekdayLabel(reception.date, lang)}</span>
          </div>
          <DateBlock date={reception.date} />

          <div className="mt-4 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <span className={label}>{t(ui.reception.welcome)}</span>
              <span className={time}>{formatTime(welcomeTime, lang)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={label}>{t(ui.reception.start)}</span>
              <span className={time}>{formatTime(reception.time, lang)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center">
            <h2 className="text-[18px] uppercase text-ink md:text-[20px]">{t(ui.reception.countdown)}</h2>
            <div className="mt-2 text-center text-[18px] font-semibold text-ink md:text-[20px]">
              <Countdown />
            </div>
          </div>

          <Calendar date={events[0].date} />

          <button
            type="button"
            onClick={() => downloadIcs(buildIcs(events, lang, heading))}
            className="mt-4 inline-flex items-center justify-center font-tnr text-[14px] text-ink underline underline-offset-4"
          >
            {t(ui.reception.addToCalendar)}
          </button>
        </div>
      </div>
    </section>
  );
}
