"use client";

import { useState } from "react";
import { ui } from "@/config/strings";
import { submitWish, useWishes } from "@/lib/api";
import { formatStamp } from "@/lib/format";
import { GhostFlower } from "@/components/decor/Flower";
import { useT } from "./context";

const EMOJI = ["🪄", "💐", "💍", "🥂", "💚", "✨", "🌸"];
const field =
  "w-full rounded-[6px] border border-leaf bg-transparent px-4 py-3 font-roboto text-sm text-ink outline-none placeholder:text-ink/45 focus:ring-2 focus:ring-leaf/25";

export function Guestbook() {
  const { lang, t } = useT();
  const wishes = useWishes();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "invalid" | "error">("idle");


  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    if (!name.trim() || !message.trim()) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      await submitWish({ name, message });
    } catch {
      setState("error");
      return;
    }
    setName("");
    setMessage("");
    setState("sent");
    setTimeout(() => setState("idle"), 3500);
  }

  return (
    <section className="relative isolate flex w-full flex-col items-center">
      <GhostFlower art="flower6" left="78.36%" top="80%" width={76.43} rotate={-21.09} />

      <section className="relative z-10 w-full px-6 font-tnr text-ink">
        <div className="text-center">
          <h2 className="relative z-10 mb-5 text-center text-[20px] font-bold uppercase text-leaf md:text-[24px]">
            <span>{t(ui.guestbook.title)}</span>
          </h2>
        </div>

        <form onSubmit={send} className="mx-auto mt-6 w-full max-w-full pr-2 md:max-w-[600px]">
          <div className="mb-4">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder={t(ui.guestbook.name)} className={field} />
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={400} rows={4} placeholder={t(ui.guestbook.message)} className={`${field} resize-none`} />
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 text-xs">
              <button
                type="button"
                aria-label="Add emoji"
                onClick={() => setMessage((m) => m + EMOJI[(m.length + 1) % EMOJI.length])}
                className="rounded-lg p-2 text-base leading-none text-leaf transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: "rgba(94,129,60,0.1)" }}
              >
                🪄
              </button>
              <span className="pl-2 font-roboto text-sm text-leaf" aria-live="polite">
                {state === "sent" && t(ui.guestbook.sent)}
                {state === "invalid" && t(ui.guestbook.required)}
                {state === "error" && t(ui.guestbook.error)}
              </span>
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded-full bg-leaf px-6 py-2 text-sm font-semibold uppercase text-btn-text transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{t(state === "sending" ? ui.guestbook.sending : ui.guestbook.send)}</span>
            </button>
          </div>
        </form>

        <div className="mx-auto mt-8 max-h-[500px] w-full max-w-full space-y-3 overflow-y-auto pr-2 md:max-w-[600px]">
          {wishes.map((w) => (
            <div key={w.id} className="rounded-[6px] border p-4 text-sm" style={{ borderColor: "rgba(94,129,60,0.333)", backgroundColor: "rgba(94,129,60,0.06)" }}>
              <div className="flex items-start justify-between gap-3">
                <span className="break-words font-semibold text-leaf">{w.name}</span>
                <span className="shrink-0 text-xs opacity-70">{formatStamp(w.createdAt, lang)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

