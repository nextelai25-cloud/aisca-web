'use client';

import { allClassroomStorageKeys } from '@/lib/bs360-auth';

export default function LockButton() {
  return (
    <>
      <button
        onClick={() => {
          try {
            for (const k of allClassroomStorageKeys()) window.localStorage.removeItem(k);
          } catch {}
          window.location.reload();
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
        Lock all classrooms on this device
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
