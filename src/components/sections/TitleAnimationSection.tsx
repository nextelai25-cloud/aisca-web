'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function TitleAnimationSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const words = ['ALL', 'ISLAND', 'SCHOOLS', 'COMMERCE', 'ASSOCIATION'];

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-40 overflow-hidden px-5 sm:px-8 relative"
    >
      <div className="max-w-[1280px] mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-5 gap-y-1 md:gap-y-2">
          {words.map((word, i) => (
            <TitleWord
              key={word}
              word={word}
              scrollProgress={scrollYProgress}
              index={i}
              total={words.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TitleWord({
  word,
  scrollProgress,
  index,
  total,
}: {
  word: string;
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  index: number;
  total: number;
}) {
  const start = (index / total) * 0.5;
  const end = Math.min(start + 0.3, 0.85);

  const opacity = useTransform(scrollProgress, [start, end], [0.06, 0.85]);
  const y = useTransform(scrollProgress, [start, end], [12, 0]);

  return (
    <motion.span
      className="font-display text-[clamp(2rem,5vw,5.5rem)] font-semibold tracking-[-0.04em] leading-[1.05]"
      style={{ opacity, y }}
    >
      {word}
    </motion.span>
  );
}
