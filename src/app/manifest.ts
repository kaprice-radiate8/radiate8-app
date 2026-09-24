/**
 * APP MANIFEST
 * Tells phones how to install this as an app on the home screen
 * (name, icon, colors). Values come from app.config.ts.
 */
import type { MetadataRoute } from "next";
import { brand, colors } from "@/config/app.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.appName,
    short_name: brand.shortName,
    description: brand.description,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: colors.sand,
    theme_color: colors.sand,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
