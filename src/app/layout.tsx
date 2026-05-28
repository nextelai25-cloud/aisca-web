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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  manifest: '/site.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#080808" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://aisca.lk/#organization",
                  "name": "All Island Schools Commerce Association",
                  "alternateName": ["AISCA", "AISCA Sri Lanka"],
                  "url": "https://aisca.lk",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://aisca.lk/android-chrome-512x512.png",
                    "width": 512,
                    "height": 512
                  },
                  "description": "Sri Lanka's largest student-led commerce network uniting 2,000+ students across all 25 educational districts. Founded to connect school commerce societies islandwide.",
                  "foundingDate": "2024",
                  "foundingLocation": {
                    "@type": "Place",
                    "name": "Colombo, Sri Lanka"
                  },
                  "areaServed": {
                    "@type": "Country",
                    "name": "Sri Lanka"
                  },
                  "sameAs": [
                    "https://www.instagram.com/aisca.lk/",
                    "https://web.facebook.com/profile.php?id=61586432106049",
                    "https://www.linkedin.com/company/all-island-schools-commerce-association-aisca/"
                  ],
                  "contactPoint": [
                    {
                      "@type": "ContactPoint",
                      "contactType": "membership",
                      "url": "https://aisca.lk/register/associate",
                      "areaServed": "LK"
                    },
                    {
                      "@type": "ContactPoint",
                      "contactType": "customer support",
                      "url": "https://aisca.lk/#contact",
                      "areaServed": "LK"
                    }
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://aisca.lk/#website",
                  "url": "https://aisca.lk",
                  "name": "AISCA | All Island Schools Commerce Association",
                  "description": "Sri Lanka's largest student-led commerce network",
                  "publisher": { "@id": "https://aisca.lk/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://aisca.lk/?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "WebPage",
                  "@id": "https://aisca.lk/#webpage",
                  "url": "https://aisca.lk",
                  "name": "AISCA | All Island Schools Commerce Association Sri Lanka",
                  "isPartOf": { "@id": "https://aisca.lk/#website" },
                  "about": { "@id": "https://aisca.lk/#organization" },
                  "description": "Join AISCA — Sri Lanka's largest student commerce network. 2,000+ students. 80+ schools. All 25 educational districts.",
                  "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://aisca.lk" },
                      { "@type": "ListItem", "position": 2, "name": "Join AISCA", "item": "https://aisca.lk/register/associate" },
                      { "@type": "ListItem", "position": 3, "name": "Register School", "item": "https://aisca.lk/register/school" },
                      { "@type": "ListItem", "position": 4, "name": "Products", "item": "https://aisca.lk/products/tshirt" },
                      { "@type": "ListItem", "position": 5, "name": "Contact", "item": "https://aisca.lk/#contact" }
                    ]
                  }
                },
                {
                  "@type": "EducationalOrganization",
                  "@id": "https://aisca.lk/#educationalorg",
                  "name": "All Island Schools Commerce Association",
                  "url": "https://aisca.lk",
                  "description": "Connecting school commerce societies across Sri Lanka's 25 educational districts",
                  "numberOfStudents": 2000,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Colombo",
                    "addressCountry": "LK"
                  }
                }
              ]
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
