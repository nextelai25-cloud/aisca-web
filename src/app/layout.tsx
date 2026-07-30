import type { Metadata } from "next";
import "./globals.css";
import Preloader from '@/components/Preloader';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export const metadata: Metadata = {
  metadataBase: new URL('https://aisca.lk'),
  title: {
    default: 'AISCA | All Island Schools Commerce Association',
    template: '%s | AISCA'
  },
  description: 'AISCA connects 2,000+ commerce students across 80+ schools and all 25 educational districts of Sri Lanka through leadership, education, networking and national initiatives.',
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
    title: 'AISCA | All Island Schools Commerce Association',
    description: 'AISCA connects 2,000+ commerce students across 80+ schools and all 25 educational districts of Sri Lanka through leadership, education, networking and national initiatives.',
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
    title: 'AISCA | All Island Schools Commerce Association',
    description: 'AISCA connects 2,000+ commerce students across 80+ schools and all 25 educational districts of Sri Lanka through leadership, education, networking and national initiatives.',
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
    // './' resolves against metadataBase per-page, so every page gets its own
    // correct canonical URL instead of all pages pointing at the homepage.
    canonical: './'
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
                  "description": "AISCA connects 2,000+ commerce students across 80+ schools and all 25 educational districts of Sri Lanka through leadership, education, networking and national initiatives.",
                  "foundingDate": "2024",
                  "founder": {
                    "@type": "Person",
                    "name": "Isira Chirayu"
                  },
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
                      "url": "https://aisca.lk/contact",
                      "areaServed": "LK"
                    }
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://aisca.lk/#website",
                  "url": "https://aisca.lk",
                  "name": "AISCA | All Island Schools Commerce Association",
                  "description": "All Island Schools Commerce Association Sri Lanka",
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
                  "name": "AISCA | All Island Schools Commerce Association",
                  "isPartOf": { "@id": "https://aisca.lk/#website" },
                  "about": { "@id": "https://aisca.lk/#organization" },
                  "description": "AISCA connects 2,000+ commerce students across 80+ schools and all 25 educational districts of Sri Lanka.",
                  "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://aisca.lk" },
                      { "@type": "ListItem", "position": 2, "name": "About", "item": "https://aisca.lk/about" },
                      { "@type": "ListItem", "position": 3, "name": "Officials", "item": "https://aisca.lk/officials" },
                      { "@type": "ListItem", "position": 4, "name": "Events", "item": "https://aisca.lk/events" },
                      { "@type": "ListItem", "position": 5, "name": "Join", "item": "https://aisca.lk/join" },
                      { "@type": "ListItem", "position": 6, "name": "IdeaNet", "item": "https://aisca.lk/ideanet" },
                      { "@type": "ListItem", "position": 7, "name": "Contact", "item": "https://aisca.lk/contact" }
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
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://aisca.lk/#faq",
                  "isPartOf": { "@id": "https://aisca.lk/#website" },
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "What is AISCA?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The All Island Schools Commerce Association (AISCA) is Sri Lanka's largest commerce network, connecting 2,000+ commerce students across 80+ schools in all 25 educational districts through leadership, education, networking, and national initiatives."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Who can join AISCA?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Any school student studying commerce subjects (Accounting, Business Studies, Economics) or interested in entrepreneurship and leadership in Sri Lanka can join AISCA as an Individual Associate Member."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How do schools register with AISCA?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "School commerce societies can affiliate with AISCA by submitting their details through the School Registry form at https://aisca.lk/register/school to participate in national commerce challenges and events."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is AISCA free to join?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, standard individual associate membership and school affiliation are free of charge. AISCA is committed to making commerce education and youth leadership resources accessible to all students across Sri Lanka."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How many schools are connected to AISCA?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "AISCA currently connects over 80 schools across all 25 educational districts in Sri Lanka, creating an islandwide community for peer learning and collaboration."
                      }
                    }
                  ]
                },
                {
                  "@type": "Event",
                  "@id": "https://aisca.lk/events/#economics-day-2026",
                  "name": "AISCA Free Seminar Series - Economics Day",
                  "startDate": "2026-06-06T09:00:00+05:30",
                  "endDate": "2026-06-06T15:00:00+05:30",
                  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                  "eventStatus": "https://schema.org/EventScheduled",
                  "location": {
                    "@type": "Place",
                    "name": "AICPA & CIMA Auditorium",
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "Colombo 05",
                      "addressLocality": "Colombo",
                      "addressCountry": "LK"
                    }
                  },
                  "image": [
                    "https://aisca.lk/events/seminar/main-image.webp"
                  ],
                  "description": "Educational outreach seminar delivering key insights in economics to 150+ students with Prof. Gamini Weerasinghe.",
                  "organizer": {
                    "@id": "https://aisca.lk/#organization"
                  }
                },
                {
                  "@type": "Event",
                  "@id": "https://aisca.lk/events/#legacy-night-2026",
                  "name": "Legacy Night 2026",
                  "startDate": "2026-04-25T18:00:00+05:30",
                  "endDate": "2026-04-25T23:30:00+05:30",
                  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                  "eventStatus": "https://schema.org/EventScheduled",
                  "location": {
                    "@type": "Place",
                    "name": "Colombo",
                    "address": {
                      "@type": "PostalAddress",
                      "addressLocality": "Colombo",
                      "addressCountry": "LK"
                    }
                  },
                  "image": [
                    "https://aisca.lk/events/legacy26/WhatsApp Image 2026-05-20 at 13.58.44.webp"
                  ],
                  "description": "AISCA Signature annual social gathering for commerce society members and leadership associates.",
                  "organizer": {
                    "@id": "https://aisca.lk/#organization"
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
