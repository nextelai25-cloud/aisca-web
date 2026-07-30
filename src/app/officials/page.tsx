import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollWrapper from '@/providers/ScrollWrapper';
import ChairmanSection from '@/components/sections/ChairmanSection';
import BoardSection from '@/components/sections/BoardSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata = {
  title: 'Board of Officials | AISCA National Leadership',
  description: 'Meet the National Executive Board and leadership teams of the All Island Schools Commerce Association steering the future of student commerce in Sri Lanka.',
  alternates: { canonical: 'https://aisca.lk/officials' }
};

export default function OfficialsPage() {
  return (
    <ScrollWrapper>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-28">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <Breadcrumbs items={[{ label: 'Officials' }]} className="mb-4" />
        </div>
        
        <ChairmanSection />
        <BoardSection />
        
        <Footer />
      </main>
    </ScrollWrapper>
  );
}
