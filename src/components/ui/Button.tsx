import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "className"> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/20 whitespace-nowrap";
    
    const variants = {
      primary: "bg-white text-black hover:bg-zinc-100",
      ghost: "bg-transparent text-white hover:bg-white/[0.04]",
      outline: "bg-transparent border border-white/10 text-white hover:bg-white/[0.02] hover:border-white/20",
    };

    const sizes = {
      sm: "text-[12px] px-3 min-h-[36px] md:min-h-[32px] rounded-lg", // Keep 36px on mobile for compact, but default to 44px minimum for standard
      md: "text-[14px] px-5 min-h-[44px]",
      lg: "text-[16px] px-7 min-h-[48px] rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
