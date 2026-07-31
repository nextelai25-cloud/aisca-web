export default function Bs360Background() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#07070d',
      }}
    >
      <div className="bs360-blob bs360-blob-a" />
      <div className="bs360-blob bs360-blob-b" />
      <div className="bs360-blob bs360-blob-c" />
      <div className="bs360-grain" />

      <style>{`
        .bs360-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
        }
        .bs360-blob-a {
          width: 560px;
          height: 560px;
          top: -200px;
          left: -140px;
          background: radial-gradient(circle, rgba(56,189,248,0.32), transparent 70%);
          animation: bs360-drift-a 20s ease-in-out infinite alternate;
        }
        .bs360-blob-b {
          width: 480px;
          height: 480px;
          bottom: -200px;
          right: -120px;
          background: radial-gradient(circle, rgba(167,139,250,0.26), transparent 70%);
          animation: bs360-drift-b 24s ease-in-out infinite alternate;
        }
        .bs360-blob-c {
          width: 420px;
          height: 420px;
          top: 42%;
          left: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.12), transparent 70%);
          animation: bs360-drift-c 28s ease-in-out infinite alternate;
        }
        @keyframes bs360-drift-a {
          from { transform: translate(0, 0); }
          to { transform: translate(70px, 50px); }
        }
        @keyframes bs360-drift-b {
          from { transform: translate(0, 0); }
          to { transform: translate(-60px, -40px); }
        }
        @keyframes bs360-drift-c {
          from { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          to { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
        .bs360-grain {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 3px 3px;
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
}
