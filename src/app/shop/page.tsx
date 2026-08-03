import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollWrapper from '@/providers/ScrollWrapper';
import ShopSection from '@/components/sections/ShopSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata = {
  title: 'AISCA Merchandise Collection | Order Now',
  description: 'Order official AISCA merchandise — the Black Edition T-Shirt, Wrist Band, and Blazer Pin. Choose your items, pay by bank transfer, and upload your receipt.',
  alternates: { canonical: 'https://aisca.lk/shop' },
};

export default function ShopPage() {
  return (
    <ScrollWrapper>
      <Navbar />
      <main className="min-h-screen bg-[#050505] pt-28">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <Breadcrumbs items={[{ label: 'Shop' }]} className="mb-4" />
        </div>

        <ShopSection />

        <Footer />
      </main>
    </ScrollWrapper>
  );
}
