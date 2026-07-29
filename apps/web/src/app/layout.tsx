import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Providers } from "@/components/providers";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SusuFlow | Digital Susu Savings",
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
      <body className="min-h-full flex flex-col bg-background font-sans text-[18px] font-normal leading-[30.6px] text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
