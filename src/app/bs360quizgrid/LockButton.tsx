'use client';

import { BS360_STORAGE_KEY } from '@/lib/bs360-auth';

export default function LockButton() {
  return (
    <>
      <button
        onClick={() => {
          try {
            window.localStorage.removeItem(BS360_STORAGE_KEY);
          } catch {}
          window.location.href = '/bs360quizgrid';
        }}
        className="bs360-lock-btn"
        style={{
          fontSize: 12,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer',
        }}
      >
        Lock this device
      </button>
      <style jsx>{`
        .bs360-lock-btn {
          transition: color 0.25s;
        }
        .bs360-lock-btn:hover {
          color: #7dd3fc;
        }
      `}</style>
    </>
  );
}
