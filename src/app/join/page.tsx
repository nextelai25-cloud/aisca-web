import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollWrapper from '@/providers/ScrollWrapper';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { User, School, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Join AISCA | All Island Schools Commerce Association',
  description: 'Join Sri Lanka\'s national student commerce network. Affiliate your school\'s commerce society or register as an individual associate member today.',
  alternates: { canonical: 'https://aisca.lk/join' }
};

export default function JoinPage() {
  const individualBenefits = [
    'Access to national commerce summits & masterclasses',
    'Direct networking with 2,000+ peers islandwide',
    'Share and collaborate on project designs on IdeaNet',
    'Opportunities for national leadership & credentials'
  ];

  const schoolBenefits = [
    'Official school affiliation with the national association',
    'Co-hosting national events, seminars, and projects',
    'Direct collaboration between school commerce presidents',
    'Visibility on the national school commerce map'
  ];

  return (
    <ScrollWrapper>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-28 pb-20 relative overflow-hidden">
        {/* Background flares */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37]/[0.02] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1100px] mx-auto px-6 relative z-10">
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: 'Join' }]} className="mb-8" />

          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#d4af37] uppercase block mb-3">
              Become a Part of AISCA
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 uppercase font-display leading-none">
              Join the Network
            </h1>
            <p className="text-sm md:text-base text-white/50 leading-relaxed uppercase tracking-wider font-light">
              Select your path to connect, lead, and shape the future of Sri Lanka&apos;s commerce landscape.
            </p>
          </div>

          {/* Registration Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Option 1: Associate Member */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col justify-between hover:border-white/10 transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white mb-8 group-hover:scale-105 transition-all">
                  <User size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide font-display">
                  Associate Member
                </h2>
                <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">
                  For Individual Students
                </p>
                <div className="space-y-4 mb-10">
                  {individualBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm text-white/60 leading-relaxed font-light uppercase tracking-wide">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="/register/associate"
                className="w-full min-h-[48px] bg-white text-black font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-2px]"
                style={{ textDecoration: 'none' }}
              >
                <span>Register as Associate</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Option 2: School Registration */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col justify-between hover:border-white/10 transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white mb-8 group-hover:scale-105 transition-all">
                  <School size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide font-display">
                  Affiliate School
                </h2>
                <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">
                  For School Commerce Societies
                </p>
                <div className="space-y-4 mb-10">
                  {schoolBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm text-white/60 leading-relaxed font-light uppercase tracking-wide">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="/register/school"
                className="w-full min-h-[48px] bg-transparent border border-white/10 hover:border-white/20 text-white font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-2px]"
                style={{ textDecoration: 'none' }}
              >
                <span>Affiliate Your School</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ScrollWrapper>
  );
}
