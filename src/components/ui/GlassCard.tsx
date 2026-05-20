'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: string;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  padding = 'p-6 md:p-8',
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-[20px]
        ${glow ? 'glass-card-glow' : 'glass-card'}
        ${padding}
        ${className}
      `}
      whileHover={
        hover
          ? {
              y: -3,
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
    >
      {/* Inner highlight line at top */}
      <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
