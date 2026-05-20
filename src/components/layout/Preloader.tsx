'use client';

import { motion } from 'framer-motion';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center"
      animate={{ opacity: 0 }}
      transition={{ delay: 1.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onComplete}>

      <motion.div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <span className="text-black text-sm font-bold font-display">A</span>
      </motion.div>

      <motion.p className="text-[11px] text-[#555960] tracking-[0.15em] font-medium"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        AISCA
      </motion.p>

      <motion.div className="mt-5 w-24 h-[1.5px] bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div className="h-full bg-white/40 rounded-full"
          initial={{ width: 0 }} animate={{ width: '100%' }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
      </motion.div>
    </motion.div>
  );
}
