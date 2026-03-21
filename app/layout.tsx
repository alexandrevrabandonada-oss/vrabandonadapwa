import type { Metadata, Viewport } from "next";

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NetworkStatusBanner } from "@/components/network-status-banner";
import { PwaReadingTrailTracker } from "@/components/pwa-reading-trail";
import { PwaRegister } from "@/components/pwa-register";
import { ReadingAssistant } from "@/components/reading-assistant";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  manifest: "/manifest.webmanifest",
  keywords: ["Volta Redonda", "memória", "denúncia", "organização popular", "cidade operária"],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: [
    { rel: "icon", url: "/icon" },
    { rel: "apple-touch-icon", url: "/apple-icon" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo principal
        </a>
        <PwaRegister />
        <PwaReadingTrailTracker />
        <div className="site-shell">
          <SiteHeader />
          <NetworkStatusBanner />
          <ReadingAssistant />
          <main id="conteudo" className="site-main">
            {children}
          </main>
          <MobileBottomNav />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
