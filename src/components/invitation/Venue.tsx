"use client";

import { invitation } from "@/config/invitation";
import { ui } from "@/config/strings";
import { ParallaxFlower } from "@/components/decor/Flower";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useT } from "./context";

/** Venue name, an embedded Google Map (no API key needed) and a directions link. */
export function Venue() {
  const { t } = useT();
  const reception = invitation.events.find((e) => e.mapQuery);
  if (!reception?.mapQuery) return null;
  const q = encodeURIComponent(reception.mapQuery);

  return (
    <section className="relative isolate flex w-full flex-col items-center">
      <ParallaxFlower art="flower5" left="-6.1%" top="5px" width={40.59} rotate={-161.66} flipY speed={-0.02} />

      <section className="relative z-10 flex w-full flex-col items-center px-6 pb-4 pt-8 md:pb-8 md:pt-8">
        <div className="relative w-full text-center">
          <SectionTitle small>{t(ui.venue.title)}</SectionTitle>
          <div className="mx-auto mt-3 max-w-[250px] whitespace-pre-line text-center font-roboto text-[12px] leading-relaxed text-ink md:max-w-[440px] md:text-[14px]">
            <span>
              {t(reception.venue)}
              {"\n"}
              {t(reception.address)}
            </span>
          </div>
        </div>

        <div className="relative flex w-full flex-col items-center gap-4 md:gap-5">
          <iframe
            title={t(reception.venue)}
            src={`https://www.google.com/maps?q=${q}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-3 h-[268px] w-full max-w-[338px] overflow-hidden rounded-[15px] border md:h-[380px] md:max-w-[560px]"
            style={{ borderColor: "#5e813c" }}
          />
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-roboto text-sm font-semibold text-ink transition-transform hover:scale-[1.03] md:text-base"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="3 11 22 2 13 21 11 13 3 11" strokeLinejoin="round" />
            </svg>
            <span>{t(ui.venue.directions)}</span>
          </a>
        </div>
      </section>
    </section>
  );
}

