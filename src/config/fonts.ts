/**
 * ============================================================
 *  FONTS (from the Radiate 8 brand guide)
 * ============================================================
 *
 *  Cormorant Garamond leads. DM Sans explains. The script adds feeling.
 *
 *  - Headlines:  Cormorant Garamond 500, line height 1.1, slightly tight spacing
 *  - Body / UI:  DM Sans 400 to 500, line height 1.6 (500 for small text)
 *  - Labels:     DM Sans 500, uppercase, generous letter spacing
 *  - Script:     La Luxes Script, two to six words, one accent per screen
 *
 *  LA LUXES SCRIPT is a paid font, so it is not available from Google Fonts.
 *  Until its web font file is added, "Allison" (a similar thin signature script)
 *  stands in. To switch to the real font:
 *    1. Put the licensed file at src/fonts/LaLuxesScript.woff2
 *       (check the license covers web/app use)
 *    2. Delete the `Allison` lines below and uncomment the `localFont` block
 */
import { Allison, Cormorant_Garamond, DM_Sans } from "next/font/google";
// import localFont from "next/font/local";

export const serifFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const sansFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const scriptFont = Allison({
  variable: "--font-accent-script",
  subsets: ["latin"],
  weight: "400",
});

// export const scriptFont = localFont({
//   src: "../fonts/LaLuxesScript.woff2",
//   variable: "--font-accent-script",
// });

/** All font class names, applied once in src/app/layout.tsx. */
export const fontVariables = [serifFont.variable, sansFont.variable, scriptFont.variable].join(" ");
