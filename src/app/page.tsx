'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

import Preloader from '@/components/layout/Preloader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import HeroSection from '@/components/sections/HeroSection';
import MissionVisionSection from '@/components/sections/MissionVisionSection';
import StatsSection from '@/components/sections/StatsSection';
import ChairmanSection from '@/components/sections/ChairmanSection';
import BoardSection from '@/components/sections/BoardSection';
import GallerySection from '@/components/sections/GallerySection';
import ProductsSection from '@/components/sections/ProductsSection';
import RegisterSection from '@/components/sections/RegisterSection';
import SpotlightSection from '@/components/sections/SpotlightSection';

const SmoothScrollProvider = dynamic(() => import('@/providers/SmoothScrollProvider'), { ssr: false });

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const done = useCallback(() => {
    setLoading(false);
    document.body.classList.remove('preloader-active');
  }, []);

  return (
    <>
      {/* {loading && <Preloader onComplete={done} />} */}
      <SmoothScrollProvider>
        <Navbar />
        <main className={`transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          <HeroSection />
          <div className="sep" />
          <SpotlightSection />
          <div className="sep" />
          <MissionVisionSection />
          <div className="sep" />
          <StatsSection />
          <div className="sep" />
          <ChairmanSection />
          <div className="sep" />
          <BoardSection />
          <div className="sep" />
          <ProductsSection />
          <div className="sep" />
          <GallerySection />
          <div className="sep" />
          <RegisterSection />
        </main>
        <Footer />
      </SmoothScrollProvider>
    </>
  );
}
