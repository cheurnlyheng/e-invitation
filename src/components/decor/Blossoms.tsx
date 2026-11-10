import type { CSSProperties } from "react";

// Deterministic pseudo-random numbers: the server and client must render the
// exact same blossoms, so Math.random() is not an option here.
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = ["#f2b8c6", "#5e813c", "#f7d9e0", "#a8c48a"];
const PETALS = [0, 60, 120, 180, 240, 300];

function makeBlossoms(count: number, seed: number) {
  const r = rng(seed);
  return Array.from({ length: count }, () => ({
    left: r() * 100,
    size: 10 + r() * 14,
    sway: (r() < 0.5 ? -1 : 1) * (10 + r() * 17),
    dur: 19 + r() * 7,
    delay: -r() * 22,
    color: COLORS[Math.floor(r() * COLORS.length)],
  }));
}

/** Six-petal blossoms slowly falling and turning over the cover. Decorative only. */
export function Blossoms({ count = 14, seed = 11 }: { count?: number; seed?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
      {makeBlossoms(count, seed).map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={
            {
              left: `${b.left}%`,
              top: -30,
              color: b.color,
              fontSize: b.size,
              "--sway": `${b.sway}px`,
              animation: `ambient-fall ${b.dur}s ease-in-out ${b.delay}s infinite`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
            <g>
              {PETALS.map((deg) => (
                <ellipse key={deg} cx="12" cy="5" rx="2.2" ry="4.5" transform={deg ? `rotate(${deg} 12 12)` : undefined} />
              ))}
            </g>
            <circle cx="12" cy="12" r="1.8" fillOpacity="0.45" />
          </svg>
        </div>
      ))}
    </div>
  );
}
