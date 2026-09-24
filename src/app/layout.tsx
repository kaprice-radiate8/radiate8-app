/**
 * ROOT LAYOUT
 * The frame around every screen: fonts, colors, the golden background,
 * the shared music player, and the bottom navigation.
 */
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Dancing_Script, Jost } from "next/font/google";
import { brand, colors } from "@/config/app.config";
import { themeCss } from "@/config/theme-css";
import { AudioProvider } from "@/components/music/AudioProvider";
import { BottomNav } from "@/components/BottomNav";
import { GoldenBackground } from "@/components/GoldenBackground";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

// Elegant high-contrast serif for headlines
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// Handwritten script for emotional accent lines
const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });

// Clean sans for labels and small text
const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: brand.appName, template: `%s · ${brand.appName}` },
  description: brand.description,
  applicationName: brand.appName,
  appleWebApp: { capable: true, title: brand.shortName, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: colors.sand,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dancing.variable} ${jost.variable} antialiased`}>
      <head>
        {/* Colors from app.config.ts, turned into CSS variables */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-dvh">
        <GoldenBackground />
        <AudioProvider>
          <main className="mx-auto min-h-dvh w-full max-w-md px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32">
            {children}
          </main>
          <BottomNav />
        </AudioProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
