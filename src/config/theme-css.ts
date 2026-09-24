/**
 * Turns the colors in app.config.ts into CSS variables, so Tailwind
 * classes like `bg-cream` or `text-espresso` always use the config values.
 * You should not need to edit this file. Change colors in app.config.ts.
 */
import { colors } from "./app.config";

/** "sandLight" becomes "sand-light" */
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

export const themeCss = `:root{${Object.entries(colors)
  .map(([name, value]) => `--r8-${kebab(name)}:${value};`)
  .join("")}}`;
