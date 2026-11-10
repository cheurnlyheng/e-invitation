"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { invitation, type GiftAccount } from "@/config/invitation";
import { ui } from "@/config/strings";
import { GhostFlower } from "@/components/decor/Flower";
import { Sheet } from "@/components/ui/Sheet";
import { useT } from "./context";

const SHADOW = "drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px)";

// Little gifts around the box: file, size (px width), position, rotation, stacking
const DECOR = [
  { n: 1, file: "double_dragon_blue", w: 34, left: -20, top: 10, rot: -22, z: 1, dim: [112, 115] },
  { n: 2, file: "crystal_floral_green", w: 38, left: 168, top: 2, rot: 20, z: 1, dim: [112, 136] },
  { n: 3, file: "hoa_tinh_red", w: 26, left: -16, top: 120, rot: -18, z: 1, dim: [112, 112] },
  { n: 4, file: "jasmine_white", w: 24, left: 182, top: 114, rot: 14, z: 1, dim: [112, 120] },
  { n: 5, file: "double_dragon_red", w: 44, left: -8, top: 172, rot: 8, z: 3, dim: [112, 115] },
  { n: 6, file: "baroque_v2_darkgreen", w: 26, left: 26, top: 182, rot: -10, z: 3, dim: [112, 117] },
  { n: 7, file: "minimalism_darkblue", w: 40, left: 118, top: 176, rot: -14, z: 3, dim: [112, 111] },
] as const;

// Confetti pieces (colour, shape) that burst while the box is hovered / focused
const CONFETTI: { cls: string; style: CSSProperties }[] = [
  { cls: "igb-c1", style: { width: 11, height: 5.5, marginLeft: -5.5, marginTop: -2.75, backgroundColor: "#ec4899", borderRadius: 2 } },
  { cls: "igb-c2", style: { width: 10, height: 10, marginLeft: -5, marginTop: -5, backgroundColor: "#124d00", borderRadius: "50%" } },
  { cls: "igb-c3", style: { width: 11, height: 5.5, marginLeft: -5.5, marginTop: -2.75, backgroundColor: "#22c55e", borderRadius: 2 } },
  { cls: "igb-c4", style: { width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5, backgroundColor: "#3b82f6", borderRadius: "50%" } },
  { cls: "igb-c5", style: { width: 12, height: 6, marginLeft: -6, marginTop: -3, backgroundColor: "#a855f7", borderRadius: 2 } },
  { cls: "igb-c6", style: { width: 0, height: 0, marginLeft: -5, marginTop: -5, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "10px solid #facc15" } },
  { cls: "igb-c7", style: { width: 10, height: 5, marginLeft: -5, marginTop: -2.5, backgroundColor: "#5e813c", borderRadius: 2 } },
  { cls: "igb-c8", style: { width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5, backgroundColor: "#f97316", borderRadius: "50%" } },
];

const SPARKLES = [
  { cls: "igb-sparkle", style: { top: "8%", left: "14%", fontSize: 22 } },
  { cls: "igb-sparkle-2", style: { top: "18%", right: "10%", fontSize: 16 } },
  { cls: "igb-sparkle-3", style: { top: "32%", left: "5%", fontSize: 14 } },
  { cls: "igb-sparkle-4", style: { top: "26%", right: "5%", fontSize: 14 } },
];

function Account({ a }: { a: GiftAccount }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const pill = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors";

  async function copy() {
    try {
      await navigator.clipboard.writeText(a.accountNumber.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the number is still visible to copy by hand
    }
  }

  return (
    <div className="flex max-w-[180px] flex-1 flex-col items-center sm:max-w-none">
      <h3 className="mb-2 min-h-[2rem] text-center text-xs font-medium text-leaf [text-wrap:balance]">
        {t(a.label)} · {a.bank}
      </h3>
      {a.qr && (
        <div className="flex size-32 items-center justify-center rounded-xl bg-white p-2 shadow-lg sm:size-40" style={{ border: "2px solid rgba(94,129,60,0.125)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.qr} alt={`${a.bank} QR`} className="size-full object-contain" />
        </div>
      )}
      <div className="mt-2 space-y-0.5 text-center">
        <p className="text-[11px] font-semibold">{a.accountName}</p>
        <p className="break-all font-mono text-[11px]">{a.accountNumber}</p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        <button type="button" onClick={copy} className={pill} style={{ color: "#5e813c", backgroundColor: "rgba(94,129,60,0.082)" }}>
          {copied ? `✓ ${t(ui.gift.copied)}` : t(ui.gift.copy)}
        </button>
        {a.qr && (
          <a href={a.qr} download className={pill} style={{ color: "#5e813c", backgroundColor: "rgba(94,129,60,0.082)" }}>
            ⬇ {t(ui.gift.saveQr)}
          </a>
        )}
      </div>
    </div>
  );
}

/** Gift box. Hover / focus makes it pop and burst confetti; tapping opens the bank details. */
export function GiftBox() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  return (
    <section className="relative isolate flex w-full flex-col items-center">
      <GhostFlower art="flower6" left="25.07%" top="92%" width={76.43} rotate={-148.4} flipY />

      <div className="relative z-10 flex w-full flex-col items-center justify-center py-8">
        <h2 className="mb-4 flex flex-col items-center font-tnr text-[20px] font-bold uppercase text-leaf md:text-[24px]">
          <span>{t(ui.gift.title)}</span>
        </h2>

        <button type="button" aria-label={t(ui.gift.open)} onClick={() => setOpen(true)} className="group relative cursor-pointer border-none bg-transparent outline-none" style={{ width: 260, height: 280 }}>
          <div className="relative flex h-full w-full items-end justify-center pb-[26px]">
            {SPARKLES.map((s) => (
              <span key={s.cls} className={`${s.cls} pointer-events-none absolute z-20`} style={{ ...s.style, color: "#124d00" }}>
                ✦
              </span>
            ))}

            <div className="pointer-events-none absolute z-0" style={{ bottom: 187, left: "50%" }}>
              {CONFETTI.map((c) => (
                <div key={c.cls} className={`igb-confetti ${c.cls}`} style={{ position: "absolute", left: "50%", top: 0, opacity: 0, pointerEvents: "none", willChange: "transform, opacity", ...c.style }} />
              ))}
            </div>

            <div className="igb-bob relative" style={{ width: 200, height: 220 }}>
              <div className="igb-shadow pointer-events-none absolute" style={{ left: "50%", bottom: -8, width: 144, height: 12, marginLeft: -72, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.45)", filter: "blur(4px)", zIndex: 0 }} />
              {DECOR.filter((d) => d.z === 1).map((d) => (
                <Image key={d.n} src={`/ref/gift/${d.file}.webp`} width={d.dim[0]} height={d.dim[1]} alt="" unoptimized className={`igb-decor igb-decor-${d.n} pointer-events-none absolute`} style={{ left: d.left, top: d.top, width: d.w, height: "auto", zIndex: d.z, transform: `rotate(${d.rot}deg)`, filter: SHADOW }} />
              ))}
              <Image src="/ref/gift/box.webp" width={480} height={491} alt="" unoptimized priority className="igb-box pointer-events-none absolute" style={{ left: "50%", bottom: 0, width: 170, height: "auto", maxHeight: 220, objectFit: "contain", marginLeft: -85, zIndex: 2, filter: "drop-shadow(rgba(0, 0, 0, 0.25) 0px 10px 18px)" }} />
              {DECOR.filter((d) => d.z === 3).map((d) => (
                <Image key={d.n} src={`/ref/gift/${d.file}.webp`} width={d.dim[0]} height={d.dim[1]} alt="" unoptimized className={`igb-decor igb-decor-${d.n} pointer-events-none absolute`} style={{ left: d.left, top: d.top, width: d.w, height: "auto", zIndex: d.z, transform: `rotate(${d.rot}deg)`, filter: SHADOW }} />
              ))}
            </div>
          </div>
          <p className="igb-hint absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium" style={{ color: "#124d00" }}>
            <span>{t(ui.gift.tap)}</span>
          </p>
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={t(ui.gift.title)} closeLabel={t(ui.gift.close)} tone="green">
        <div className="flex flex-col items-center gap-4 font-roboto text-ink sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
          {invitation.gifts.map((a) => (
            <Account key={a.id} a={a} />
          ))}
        </div>
      </Sheet>
    </section>
  );
}
