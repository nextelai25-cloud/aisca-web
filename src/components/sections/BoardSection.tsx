'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { boardTeams } from '@/lib/constants';

// Board of Officials: animated heading, a moving strip of every official,
// team tabs with a sliding highlight, and portrait cards that reveal on
// scroll, tilt toward the cursor and come into colour on hover.

const ease = [0.22, 1, 0.36, 1] as const;
type Member = { initials: string; name: string; role: string; photo?: string };

export default function BoardSection() {
  const [activeTab, setActiveTab] = useState('core');
  const headRef = useRef<HTMLDivElement>(null);
  const headIn = useInView(headRef, { once: true, margin: '-80px' });
  const reduce = !!useReducedMotion();

  const currentTeam = boardTeams.find((t) => t.id === activeTab) || boardTeams[0];
  const everyone = useMemo(() => boardTeams.flatMap((t) => t.members as Member[]).filter((m) => m.photo), []);
  const total = useMemo(() => boardTeams.reduce((s, t) => s + t.members.length, 0), []);
  const title = 'Executive Board';
  const members = currentTeam.members as Member[];

  return (
    <section id="board" className="bd-root">
      <div ref={headRef} className="bd-head">
        <motion.span className="bd-eyebrow" initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={headIn ? { opacity: 1, letterSpacing: '0.24em' } : {}} transition={{ duration: 1.1, ease }}>
          National Leadership
        </motion.span>
        <h2 className="bd-title" aria-label={title}>
          {title.split(' ').map((w, i) => (
            <span key={i} className="bd-word-wrap">
              <motion.span className="bd-word" initial={{ y: '110%', opacity: 0, filter: 'blur(12px)' }} animate={headIn ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : {}} transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease }}>
                {w}
              </motion.span>
            </span>
          ))}
        </h2>
        <motion.p className="bd-sub" initial={{ opacity: 0, y: 12 }} animate={headIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4, ease }}>
          The student leaders steering the future of commerce education across all provinces.
        </motion.p>
        <motion.div className="bd-stats" initial={{ opacity: 0, y: 14 }} animate={headIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.55, ease }}>
          <span><b>{total}</b> officials</span><i /><span><b>{boardTeams.length}</b> teams</span><i /><span><b>1</b> mission</span>
        </motion.div>
      </div>

      {/* Moving strip of every official */}
      <div className="bd-strip" aria-hidden>
        <div className="bd-strip-track">
          {[...everyone, ...everyone].map((m, i) => (
            <div key={i} className="bd-face"><img src={m.photo} alt="" loading="lazy" /></div>
          ))}
        </div>
      </div>

      {/* Team tabs */}
      <div className="bd-tabs" role="tablist" aria-label="Teams">
        {boardTeams.map((team) => (
          <button key={team.id} role="tab" aria-selected={activeTab === team.id} onClick={() => setActiveTab(team.id)} className={`bd-tab ${activeTab === team.id ? 'is-on' : ''}`}>
            {activeTab === team.id && <motion.span layoutId="bd-tab-bg" className="bd-tab-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="bd-tab-label">{team.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} className="bd-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }} transition={{ duration: 0.3 }}>
          <motion.div className="bd-team-head" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <span className="bd-team-name">{currentTeam.label}</span>
            <span className="bd-team-count">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
          </motion.div>

          {activeTab === 'core' ? (
            <>
              <div className="bd-grid bd-grid-lead">
                {members.slice(0, 2).map((m, i) => <Card key={m.name} m={m} i={i} lead reduce={reduce} />)}
              </div>
              <div className="bd-grid bd-grid-sec">
                {members.slice(2).map((m, i) => <Card key={m.name} m={m} i={i + 2} reduce={reduce} />)}
              </div>
            </>
          ) : (
            <div className={`bd-grid ${members.length <= 2 ? 'bd-grid-two' : members.length === 3 ? 'bd-grid-three' : ''}`}>
              {members.map((m, i) => <Card key={m.name} m={m} i={i} reduce={reduce} />)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .bd-root { position: relative; padding: 140px 0 70px; background: #0b0b0b; border-top: 1px solid rgba(255,255,255,0.04); overflow: hidden; }
        .bd-root::before { content: ''; position: absolute; left: 50%; top: -240px; width: 1000px; height: 560px; transform: translateX(-50%); background: radial-gradient(closest-side, rgba(255,255,255,0.06), transparent); pointer-events: none; }
        .bd-head { position: relative; text-align: center; padding: 0 24px; margin-bottom: 52px; }
        .bd-eyebrow { display: block; font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 18px; }
        .bd-title { font-size: clamp(2.5rem, 6vw, 4.6rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; margin: 0 0 16px; }
        .bd-word-wrap { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; margin: 0 .12em; }
        .bd-word { display: inline-block; background: linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.55)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .bd-sub { font-size: 16px; color: rgba(255,255,255,0.45); max-width: 560px; margin: 0 auto; line-height: 1.6; }
        .bd-stats { display: inline-flex; align-items: center; gap: 22px; margin-top: 30px; padding: 12px 26px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,0.45); }
        .bd-stats b { color: #fff; font-size: 15px; letter-spacing: 0; margin-right: 4px; }
        .bd-stats i { width: 1px; height: 18px; background: rgba(255,255,255,0.12); }

        .bd-strip { position: relative; margin: 0 0 56px; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); }
        .bd-strip-track { display: flex; gap: 12px; width: max-content; animation: bd-marquee 60s linear infinite; }
        .bd-face { width: 86px; height: 112px; border-radius: 14px; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.08); filter: grayscale(1) brightness(.6); transition: filter .5s; }
        .bd-strip:hover .bd-strip-track { animation-play-state: paused; }
        .bd-face:hover { filter: none; }
        .bd-face img { width: 100% !important; height: 100% !important; object-fit: cover; object-position: center top; display: block; }
        @keyframes bd-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .bd-tabs { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 960px; margin: 0 auto 40px; padding: 0 20px; }
        .bd-tab { position: relative; height: 38px; padding: 0 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.55); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: color .25s, border-color .25s; }
        .bd-tab:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
        .bd-tab.is-on { color: #000; border-color: #fff; }
        .bd-tab-bg { position: absolute; inset: 0; border-radius: 999px; background: #fff; }
        .bd-tab-label { position: relative; }

        .bd-panel { max-width: 1000px; margin: 0 auto; padding: 0 32px; }
        .bd-team-head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; margin-bottom: 26px; }
        .bd-team-name { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
        .bd-team-count { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,0.4); }

        .bd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; perspective: 1200px; }
        .bd-grid-lead { grid-template-columns: repeat(2, minmax(0, 300px)); justify-content: center; gap: 22px; margin-bottom: 22px; }
        .bd-grid-sec { grid-template-columns: repeat(2, minmax(0, 240px)); justify-content: center; }
        .bd-grid-two { grid-template-columns: repeat(2, minmax(0, 260px)); justify-content: center; }
        .bd-grid-three { grid-template-columns: repeat(3, minmax(0, 260px)); justify-content: center; }

        .bd-card { position: relative; border-radius: 22px; overflow: hidden; background: #141414; border: 1px solid rgba(255,255,255,0.08); aspect-ratio: 3 / 4; transform-style: preserve-3d; transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s; will-change: transform; }
        .bd-card:hover { box-shadow: 0 30px 60px -25px rgba(0,0,0,.9); }
        .bd-card img { position: absolute; inset: 0; width: 100% !important; height: 100% !important; object-fit: cover; object-position: center top; display: block; filter: grayscale(.85) contrast(1.05); transform: scale(1.02); transition: filter .7s ease, transform 1s cubic-bezier(.22,1,.36,1); }
        .bd-card:hover img, .bd-card.is-lead img { filter: none; }
        .bd-card:hover img { transform: scale(1.07); }
        .bd-card-init { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.4rem; font-weight: 300; color: rgba(255,255,255,0.2); background: linear-gradient(160deg, #1c1c1c, #0f0f0f); }
        .bd-card-shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 32%, transparent 58%); }
        .bd-card::after { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none; background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.6), transparent 60%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity .4s; }
        .bd-card:hover::after { opacity: 1; }
        .bd-card-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 18px 18px; transform: translateZ(30px); }
        .bd-card-name { font-size: 15.5px; font-weight: 700; color: #fff; margin: 0 0 6px; line-height: 1.25; }
        .bd-card.is-lead .bd-card-name { font-size: 20px; }
        .bd-card-role { display: inline-block; font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.22); padding: 4px 9px; border-radius: 999px; background: rgba(0,0,0,0.25); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
        .bd-card-line { position: absolute; left: 18px; right: 18px; top: 16px; display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; letter-spacing: .14em; color: rgba(255,255,255,0.55); }

        @media (max-width: 860px) {
          .bd-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .bd-root { padding: 100px 0 50px; }
          .bd-stats { gap: 14px; padding: 10px 18px; font-size: 9.5px; }
          .bd-face { width: 64px; height: 84px; border-radius: 12px; }
          .bd-strip { margin-bottom: 40px; }
          .bd-tabs { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; scrollbar-width: none; padding: 0 16px 4px; margin-bottom: 28px; }
          .bd-tabs::-webkit-scrollbar { display: none; }
          .bd-tab { flex-shrink: 0; }
          .bd-panel { padding: 0 16px; }
          .bd-team-name { font-size: 18px; }
          .bd-grid, .bd-grid-sec, .bd-grid-two, .bd-grid-three { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .bd-grid-lead { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
          .bd-card { border-radius: 18px; }
          .bd-card img { filter: none; }
          .bd-card-info { padding: 12px; }
          .bd-card-name, .bd-card.is-lead .bd-card-name { font-size: 13.5px; margin-bottom: 5px; }
          .bd-card-role { font-size: 8.5px; letter-spacing: .12em; padding: 0; border: none; background: none; -webkit-backdrop-filter: none; backdrop-filter: none; color: rgba(255,255,255,0.7); line-height: 1.4; }
          .bd-card-line { left: 12px; right: 12px; top: 12px; font-size: 10px; }
        }
        @media (prefers-reduced-motion: reduce) { .bd-strip-track { animation: none; } }
      `}</style>
    </section>
  );
}

function Card({ m, i, lead, reduce }: { m: Member; i: number; lead?: boolean; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    if (!reduce) el.style.transform = `rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateZ(0)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)', clipPath: 'inset(20% 0% 0% 0% round 22px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0% round 22px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease }}
      style={{ perspective: 1000 }}
    >
      <div ref={ref} className={`bd-card ${lead ? 'is-lead' : ''}`} onMouseMove={onMove} onMouseLeave={onLeave}>
        {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" /> : <div className="bd-card-init">{m.initials}</div>}
        <div className="bd-card-shade" />
        <div className="bd-card-line"><span>{String(i + 1).padStart(2, '0')}</span></div>
        <div className="bd-card-info">
          <p className="bd-card-name">{m.name}</p>
          <span className="bd-card-role">{m.role}</span>
        </div>
      </div>
    </motion.div>
  );
}
