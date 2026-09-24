/**
 * ROOT LAYOUT
 * The frame around every screen: fonts, colors, the golden background,
 * the shared music player, and the bottom navigation.
 */
import type { Metadata, Viewport } from "next";
import { brand, colors } from "@/config/app.config";
import { fontVariables } from "@/config/fonts";
import { themeCss } from "@/config/theme-css";
import { AudioProvider } from "@/components/music/AudioProvider";
import { BottomNav } from "@/components/BottomNav";
import { GoldenBackground } from "@/components/GoldenBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: brand.appName, template: `%s · ${brand.appName}` },
  description: brand.description,
  applicationName: brand.appName,
  appleWebApp: { capable: true, title: brand.shortName, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: colors.ivory,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <head>
        {/* Colors from app.config.ts, turned into CSS variables */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-dvh">
        <GoldenBackground />
        <AudioProvider>
          <main className="mx-auto min-h-dvh w-full max-w-md px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32">
            <SiteHeader />
            {children}
          </main>
          <BottomNav />
        </AudioProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
