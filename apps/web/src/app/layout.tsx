import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/fontawesome';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'SusuFlow | Digital Susu Savings',
  description: 'Eliminate fraud in susu collection with gateway-confirmed digital deposits',
  applicationName: 'SusuFlow',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'SusuFlow',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#22c55e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background font-sans text-base font-normal leading-relaxed text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
