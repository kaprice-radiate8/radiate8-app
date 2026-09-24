/**
 * Creates the app's home-screen icons (public/icons/*.png) from a
 * simple figure-eight drawing in the brand colors.
 * Run again after changing colors:  node scripts/generate-icons.mjs
 * (Uses "sharp", which comes installed alongside Next.js.)
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const TERRACOTTA = "#C26A4A";
const CREAM = "#FBF6EE";
const SAND = "#EFE3D3";
const GOLD = "#D8A865";

// A smooth figure eight (lemniscate), standing upright.
function eightPath(cx, cy, size) {
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    const x = (size * Math.sin(t) * Math.cos(t)) / d;
    const y = (size * Math.cos(t)) / d;
    pts.push(`${i ? "L" : "M"}${(cx + x).toFixed(1)} ${(cy + y).toFixed(1)}`);
  }
  return pts.join(" ") + "Z";
}

function svg(scale) {
  // `scale` shrinks the eight for "maskable" icons, which phones crop into circles.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="35%" cy="25%" r="85%">
      <stop offset="0%" stop-color="${CREAM}"/>
      <stop offset="60%" stop-color="${SAND}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <path d="${eightPath(256, 256, 190 * scale)}" fill="none" stroke="${TERRACOTTA}" stroke-width="${22 * scale}" stroke-linecap="round"/>
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
