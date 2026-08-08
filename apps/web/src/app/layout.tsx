import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Providers } from "@/components/providers";
import { PwaAutoUpdater } from "@/components/pwa-auto-updater";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SusuFlow | Enterprise Susu & Digital Savings",
  description:
    "Eliminate fraud in susu collection with gateway-confirmed digital deposits",
  applicationName: "SusuFlow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SusuFlow",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#010517",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} --font-jakarta:${geist.variable} --font-open-sans:${geist.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>
          <PwaAutoUpdater />
          {children}
        </Providers>
      </body>
    </html>
  );
}
