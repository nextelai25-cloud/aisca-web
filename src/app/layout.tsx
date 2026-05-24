import type { Metadata } from "next";
import "./globals.css";
import Preloader from '@/components/Preloader';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export const metadata: Metadata = {
  title: 'AISCA | All Island Schools Commerce Association',
  description: 'All Island Schools Commerce Association (AISCA) — Uniting ambitious commerce students across all 25 educational districts of Sri Lanka. Join the islandwide movement.',
  keywords: 'AISCA, All Island Schools Commerce Association, Sri Lanka commerce students, school commerce society, youth leadership Sri Lanka, commerce education Sri Lanka',
  openGraph: {
    title: 'AISCA | All Island Schools Commerce Association',
    description: 'Uniting ambitious commerce students across all 25 educational districts of Sri Lanka.',
    url: 'https://aisca.lk',
    siteName: 'AISCA',
    locale: 'en_LK',
    type: 'website',
    images: [
      {
        url: 'https://aisca.lk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AISCA - All Island Schools Commerce Association'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AISCA | All Island Schools Commerce Association',
    description: 'Uniting ambitious commerce students across Sri Lanka.',
    images: ['https://aisca.lk/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    }
  },
  alternates: {
    canonical: 'https://aisca.lk'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><meta name="theme-color" content="#030303" /></head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AnalyticsTracker />
        <Preloader />
        <div className="page-content">
          {children}
        </div>
      </body>
    </html>
  );
}
