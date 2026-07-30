import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollWrapper from '@/providers/ScrollWrapper';
import ContactSection from '@/components/sections/ContactSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata = {
  title: 'Contact AISCA | Get In Touch With Our Board',
  description: 'Reach out to the All Island Schools Commerce Association. Find official directories, email channels, and submit message forms for partnerships and queries.',
  alternates: { canonical: 'https://aisca.lk/contact' }
};

export default function ContactPage() {
  return (
    <ScrollWrapper>
      <Navbar />
      <main className="min-h-screen bg-[#050505] pt-28">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <Breadcrumbs items={[{ label: 'Contact' }]} className="mb-4" />
        </div>
        
        <ContactSection />
        
        <Footer />
      </main>
    </ScrollWrapper>
  );
}
