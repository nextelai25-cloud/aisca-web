import { forwardRef } from 'react';

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  spacing?: 'default' | 'compact' | 'loose' | 'none';
  background?: 'transparent' | 'primary' | 'secondary' | 'tertiary' | 'subtle-glow';
}

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  ({ children, className = '', id, spacing = 'default', background = 'transparent', ...props }, ref) => {
    
    // Consistent padding — section owns the horizontal gutter
    const spacings = {
      default: "px-6 md:px-12 lg:px-16 py-24 md:py-28 lg:py-32",
      compact: "px-6 md:px-12 lg:px-16 py-16 md:py-20 lg:py-24",
      loose:   "px-6 md:px-12 lg:px-16 py-28 md:py-32 lg:py-40",
      none:    "",
    };

    const backgrounds = {
      transparent: "bg-transparent",
      primary:     "bg-[#050505]",
      secondary:   "bg-[#0a0a0a]",
      tertiary:    "bg-[#111111]",
      "subtle-glow": "relative bg-[#050505] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)] before:pointer-events-none",
    };

    return (
      <section
        ref={ref}
        id={id}
        className={`relative w-full ${spacings[spacing]} ${backgrounds[background]} ${className}`}
        {...props}
      >
        {children}
      </section>
    );
  }
);

SectionWrapper.displayName = 'SectionWrapper';
