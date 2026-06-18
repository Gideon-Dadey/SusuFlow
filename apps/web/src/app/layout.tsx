import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/fontawesome';
import { Providers } from '@/components/providers';
import { BRAND_LOGO } from '@/lib/brand-assets';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'SusuFlow — Digital Susu Savings',
  description: 'Eliminate fraud in susu collection with gateway-confirmed digital deposits',
  icons: {
    icon: BRAND_LOGO,
    apple: BRAND_LOGO,
  },
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
