'use client';

import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ScrollReveal({
  children, className = '', delay = 0, direction = 'up',
}: {
  children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const dirs = { up: { y: 20 }, down: { y: -20 }, left: { x: 24 }, right: { x: -24 } };

  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...dirs[direction] }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
