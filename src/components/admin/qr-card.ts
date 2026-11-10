import { invitation } from "@/config/invitation";
import { ui } from "@/config/strings";
import { formatDate } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

/**
 * Draws the shareable invitation card: wedding artwork, the couple's names, the date,
 * the guest's name and a QR code that opens the guest's personal link. Everything is
 * drawn on one canvas so the same file can be previewed, downloaded and printed.
 */

export const CARD_W = 1200;
export const CARD_H = 2150;

const GREEN = "#5e813c";
const DARK_GREEN = "#1f3d1b";
const INK = "#124d00";

type Art = { src: string; img?: HTMLImageElement };
const ART = {
  grain: { src: "/ref/paper-grain.svg" },
  flower6: { src: "/ref/flower6.webp" },
  flower3: { src: "/ref/flower3.webp" },
  lotus: { src: "/ref/flower4-bottom.webp" },
} satisfies Record<string, Art>;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/** The font stacks the page already loads (next/font puts them in CSS variables on <html>). */
function fonts() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const khmer = v("--font-battambang", "serif");
  const moul = v("--font-moul", "serif");
  return {
    names: `${v("--font-carattere", "cursive")}, ${moul}, cursive`,
    amp: `${v("--font-ms-madi", "cursive")}, ${moul}, cursive`,
    body: `${v("--font-lora-g", "Georgia")}, ${khmer}, serif`,
  };
}

/** Canvas can only use a web font once it has loaded, and only for the letters it has been asked about. */
async function loadFonts(f: ReturnType<typeof fonts>, text: string) {
  await Promise.all([
    document.fonts.load(`100px ${f.names}`, text),
    document.fonts.load(`100px ${f.amp}`, "&"),
    document.fonts.load(`400 40px ${f.body}`, text),
    document.fonts.load(`600 40px ${f.body}`, text),
  ]);
  await document.fonts.ready;
}

type Placement = { cx: number; cy: number; w: number; rotate?: number; flipX?: boolean; flipY?: boolean; alpha?: number; shadow?: boolean };

function drawArt(ctx: CanvasRenderingContext2D, img: HTMLImageElement, p: Placement) {
  const h = (img.naturalHeight / img.naturalWidth) * p.w;
  ctx.save();
  ctx.globalAlpha = p.alpha ?? 1;
  if (p.shadow) {
    ctx.shadowColor = "rgba(18, 77, 0, 0.18)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 9;
    ctx.shadowOffsetY = 12;
  }
  ctx.translate(p.cx, p.cy);
  ctx.rotate(((p.rotate ?? 0) * Math.PI) / 180);
  ctx.scale(p.flipX ? -1 : 1, p.flipY ? -1 : 1);
  ctx.drawImage(img, -p.w / 2, -h / 2, p.w, h);
  ctx.restore();
}

/** Shrinks the font size until the text fits in maxWidth. Returns the size used. */
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, size: number, maxWidth: number): number {
  let s = size;
  for (; s > 18; s -= 2) {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  ctx.font = `${weight} ${s}px ${family}`;
  return s;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function drawQr(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  // loaded on demand: only the dashboard ever needs the QR library
  const QRCode = (await import("qrcode")).default;
  // "Q" error correction: still scans if the card is a little scuffed or folded
  const qr = QRCode.create(url, { errorCorrectionLevel: "Q" });
  const n = qr.modules.size;
  const quiet = 4; // modules of empty space around the code, as the QR standard asks
  const cell = Math.floor(size / (n + quiet * 2)); // whole pixels keep the edges crisp for scanners
  const code = cell * n;
  const ox = x + Math.round((size - code) / 2);
  const oy = y + Math.round((size - code) / 2);
  ctx.fillStyle = DARK_GREEN;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
}

function heart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  ctx.fill(new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"));
  ctx.restore();
}

export type CardOptions = {
  /** Where the QR code leads. */
  url: string;
  /** The guest's name for a personal card; leave empty for the general card. */
  guest?: string;
  lang: Lang;
};

/** Renders the card and returns it as a PNG data URL. */
export async function renderCard({ url, guest = "", lang }: CardOptions): Promise<string> {
  const { groom, bride } = invitation.couple;
  const first = invitation.events[0];
  const names = [groom.name[lang], bride.name[lang]];
  const eyebrow = ui.card.eyebrow[lang];
  const date = formatDate(first.date, lang);
  const invites = ui.cover.invites[lang];
  const scan = ui.card.scan[lang];

  const f = fonts();
  const [grain, flower6, flower3, lotus] = await Promise.all([ART.grain, ART.flower6, ART.flower3, ART.lotus].map((a) => loadImage(a.src)));
  await loadFonts(f, [...names, eyebrow, date, invites, scan, guest, "&"].join(" "));

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser");
  const cx = CARD_W / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // paper
  ctx.fillStyle = "#fffbed";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.5;
  for (let y = 0; y < CARD_H; y += 600) for (let x = 0; x < CARD_W; x += 600) ctx.drawImage(grain, x, y, 600, 600);
  ctx.restore();

  // faint flowers behind everything, then the solid ones in the corners
  drawArt(ctx, flower6, { cx: CARD_W * 0.1, cy: CARD_H * 0.3, w: CARD_W * 0.76, rotate: -158.9, flipY: true, alpha: 0.07 });
  drawArt(ctx, flower6, { cx: CARD_W * 0.85, cy: CARD_H * 0.62, w: CARD_W * 0.76, rotate: -21, alpha: 0.07 });
  drawArt(ctx, flower6, { cx: CARD_W * 0.96, cy: 150, w: CARD_W * 0.44, rotate: -53.6, flipX: true, shadow: true });
  drawArt(ctx, flower3, { cx: -CARD_W * 0.045, cy: CARD_H * 0.47, w: CARD_W * 0.4, rotate: 4.8, flipX: true, shadow: true });

  // names
  ctx.fillStyle = GREEN;
  ctx.font = `400 ${lang === "km" ? 42 : 36}px ${f.body}`;
  if (lang === "en") ctx.letterSpacing = "10px";
  ctx.fillText(lang === "en" ? eyebrow.toUpperCase() : eyebrow, cx, 190);
  ctx.letterSpacing = "0px";

  const nameSize = lang === "km" ? 104 : 150;
  fit(ctx, names[0], f.names, "400", nameSize, 820);
  ctx.fillText(names[0], cx, 360);
  ctx.font = `400 110px ${f.amp}`;
  ctx.fillText("&", cx, 475);
  fit(ctx, names[1], f.names, "400", nameSize, 820);
  ctx.fillText(names[1], cx, 640);

  // divider
  const dy = 735;
  for (const dir of [-1, 1]) {
    const g = ctx.createLinearGradient(cx + dir * 70, 0, cx + dir * 330, 0);
    g.addColorStop(0, GREEN);
    g.addColorStop(1, "rgba(94,129,60,0)");
    ctx.fillStyle = g;
    ctx.fillRect(dir === -1 ? cx - 330 : cx + 70, dy, 260, 3);
  }
  ctx.fillStyle = GREEN;
  heart(ctx, cx, dy + 1, 44);

  // date and guest
  ctx.fillStyle = INK;
  fit(ctx, date, f.body, "400", 50, 980);
  ctx.fillText(date, cx, 835);
  ctx.font = `300 44px ${f.body}`;
  ctx.fillText(invites, cx, 915);
  if (guest) {
    ctx.fillStyle = GREEN;
    fit(ctx, guest, f.body, "600", 64, 900);
    ctx.fillText(guest, cx, 1000);
  }

  // QR on a white card
  const panel = 540;
  const px = cx - panel / 2;
  const py = 1060;
  ctx.save();
  ctx.shadowColor = "rgba(47, 79, 39, 0.28)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, px, py, panel, panel, 40);
  ctx.fill();
  ctx.restore();
  await drawQr(ctx, url, px + 20, py + 20, panel - 40);

  ctx.fillStyle = INK;
  fit(ctx, scan, f.body, "400", 40, 980);
  ctx.fillText(scan, cx, py + panel + 80);

  // big lotus along the bottom edge
  const lw = CARD_W * 1.2;
  const lh = (lotus.naturalHeight / lotus.naturalWidth) * lw;
  ctx.save();
  ctx.shadowColor = "rgba(18, 77, 0, 0.18)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 9;
  ctx.shadowOffsetY = 12;
  ctx.translate(cx, CARD_H - 440 + lh / 2);
  ctx.scale(-1, 1);
  ctx.drawImage(lotus, -lw / 2, -lh / 2, lw, lh);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/** "Maly & Piseth" -> "invitation-Maly-Piseth.png" */
export function cardFileName(guest: string): string {
  const slug = guest.replace(/[\\/:*?"<>|&]+/g, " ").trim().replace(/\s+/g, "-").slice(0, 60);
  return slug ? `invitation-${slug}.png` : "invitation.png";
}
