/**
 * Creates the app's home-screen icons (public/icons/*.png): the seven-dot
 * micro mark in gold on ivory, with the pale serif 8 behind it, following
 * the Radiate 8 brand guide ("compact uses: use the micro mark").
 * Replace with the approved master artwork when available.
 * Run again after changing colors:  node scripts/generate-icons.mjs
 * (Uses "sharp", which comes installed alongside Next.js.)
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const GOLD = "#C18D4A";
const IVORY = "#F4E7D8";
const BLUSH = "#E8D2CD";

// Same dots as src/components/MicroMark.tsx (vertical position, radius).
const DOTS = [
  [5, 3.2],
  [19, 4.2],
  [36, 5.4],
  [57, 8.2],
  [79, 7],
  [98, 4.8],
  [114, 3.4],
];

function svg(scale) {
  // `scale` shrinks the artwork for "maskable" icons, which phones crop into circles.
  const h = 330 * scale; // height of the dot stack
  const k = h / 119;
  const top = 256 - (119 * k) / 2;
  const dots = DOTS.map(
    ([cy, r]) => `<circle cx="256" cy="${(top + cy * k).toFixed(1)}" r="${(r * k).toFixed(1)}" fill="${GOLD}"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${IVORY}"/>
  <text x="256" y="262" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" font-size="${440 * scale}" fill="${BLUSH}">8</text>
  ${dots}
</svg>`;
}

mkdirSync("public/icons", { recursive: true });
const regular = Buffer.from(svg(1));
const maskable = Buffer.from(svg(0.72));
await sharp(regular).resize(192).png().toFile("public/icons/icon-192.png");
await sharp(regular).resize(512).png().toFile("public/icons/icon-512.png");
await sharp(maskable).resize(512).png().toFile("public/icons/icon-maskable-512.png");
await sharp(regular).resize(180).png().toFile("src/app/apple-icon.png");
await sharp(regular).resize(64).png().toFile("src/app/icon.png");
console.log("Icons written to public/icons and src/app");
