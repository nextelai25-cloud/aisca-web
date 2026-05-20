'use client';

import { DEPUTY_CHAIRS } from '@/lib/constants';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

export default function DeputyChairSection() {
  return (
    <section className="section-padding">
      <div className="container-default">
        <SectionHeading
          caption="Leadership"
          title="Deputy Chairpersons"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          {DEPUTY_CHAIRS.map((person, i) => (
            <ScrollReveal key={person.name} delay={i * 0.12}>
              <GlassCard glow className="h-full" padding="p-0">
                {/* Compact portrait placeholder */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-[20px] border-b border-white/[0.03] bg-white/[0.008]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="52" height="68" viewBox="0 0 120 160" fill="none" className="opacity-[0.04]">
                      <circle cx="60" cy="42" r="24" fill="white" />
                      <ellipse cx="60" cy="125" rx="40" ry="32" fill="white" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 md:p-7">
                  <p className="text-label text-[10px] mb-2">{person.position}</p>
                  <h3 className="font-display text-[1.1rem] md:text-[1.2rem] font-medium text-white mb-4 leading-tight">
                    {person.name}
                  </h3>
                  <p className="text-body text-[13px] leading-[1.8] italic text-white/35">
                    &ldquo;{person.message}&rdquo;
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
