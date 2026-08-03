import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollWrapper from '@/providers/ScrollWrapper';
import ShopSection from '@/components/sections/ShopSection';

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
        <ShopSection />

        <Footer />
      </main>
    </ScrollWrapper>
  );
}
