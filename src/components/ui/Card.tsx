import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', padding = 'md', hoverable = false, ...props }, ref) => {
    
    const paddings = {
      none: "p-0",
      sm:   "p-5 md:p-6",
      md:   "p-7 md:p-10",
      lg:   "p-10 lg:p-14",
    };

    return (
      <motion.div
        ref={ref}
        className={`bg-[#0a0a0a]/50 backdrop-blur-2xl bg-[linear-gradient(160deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.002)_100%)] border border-white/[0.04] rounded-3xl ${paddings[padding]} ${
          hoverable ? 'cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.08] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)] hover:bg-[#0a0a0a]/80' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
