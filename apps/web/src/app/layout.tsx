import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Providers } from "@/components/providers";
import { PwaAutoUpdater } from "@/components/pwa-auto-updater";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700", "800"],
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
  themeColor: "#0056d2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground antialiased">
        <Providers>
          <PwaAutoUpdater />
          {children}
        </Providers>
      </body>
    </html>
  );
}
