'use client';

import { SOCIAL_LINKS } from '@/lib/constants';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { motion } from 'framer-motion';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2H15C13.67 2 12.4 2.53 11.46 3.46C10.53 4.4 10 5.67 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73 14.11 6.48 14.29 6.29C14.48 6.11 14.73 6 15 6H18V2Z" />
    </svg>
  ),
  linkedin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8C17.59 8 19.1 8.63 20.24 9.76C21.37 10.9 22 12.41 22 14V21H18V14C18 13.47 17.79 12.96 17.41 12.59C17.04 12.21 16.53 12 16 12C15.47 12 14.96 12.21 14.59 12.59C14.21 12.96 14 13.47 14 14V21H10V14C10 12.41 10.63 10.9 11.76 9.76C12.9 8.63 14.41 8 16 8Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  whatsapp: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.83 21 8.26 20.56 6.9 19.78L3 21L4.22 17.1C3.44 15.74 3 14.17 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 22 7.25 22 12.5" />
    </svg>
  ),
};

export default function SocialSection() {
  return (
    <section id="social" className="section-padding">
      <div className="container-narrow">
        <SectionHeading
          caption="Connect"
          title="Follow AISCA"
          subtitle="Stay connected with the latest updates, events, and community stories."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {SOCIAL_LINKS.map((link, i) => (
            <ScrollReveal key={link.platform} delay={i * 0.08}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                <motion.div
                  className="glass-card-glow p-6 md:p-8 text-center group cursor-pointer"
                  whileHover={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex justify-center mb-4 text-white/15 group-hover:text-white/45 transition-colors duration-500">
                    {SOCIAL_ICONS[link.icon]}
                  </div>
                  <p className="text-[13px] text-white/30 group-hover:text-white/55 transition-colors duration-500 font-light">
                    {link.platform}
                  </p>
                </motion.div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
