"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

/** Artwork in public/ref, with natural pixel sizes so layout never shifts. */
export const ART = {
  flower1: { src: "/ref/flower1.webp", w: 750, h: 750 },
  flower3: { src: "/ref/flower3.webp", w: 900, h: 1409 },
  flower5: { src: "/ref/flower5.webp", w: 729, h: 729 },
  flower6: { src: "/ref/flower6.webp", w: 900, h: 1311 },
  flower10: { src: "/ref/flower10.webp", w: 617, h: 823 },
  flower4Bottom: { src: "/ref/flower4-bottom.webp", w: 1200, h: 900 },
} as const;
export type ArtName = keyof typeof ART;

/**
 * Where a decorative flower sits. left/top are CSS values relative to the
 * section ("107%", "80px"), width is a percentage of the section width, and
 * the picture is centred on that point before it is rotated / mirrored.
 */
export type Place = {
  art: ArtName;
  left: string;
  top: string;
  width: number;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
};

const SHADOW = "drop-shadow(rgba(18, 77, 0, 0.18) 3px 4px 3px)";

const centred = ({ rotate = 0, flipX, flipY }: Place) =>
  `translate(-50%, -50%) rotate(${rotate}deg)${flipX ? " scaleX(-1)" : ""}${flipY ? " scaleY(-1)" : ""}`;

function Pic({ art, className, style, eager }: { art: ArtName; className?: string; style?: CSSProperties; eager?: boolean }) {
  const a = ART[art];
  return (
    <Image
      src={a.src}
      width={a.w}
      height={a.h}
      alt=""
      aria-hidden="true"
      unoptimized
      loading={eager ? "eager" : undefined}
      draggable={false}
      className={`pointer-events-none h-auto max-w-none object-contain ${className ?? ""}`}
      style={style}
    />
  );
}

/** Large, almost invisible flower behind a section's content. */
export function GhostFlower(p: Place) {
  return (
    <Pic
      art={p.art}
      className="absolute -z-10"
      style={{ left: p.left, top: p.top, width: `${p.width}%`, transform: centred(p), opacity: 0.07 }}
    />
  );
}

/** Solid flower with a soft shadow that does not move. */
export function Flower(p: Place & { z?: number; eager?: boolean }) {
  return (
    <Pic
      art={p.art}
      eager={p.eager}
      className="absolute"
      style={{ left: p.left, top: p.top, width: `${p.width}%`, zIndex: p.z ?? 1, transform: centred(p), filter: SHADOW }}
    />
  );
}

/**
 * Corner flower that drifts with the page scroll: it is shifted by
 * scrollY * speed, so it moves a little faster or slower than the content.
 */
export function ParallaxFlower(p: Place & { speed: number; eager?: boolean }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => v * p.speed);
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: p.left, top: p.top, width: `${p.width}%`, zIndex: 1, y, willChange: "transform" }}
    >
      <Pic art={p.art} eager={p.eager} className="block w-full" style={{ transform: centred(p), filter: SHADOW }} />
    </motion.div>
  );
}
