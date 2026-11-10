import type { Metadata, Viewport } from "next";
import {
  Battambang,
  Carattere,
  Lora,
  Moul,
  Ms_Madi,
  Roboto,
  The_Nautigal,
  Whisper,
} from "next/font/google";
import "./globals.css";

// Latin faces are the same families the reference template uses. Khmer glyphs
// fall back, per character, to Battambang (text) and Moul (script-style names).
const carattere = Carattere({ weight: "400", subsets: ["latin"], variable: "--font-carattere", display: "swap" });
const msMadi = Ms_Madi({ weight: "400", subsets: ["latin"], variable: "--font-ms-madi", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora-g", display: "swap" });
const nautigal = The_Nautigal({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-the-nautigal", display: "swap" });
const whisper = Whisper({ weight: "400", subsets: ["latin"], variable: "--font-whisper-g", display: "swap" });
const roboto = Roboto({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-roboto-g", display: "swap" });
const battambang = Battambang({ weight: ["400", "700"], subsets: ["khmer", "latin"], variable: "--font-battambang", display: "swap" });
const moul = Moul({ weight: "400", subsets: ["khmer", "latin"], variable: "--font-moul", display: "swap" });
const fontVars = [carattere, msMadi, lora, nautigal, whisper, roboto, battambang, moul].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "Dara & Sreyneang — សិរីមង្គលអាពាហ៍ពិពាហ៍",
  description: "Wedding invitation · សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5e813c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="km" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
