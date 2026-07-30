import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollWrapper from '@/providers/ScrollWrapper';
import GallerySection from '@/components/sections/GallerySection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata = {
  title: 'Events & Initiatives | AISCA Impact Gallery',
  description: 'Explore the national commerce seminars, community outreach campaigns, environmental drives, and annual socials organized by the All Island Schools Commerce Association.',
  alternates: { canonical: 'https://aisca.lk/events' }
};

export default function EventsPage() {
  return (
    <ScrollWrapper>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-28">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <Breadcrumbs items={[{ label: 'Events' }]} className="mb-4" />
        </div>
        
        <GallerySection />
        
        <Footer />
      </main>
    </ScrollWrapper>
  );
}
