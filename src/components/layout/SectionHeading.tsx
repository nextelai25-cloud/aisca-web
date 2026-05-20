import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  alignment?: 'left' | 'center';
  className?: string;
}

export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ badge, title, description, alignment = 'center', className = '' }, ref) => {
    
    const aligns = {
      left:   'text-left items-start',
      center: 'text-center items-center mx-auto',
    };

    return (
      <div
        ref={ref}
        className={`flex flex-col gap-4 mb-14 md:mb-20 max-w-3xl ${aligns[alignment]} ${className}`}
      >
        {badge && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-[11px] tracking-[0.25em] uppercase text-white/25 font-normal"
          >
            {badge}
          </motion.p>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
          className="type-display-lg tracking-tight text-white"
        >
          {title}
        </motion.h2>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-white/50 font-light text-base lg:text-lg leading-relaxed max-w-[65ch]"
          >
            {description}
          </motion.p>
        )}
      </div>
    );
  }
);

SectionHeading.displayName = 'SectionHeading';
