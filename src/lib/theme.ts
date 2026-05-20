/**
 * AISCA Premium Theme Configuration
 * Lightweight config for motion, z-index, and JS-shared tokens.
 * CSS variables are defined in globals.css
 */

export const theme = {
  motion: {
    duration: {
      fast: 0.15,    // 150ms - micro interactions, hovers
      normal: 0.25,  // 250ms - state changes, small reveals
      slow: 0.4,     // 400ms - section entries
      reveal: 0.7,   // 700ms - large staggered reveals
    },
    ease: {
      // Linear/Apple-like cubic bezier
      default: [0.22, 1, 0.36, 1] as const,
      inOut: [0.65, 0, 0.35, 1] as const,
      out: [0.16, 1, 0.3, 1] as const,
    }
  },
  zIndex: {
    behind: -1,
    base: 0,
    elevated: 10,
    dropdown: 40,
    sticky: 50,
    drawer: 60,
    modal: 70,
    toast: 80,
    preloader: 100,
  },
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  }
} as const;

export type Theme = typeof theme;
