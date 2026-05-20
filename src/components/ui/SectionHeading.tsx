'use client';

import ScrollReveal from './ScrollReveal';

interface SectionHeadingProps {
  caption?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeading({
  caption,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-2xl mb-12 md:mb-16 ${alignment} ${className}`}>
      {caption && (
        <ScrollReveal delay={0}>
          <p className="text-caption mb-3 md:mb-4">{caption}</p>
        </ScrollReveal>
      )}
      <ScrollReveal delay={0.06}>
        <h2 className="text-headline text-white">{title}</h2>
      </ScrollReveal>
      {subtitle && (
        <ScrollReveal delay={0.12}>
          <p className="text-subtitle mt-4 md:mt-5 max-w-xl mx-auto">{subtitle}</p>
        </ScrollReveal>
      )}
    </div>
  );
}
