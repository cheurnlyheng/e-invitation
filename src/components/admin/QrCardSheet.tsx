"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { Sheet } from "@/components/ui/Sheet";
import { cardFileName, renderCard } from "./qr-card";

export type CardTarget = { guest: string; url: string };

/** `file` is the same picture as a File, made ahead of time so the share menu can open straight from a tap. */
type Result = { key: string; dataUrl?: string; file?: File; failed?: boolean };

const LANGS: { id: Lang; label: string }[] = [
  { id: "km", label: "ខ្មែរ" },
  { id: "en", label: "English" },
];

async function toFile(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: "image/png" });
}

/** Shows the QR invitation card for one link, with "Save to Photos" (phones) and a PNG download. */
export function QrCardSheet({ open, target, onClose }: { open: boolean; target: CardTarget | null; onClose: () => void }) {
  const [lang, setLang] = useState<Lang>("km");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);

  const url = target?.url ?? "";
  const guest = target?.guest ?? "";
  const key = `${url}|${guest}|${lang}`;

  useEffect(() => {
    if (!open || !url) return;
    let live = true;
    const k = `${url}|${guest}|${lang}`;
    renderCard({ url, guest, lang })
      .then(async (dataUrl) => {
        const file = await toFile(dataUrl, cardFileName(guest)).catch(() => undefined);
        if (live) setResult({ key: k, dataUrl, file });
      })
      .catch(() => live && setResult({ key: k, failed: true }));
    return () => {
      live = false;
    };
  }, [open, url, guest, lang]);

  const ready = result?.key === key ? result : null;
  const local = /^https?:\/\/(localhost|127\.|192\.168\.|10\.)/.test(url);
  // Phones (and some computers) can hand a picture to the share menu, which has "Save Image" for Photos.
  // `ready` only exists in the browser, so this never runs on the server.
  const canShare = !!ready?.file && typeof navigator.canShare === "function" && navigator.canShare({ files: [ready.file] });

  async function saveToPhotos() {
    if (!ready?.file) return;
    setShareFailed(false);
    try {
      await navigator.share({ files: [ready.file] });
    } catch (e) {
      // closing the menu without choosing anything is not an error
      if (!(e instanceof DOMException && e.name === "AbortError")) setShareFailed(true);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this:", url);
    }
  }

  const secondary = "flex-1 rounded-xl border border-leaf/40 px-4 py-3 text-center text-sm font-semibold text-leaf transition hover:bg-leaf/10 active:scale-[0.99]";

  return (
    <Sheet open={open} onClose={onClose} title={guest ? `Card for ${guest}` : "Card for the general link"} closeLabel="Close">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink/60">Card language</span>
          <div role="group" aria-label="Card language" className="flex overflow-hidden rounded-full border border-leaf/40 text-sm">
            {LANGS.map((l) => (
              <button key={l.id} type="button" aria-pressed={lang === l.id} onClick={() => setLang(l.id)} className={`px-3.5 py-1 transition ${lang === l.id ? "bg-leaf text-white" : "text-ink hover:bg-leaf/10"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-48 place-items-center overflow-hidden rounded-2xl border border-black/10 bg-[#fffbed]">
          {ready?.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ready.dataUrl} alt={`Invitation card with a QR code for ${guest || "the general link"}`} className="max-h-[42vh] w-auto max-w-full object-contain" />
          ) : ready?.failed ? (
            <p className="px-4 py-10 text-center text-sm text-red-600">Could not make the card. Please try again.</p>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-ink/55">Making the card…</p>
          )}
        </div>

        <p className="break-all text-xs text-ink/55">
          The QR code opens: <span className="text-ink/80">{url}</span>
        </p>
        {local && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">This address only works on this computer. Open the dashboard on the live site before downloading cards for guests.</p>}

        <div className="space-y-2">
          {canShare && (
            <button type="button" onClick={saveToPhotos} className="w-full rounded-xl bg-leaf py-3 text-base font-semibold text-white transition active:scale-[0.99]">
              Save to Photos
            </button>
          )}
          <div className="flex gap-2">
            {ready?.dataUrl ? (
              <a
                href={ready.dataUrl}
                download={cardFileName(guest)}
                className={canShare ? secondary : "flex-1 rounded-xl bg-leaf py-3 text-center text-base font-semibold text-white transition active:scale-[0.99]"}
              >
                Download PNG
              </a>
            ) : (
              <span className="flex-1 rounded-xl bg-leaf/35 py-3 text-center text-base font-semibold text-white">Download PNG</span>
            )}
            <button type="button" onClick={copy} className={canShare ? secondary : "rounded-xl border border-leaf/40 px-4 py-3 text-sm font-semibold text-leaf hover:bg-leaf/10"}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        {canShare && <p className="text-xs leading-relaxed text-ink/55">Tap <b>Save to Photos</b>, then choose <b>Save Image</b> in the menu. It goes to your photo gallery, ready to send to the guest.</p>}
        {shareFailed && <p className="text-xs text-red-600">The share menu could not open. Press and hold the card above and choose &quot;Add to Photos&quot; instead.</p>}
      </div>
    </Sheet>
  );
}
