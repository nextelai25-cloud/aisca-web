import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlowCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className = '', padding = 'md', ...props }, ref) => {
    
    const paddings = {
      none: "p-0",
      sm:   "p-5 md:p-6",
      md:   "p-8 md:p-10",
      lg:   "p-10 lg:p-14",
    };

    return (
      <motion.div
        ref={ref}
        className={`relative bg-[#0a0a0a]/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.005)_100%)] border border-white/[0.05] rounded-3xl backdrop-blur-3xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.08] hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(255,255,255,0.02)] ${paddings[padding]} ${className}`}
        {...props}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />
        {children}
      </motion.div>
    );
  }
);

GlowCard.displayName = 'GlowCard';
