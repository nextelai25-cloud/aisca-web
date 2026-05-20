'use client';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleComplete = () => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 800);
    };

    if (document.readyState === 'complete') {
      // Page already loaded
      setTimeout(handleComplete, 2000); // show preloader for 2s minimum
    } else {
      window.addEventListener('load', handleComplete);
      // Safety fallback - never get stuck
      const fallback = setTimeout(handleComplete, 5000);
      return () => {
        window.removeEventListener('load', handleComplete);
        clearTimeout(fallback);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.8s ease',
      pointerEvents: fadeOut ? 'none' : 'all'
    }}>
      {/* Logo — pulses gently */}
      <img
        src="/aisca-original.png"
        alt="AISCA"
        style={{
          width: '220px',
          maxWidth: '60vw',
          objectFit: 'contain',
          animation: 'aisca-pulse 1.5s ease-in-out infinite',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.6s ease'
        }}
      />

      {/* Loading bar underneath */}
      <div style={{
        marginTop: '48px',
        width: '120px',
        height: '1px',
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '1px',
        overflow: 'hidden',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease'
      }}>
        <div style={{
          height: '100%',
          background: '#ffffff',
          borderRadius: '1px',
          animation: 'aisca-load 2s ease forwards'
        }} />
      </div>
    </div>
  );
}
