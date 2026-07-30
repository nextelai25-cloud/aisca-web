'use client';

import { BS360_STORAGE_KEY } from '@/lib/bs360-auth';

export default function LockButton() {
  return (
    <button
      onClick={() => {
        try {
          window.localStorage.removeItem(BS360_STORAGE_KEY);
        } catch {}
        window.location.href = '/bs360quizgrid';
      }}
      className="text-white/30 hover:text-white/60 transition-colors"
      style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
    >
      Lock this device
    </button>
  );
}
