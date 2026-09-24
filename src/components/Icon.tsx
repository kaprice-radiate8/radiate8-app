/**
 * ICONS
 * The config file refers to icons by simple names like "sun".
 * This file maps those names to the actual drawings (from the lucide icon set).
 * To add one: import it below and add a line to `icons`.
 * Browse all available icons at https://lucide.dev/icons
 */
import {
  Briefcase,
  Coins,
  Flower2,
  Heart,
  HeartPulse,
  House,
  Leaf,
  Moon,
  Sparkles,
  Sprout,
  Sun,
  Waves,
  type LucideProps,
} from "lucide-react";

const icons = {
  briefcase: Briefcase,
  coins: Coins,
  flower: Flower2,
  heart: Heart,
  "heart-pulse": HeartPulse,
  house: House,
  leaf: Leaf,
  moon: Moon,
  sparkles: Sparkles,
  sprout: Sprout,
  sun: Sun,
  waves: Waves,
};

export type IconName = keyof typeof icons;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  // Unknown names fall back to a sparkle so nothing ever breaks.
  const Component = icons[name as IconName] ?? Sparkles;
  return <Component strokeWidth={1.4} {...props} />;
}
