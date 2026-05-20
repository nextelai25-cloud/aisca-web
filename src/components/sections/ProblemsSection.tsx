'use client';

import { PROBLEMS } from '@/lib/constants';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ProblemsSection() {
  return (
    <section id="problems" className="section-padding">
      <div className="container-default">
        
        {/* Heading — centered */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">The Challenge</span>
          <h2 className="section-title">Why AISCA Exists</h2>
          <p className="section-subtitle">
            Before AISCA, Sri Lanka had no centralized network connecting school level commerce
            societies with each other. Each school organized activities independently, and students
            returned home without long term connections with commerce students from other schools.
          </p>
        </div>

        {/* Problem cards — centered 2-col grid, max-w-4xl */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PROBLEMS.map((problem, i) => (
            <ScrollReveal key={problem.number} delay={i * 0.12}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '36px',
                }}
              >
                <span className="text-label text-[10px] block mb-5">
                  {problem.number}
                </span>
                <h3 className="font-display text-[1.1rem] md:text-[1.25rem] font-semibold text-white mb-4 leading-snug">
                  {problem.title}
                </h3>
                <p className="text-body text-[13px] md:text-[14px] leading-[1.8]">
                  {problem.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
