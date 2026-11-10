import type { ReactNode } from "react";

// Pill with notched corners. It is drawn with border-image (a 9-slice): the four 20px corners keep
// their exact shape and only the straight edges stretch, so it never distorts, whatever the text length.
const PILL_PATH =
  "M304.822 9.61606C304.793 4.85174 301 1 296.332 1H17.9225C13.254 1 9.46125 4.85174 9.43226 9.61606C4.76958 9.64568 1 13.5211 1 18.2914V34.925C1 39.6952 4.76958 43.5707 9.43226 43.6003C9.46125 48.3646 13.254 52.2163 17.9225 52.2163H296.332C301 52.2163 304.793 48.3646 304.822 43.6003C309.485 43.5707 313.254 39.6952 313.254 34.925V18.2914C313.254 13.5211 309.485 9.64568 304.822 9.61606Z";
const PILL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="314.254" height="53.2163" viewBox="0 0 314.254 53.2163" preserveAspectRatio="none" fill="none"><path d="${PILL_PATH}" stroke="#5e813c" stroke-width="2" stroke-miterlimit="10"/></svg>`;
const PILL_IMAGE = `url("data:image/svg+xml,${encodeURIComponent(PILL_SVG)}")`;

/** Section heading in the notched pill. `small` is the slightly smaller venue variant. */
export function SectionTitle({ children, small = false }: { children: ReactNode; small?: boolean }) {
  const size = small ? "text-[18px] md:text-[22px]" : "text-[20px] md:text-[24px]";
  const Tag = small ? "h3" : "h2";
  return (
    <Tag
      className={`relative z-10 mx-auto flex w-full max-w-[314px] items-center justify-center px-4 py-[14px] text-center font-tnr font-bold uppercase text-leaf md:max-w-[400px] ${size}`}
      style={{ border: "1px solid transparent", borderImageSource: PILL_IMAGE, borderImageSlice: "20", borderImageWidth: "20px", borderImageRepeat: "stretch" }}
    >
      <span dir="auto">{children}</span>
    </Tag>
  );
}
