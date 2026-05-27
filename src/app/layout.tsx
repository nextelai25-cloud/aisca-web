import type { Metadata } from "next";
import "./globals.css";
import Preloader from '@/components/Preloader';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export const metadata: Metadata = {
  metadataBase: new URL('https://aisca.lk'),
  title: {
    default: 'AISCA | All Island Schools Commerce Association Sri Lanka',
    template: '%s | AISCA'
  },
  description: 'AISCA — All Island Schools Commerce Association. Sri Lanka\'s largest student-led commerce network uniting 2,000+ students across 25 educational districts. Join the islandwide movement.',
  keywords: [
    'AISCA',
    'All Island Schools Commerce Association',
    'Sri Lanka commerce students',
    'school commerce society Sri Lanka',
    'student commerce association Sri Lanka',
    'AISCA Sri Lanka',
    'commerce education Sri Lanka',
    'youth leadership Sri Lanka',
    'school commerce society',
    'student network Sri Lanka',
    'AISCA associate member',
    'commerce students network',
    'all island schools',
    'Sri Lanka student association',
    'aisca.lk'
  ],
  authors: [{ name: 'AISCA', url: 'https://aisca.lk' }],
  creator: 'All Island Schools Commerce Association',
  publisher: 'AISCA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: 'https://aisca.lk',
    siteName: 'AISCA | All Island Schools Commerce Association',
    title: 'AISCA | All Island Schools Commerce Association Sri Lanka',
    description: 'Sri Lanka\'s largest student-led commerce network. Uniting 2,000+ commerce students across all 25 educational districts. Join AISCA today.',
    images: [
      {
        url: 'https://aisca.lk/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AISCA — All Island Schools Commerce Association Sri Lanka',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aisca.lk',
    creator: '@aisca.lk',
    title: 'AISCA | All Island Schools Commerce Association Sri Lanka',
    description: 'Sri Lanka\'s largest student-led commerce network. 2,000+ students. 80+ schools. Join AISCA.',
    images: ['https://aisca.lk/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: 'https://aisca.lk'
  },
  category: 'education',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: [{ url: '/favicon.ico' }]
  },
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#080808" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "All Island Schools Commerce Association",
              "alternateName": "AISCA",
              "url": "https://aisca.lk",
              "logo": "https://aisca.lk/aisca-logo.webp",
              "description": "Sri Lanka's largest student-led commerce network uniting 2,000+ students across 25 educational districts",
              "foundingDate": "2024",
              "foundingLocation": "Colombo, Sri Lanka",
              "areaServed": "Sri Lanka",
              "sameAs": [
                "https://www.instagram.com/aisca.lk/",
                "https://web.facebook.com/profile.php?id=61586432106049",
                "https://www.linkedin.com/company/all-island-schools-commerce-association-aisca/"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "membership",
                "url": "https://aisca.lk/register/associate"
              },
              "memberOf": {
                "@type": "EducationalOrganization",
                "name": "Sri Lanka School Commerce Network"
              }
            })
          }}
        />
        <AnalyticsTracker />
        <Preloader />
        <div className="page-content">
          {children}
        </div>
      </body>
    </html>
  );
}
