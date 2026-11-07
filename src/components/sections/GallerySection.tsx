'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { events, type Event } from '@/data/events'

// Events & Initiatives: a moving film strip of every event, a filterable
// bento grid that reveals itself on scroll, and a lightbox that grows out of
// the card you tap. Newest events come first (the order in data/events.ts).

const ease = [0.22, 1, 0.36, 1] as const
const INITIAL = 9

function CountUp({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, run])
  return <>{n}</>
}

export default function GallerySection() {
  const reduce = useReducedMotion()
  const [filter, setFilter] = useState('All')
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<Event | null>(null)
  const [photo, setPhoto] = useState(0)
  const [dir, setDir] = useState(1)
  const headRef = useRef<HTMLDivElement>(null)
  const headIn = useInView(headRef, { once: true, margin: '-80px' })

  const tags = useMemo(() => {
    const count = new Map<string, number>()
    events.forEach((e) => count.set(e.tag, (count.get(e.tag) || 0) + 1))
    return ['All', ...[...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)]
  }, [])
  const list = useMemo(() => (filter === 'All' ? events : events.filter((e) => e.tag === filter)), [filter])
  const shown = showAll || filter !== 'All' ? list : list.slice(0, INITIAL)
  const totalPhotos = useMemo(() => events.reduce((s, e) => s + e.photos.length, 0), [])
  const years = useMemo(() => new Set(events.map((e) => e.year)).size, [])
  const strip = useMemo(() => events.filter((e) => e.coverPhoto), [])

  const openEvent = (e: Event) => { setOpen(e); setPhoto(0); setDir(1) }
  const close = useCallback(() => setOpen(null), [])
  const go = useCallback((d: number) => {
    if (!open || open.photos.length < 2) return
    setDir(d)
    setPhoto((p) => (p + d + open.photos.length) % open.photos.length)
  }, [open])

  // Keyboard + scroll lock while the lightbox is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, close, go])

  const touch = useRef<number | null>(null)
  const title = 'Events & Initiatives'

  return (
    <section id="gallery" className="ev-root">
      {/* ── Header ── */}
      <div ref={headRef} className="ev-head">
        <motion.p className="ev-eyebrow" initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={headIn ? { opacity: 1, letterSpacing: '0.24em' } : {}} transition={{ duration: 1.1, ease }}>
          Our impact
        </motion.p>
        <h2 className="ev-title" aria-label={title}>
          {title.split(' ').map((w, i) => (
            <span key={i} className="ev-word-wrap">
              <motion.span className="ev-word" initial={{ y: '110%', opacity: 0, filter: 'blur(12px)' }}
                animate={headIn ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : {}} transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease }}>
                {w}
              </motion.span>
            </span>
          ))}
        </h2>
        <motion.p className="ev-sub" initial={{ opacity: 0, y: 12 }} animate={headIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.45, ease }}>
          Moments that define the islandwide commerce movement
        </motion.p>
        <motion.div className="ev-stats" initial={{ opacity: 0, y: 16 }} animate={headIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6, ease }}>
          <div><b><CountUp to={events.length} run={headIn} /></b><span>events</span></div>
          <i />
          <div><b><CountUp to={totalPhotos} run={headIn} /></b><span>moments captured</span></div>
          <i />
          <div><b><CountUp to={years} run={headIn} /></b><span>years running</span></div>
        </motion.div>
      </div>

      {/* ── Moving film strip ── */}
      <div className="ev-strip" aria-hidden>
        {[0, 1].map((row) => (
          <div key={row} className={`ev-strip-row ${row ? 'is-rev' : ''}`}>
            <div className="ev-strip-track">
              {[...strip, ...strip].map((e, i) => (
                <button key={`${row}-${i}`} tabIndex={-1} className="ev-strip-item" onClick={() => openEvent(e)}>
                  <img src={row ? e.photos[e.photos.length - 1] || e.coverPhoto : e.coverPhoto} alt="" loading="lazy" />
                  <span>{e.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="ev-filters" role="tablist" aria-label="Filter events">
        {tags.map((t) => (
          <button key={t} role="tab" aria-selected={filter === t} onClick={() => { setFilter(t); setShowAll(false) }} className={`ev-chip ${filter === t ? 'is-on' : ''}`}>
            {filter === t && <motion.span layoutId="ev-chip-bg" className="ev-chip-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="ev-chip-label">{t}</span>
          </button>
        ))}
      </div>

      {/* ── Bento grid ── */}
      <motion.div layout className="ev-grid">
        <AnimatePresence mode="popLayout">
          {shown.map((e, i) => (
            <Card key={e.id} e={e} i={i} big={filter === 'All' && i === 0} onOpen={() => openEvent(e)} reduce={!!reduce} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filter === 'All' && list.length > INITIAL && (
        <div className="ev-more-wrap">
          <button className="ev-more" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show fewer' : `View all ${list.length} events`}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {open && (
          <motion.div className="ev-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={close}>
            <motion.div className="ev-modal-inner" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ duration: 0.5, ease }}>
              <div className="ev-modal-photo"
                onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
                onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null }}>
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.img key={photo} src={open.photos[photo] || open.coverPhoto} alt={open.name} custom={dir}
                    initial={{ opacity: 0, x: dir * 60, scale: 1.04 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: dir * -60, scale: 0.98 }}
                    transition={{ duration: 0.45, ease }} />
                </AnimatePresence>
                <button className="ev-x" onClick={close} aria-label="Close">×</button>
                {open.photos.length > 1 && (
                  <>
                    <button className="ev-nav is-l" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
                    <button className="ev-nav is-r" onClick={() => go(1)} aria-label="Next photo">›</button>
                    <div className="ev-dots">{open.photos.map((_, k) => <span key={k} className={k === photo ? 'is-on' : ''} />)}</div>
                  </>
                )}
              </div>
              {open.photos.length > 1 && (
                <div className="ev-thumbs">
                  {open.photos.map((p, k) => (
                    <button key={k} onClick={() => { setDir(k > photo ? 1 : -1); setPhoto(k) }} className={k === photo ? 'is-on' : ''} aria-label={`Photo ${k + 1}`}>
                      <img src={p} alt="" />
                    </button>
                  ))}
                </div>
              )}
              <motion.div className="ev-modal-body" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25, ease }}>
                <div className="ev-modal-meta"><span className="ev-tag">{open.tag}</span><span>{open.date}</span></div>
                <h3>{open.name}</h3>
                {open.note && <div className="ev-note">{open.note}</div>}
                {open.description.split('\n\n').map((para, k) => <p key={k}>{para}</p>)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ev-root { position: relative; padding: 120px 0 110px; background: #080808; overflow: hidden; }
        .ev-root::before { content: ''; position: absolute; left: 50%; top: -220px; width: 900px; height: 520px; transform: translateX(-50%); background: radial-gradient(closest-side, rgba(255,255,255,0.07), transparent); pointer-events: none; }
        .ev-head { position: relative; text-align: center; padding: 0 24px; margin-bottom: 56px; }
        .ev-eyebrow { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin: 0 0 18px; }
        .ev-title { font-size: clamp(2.5rem, 6vw, 4.6rem); font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.02; margin: 0 0 16px; }
        .ev-word-wrap { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; margin: 0 .12em; }
        .ev-word { display: inline-block; background: linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.55)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .ev-sub { font-size: 16px; color: rgba(255,255,255,0.45); margin: 0; }
        .ev-stats { display: inline-flex; align-items: center; gap: 28px; margin-top: 34px; padding: 16px 30px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
        .ev-stats div { display: flex; flex-direction: column; align-items: center; }
        .ev-stats b { font-size: 26px; font-weight: 800; color: #fff; line-height: 1; font-variant-numeric: tabular-nums; }
        .ev-stats span { font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 6px; }
        .ev-stats i { width: 1px; height: 32px; background: rgba(255,255,255,0.1); }

        /* film strip */
        .ev-strip { position: relative; display: flex; flex-direction: column; gap: 14px; margin: 0 0 64px; transform: rotate(-2.2deg) scale(1.04);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
        .ev-strip-row { overflow: hidden; }
        .ev-strip-track { display: flex; gap: 14px; width: max-content; animation: ev-marquee 70s linear infinite; }
        .ev-strip-row.is-rev .ev-strip-track { animation-direction: reverse; animation-duration: 85s; }
        .ev-strip:hover .ev-strip-track { animation-play-state: paused; }
        .ev-strip-item { position: relative; width: 240px; aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); padding: 0; background: #111; cursor: pointer; flex-shrink: 0; filter: grayscale(.55) brightness(.75); transition: filter .5s ease, transform .5s cubic-bezier(.22,1,.36,1); }
        .ev-strip-item:hover { filter: none; transform: translateY(-4px) scale(1.03); }
        .ev-strip-item img { width: 100% !important; height: 100% !important; object-fit: cover; display: block; }
        .ev-strip-item span { position: absolute; left: 10px; right: 10px; bottom: 8px; font-size: 11px; font-weight: 600; color: #fff; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 8px rgba(0,0,0,.9); opacity: 0; transition: opacity .3s; }
        .ev-strip-item:hover span { opacity: 1; }
        @keyframes ev-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* filters */
        .ev-filters { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; max-width: 1000px; margin: 0 auto 34px; padding: 0 20px; }
        .ev-chip { position: relative; height: 38px; padding: 0 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.6); font-size: 12.5px; font-weight: 600; letter-spacing: .02em; cursor: pointer; transition: color .25s, border-color .25s; }
        .ev-chip:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
        .ev-chip.is-on { color: #000; border-color: #fff; }
        .ev-chip-bg { position: absolute; inset: 0; border-radius: 999px; background: #fff; }
        .ev-chip-label { position: relative; }

        /* grid */
        .ev-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 250px; grid-auto-flow: dense; gap: 18px; max-width: 1200px; margin: 0 auto; padding: 0 40px; }
        .ev-card { position: relative; border-radius: 20px; overflow: hidden; background: #111; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; isolation: isolate; }
        .ev-card.is-big { grid-column: span 2; grid-row: span 2; }
        .ev-card-img { position: absolute; inset: -6%; }
        .ev-card-img img { width: 100% !important; height: 100% !important; object-fit: cover; display: block; transform: scale(1.02); transition: transform 1.1s cubic-bezier(.22,1,.36,1), filter .6s ease; filter: saturate(.9) brightness(.92); }
        .ev-card:hover .ev-card-img img { transform: scale(1.1); filter: saturate(1.1) brightness(1); }
        .ev-card-shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 75%); transition: opacity .5s; }
        .ev-card-glow { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .4s; background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.16), transparent 45%); mix-blend-mode: soft-light; }
        .ev-card:hover .ev-card-glow { opacity: 1; }
        .ev-card::after { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none; background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.55), transparent 60%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity .4s; }
        .ev-card:hover::after { opacity: 1; }
        .ev-card-no { position: absolute; top: 16px; left: 18px; font-size: 12px; font-weight: 700; letter-spacing: .12em; color: rgba(255,255,255,0.6); font-variant-numeric: tabular-nums; }
        .ev-card-count { position: absolute; top: 14px; right: 14px; display: inline-flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.55); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; padding: 5px 10px; font-size: 11px; color: rgba(255,255,255,0.8); }
        .ev-card-info { position: absolute; left: 0; right: 0; bottom: 0; padding: 22px 22px 20px; transform: translateY(8px); transition: transform .5s cubic-bezier(.22,1,.36,1); }
        .ev-card:hover .ev-card-info { transform: translateY(0); }
        .ev-card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ev-tag { font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.25); padding: 4px 9px; border-radius: 999px; }
        .ev-card-meta > span:last-child { font-size: 11.5px; color: rgba(255,255,255,0.5); }
        .ev-card-name { font-size: 17px; font-weight: 700; color: #fff; margin: 0; line-height: 1.25; }
        .ev-card.is-big .ev-card-name { font-size: clamp(1.4rem, 2.4vw, 2.1rem); letter-spacing: -0.02em; }
        .ev-card-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; color: #fff; opacity: 0; transform: translateY(6px); transition: opacity .4s, transform .5s cubic-bezier(.22,1,.36,1); }
        .ev-card:hover .ev-card-cta { opacity: 1; transform: translateY(0); }
        .ev-card.is-big .ev-card-cta { opacity: 1; transform: none; }
        .ev-card-excerpt { margin: 10px 0 0; font-size: 13.5px; line-height: 1.6; color: rgba(255,255,255,0.6); max-width: 560px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .ev-more-wrap { display: flex; justify-content: center; margin-top: 40px; }
        .ev-more { display: inline-flex; align-items: center; gap: 10px; height: 50px; padding: 0 28px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); color: #fff; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: background .3s, border-color .3s; }
        .ev-more:hover { background: #fff; color: #000; border-color: #fff; }

        /* lightbox */
        .ev-modal { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.9); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); display: flex; align-items: flex-start; justify-content: center; padding: 24px 16px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .ev-modal-inner { width: 100%; max-width: 940px; margin: auto; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; }
        .ev-modal-photo { position: relative; height: min(62vh, 560px); background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .ev-modal-photo img { position: absolute; max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
        .ev-x { position: absolute; top: 14px; right: 14px; width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.6); color: #fff; font-size: 22px; cursor: pointer; z-index: 3; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
        .ev-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.55); color: #fff; font-size: 26px; cursor: pointer; z-index: 3; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); transition: background .2s; }
        .ev-nav:hover { background: rgba(255,255,255,0.18); }
        .ev-nav.is-l { left: 16px; } .ev-nav.is-r { right: 16px; }
        .ev-dots { position: absolute; bottom: 14px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 3; }
        .ev-dots span { width: 6px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.35); transition: width .35s, background .35s; }
        .ev-dots span.is-on { width: 22px; background: #fff; }
        .ev-thumbs { display: flex; gap: 8px; padding: 12px 20px; overflow-x: auto; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ev-thumbs button { width: 64px; height: 64px; flex-shrink: 0; border-radius: 10px; overflow: hidden; padding: 0; border: 2px solid transparent; background: none; cursor: pointer; opacity: .55; transition: opacity .2s, border-color .2s; }
        .ev-thumbs button.is-on { border-color: #fff; opacity: 1; }
        .ev-thumbs img { width: 100% !important; height: 100% !important; object-fit: cover; }
        .ev-modal-body { padding: 26px 26px 30px; }
        .ev-modal-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
        .ev-modal-body h3 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.02em; color: #fff; margin: 0 0 16px; line-height: 1.15; }
        .ev-note { display: inline-block; padding: 4px 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; font-size: 11px; color: rgba(255,255,255,0.55); letter-spacing: .08em; }
        .ev-modal-body p { font-size: 14.5px; color: rgba(255,255,255,0.6); line-height: 1.85; margin: 0 0 16px; }

        @media (max-width: 980px) {
          .ev-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 230px; padding: 0 24px; }
        }
        @media (max-width: 640px) {
          .ev-root { padding: 90px 0 80px; }
          .ev-stats { gap: 18px; padding: 14px 20px; }
          .ev-stats b { font-size: 22px; }
          .ev-stats span { font-size: 9.5px; letter-spacing: .1em; }
          .ev-strip { margin-bottom: 44px; }
          .ev-strip-item { width: 168px; border-radius: 12px; }
          .ev-filters { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; scrollbar-width: none; padding: 0 16px 4px; }
          .ev-filters::-webkit-scrollbar { display: none; }
          .ev-chip { flex-shrink: 0; }
          .ev-grid { grid-template-columns: 1fr; grid-auto-rows: auto; gap: 16px; padding: 0 16px; }
          .ev-card, .ev-card.is-big { grid-column: auto; grid-row: auto; display: flex; flex-direction: column; background: #0f0f0f; }
          .ev-card-img { position: relative; inset: auto; width: 100%; aspect-ratio: var(--ar, 4 / 3); max-height: 125vw; overflow: hidden; transform: none !important; }
          .ev-card-img img { transform: none; filter: none; }
          .ev-card:hover .ev-card-img img { transform: none; }
          .ev-card-shade { inset: 0 0 auto 0; height: 70px; background: linear-gradient(180deg, rgba(0,0,0,0.55), transparent); }
          .ev-card-info { position: relative; transform: none; padding: 16px 18px 18px; }
          .ev-card-name, .ev-card.is-big .ev-card-name { font-size: 18px; }
          .ev-card-cta { opacity: 1; transform: none; }
          .ev-modal { padding: 0; align-items: stretch; }
          .ev-modal-inner { border-radius: 0; min-height: 100%; border: none; }
          .ev-modal-photo { height: 52vh; }
        }
        @media (prefers-reduced-motion: reduce) { .ev-strip-track { animation: none; } }
      `}</style>
    </section>
  )
}

function Card({ e, i, big, onOpen, reduce }: { e: Event; i: number; big: boolean; onOpen: () => void; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [ar, setAr] = useState('4 / 3')
  const onMove = (ev: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${ev.clientX - r.left}px`)
    el.style.setProperty('--my', `${ev.clientY - r.top}px`)
    if (reduce) return
    const img = el.querySelector<HTMLElement>('.ev-card-img')
    if (img) img.style.transform = `translate(${((ev.clientX - r.left) / r.width - 0.5) * -14}px, ${((ev.clientY - r.top) / r.height - 0.5) * -14}px)`
  }
  const onLeave = () => {
    const img = ref.current?.querySelector<HTMLElement>('.ev-card-img')
    if (img) img.style.transform = ''
  }
  return (
    <motion.div
      ref={ref}
      layout
      className={`ev-card ${big ? 'is-big' : ''}`}
      style={{ ['--ar' as string]: ar } as React.CSSProperties}
      initial={{ opacity: 0, y: 40, clipPath: 'inset(18% 0% 0% 0% round 20px)' }}
      animate={inView ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 20px)' } : {}}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
      transition={{ duration: 0.85, delay: (i % 3) * 0.08, ease }}
      onClick={onOpen}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(k) => { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); onOpen() } }}
      aria-label={`${e.name}, ${e.date}`}
    >
      <div className="ev-card-img" style={{ transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        {e.coverPhoto
          ? <img src={e.coverPhoto} alt={e.name} loading={i < 3 ? 'eager' : 'lazy'} onLoad={(ev) => { const im = ev.currentTarget; if (im.naturalWidth && im.naturalHeight) setAr(`${im.naturalWidth} / ${im.naturalHeight}`) }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 800, color: 'rgba(255,255,255,0.06)' }}>AISCA</div>}
      </div>
      <div className="ev-card-shade" />
      <div className="ev-card-glow" />
      <span className="ev-card-no">{String(i + 1).padStart(2, '0')}</span>
      {e.photos.length > 1 && (
        <span className="ev-card-count">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m21 17-5-5-8 8" /></svg>
          {e.photos.length}
        </span>
      )}
      <div className="ev-card-info">
        <div className="ev-card-meta"><span className="ev-tag">{e.tag}</span><span>{e.date}</span></div>
        <p className="ev-card-name">{e.name}</p>
        {big && <p className="ev-card-excerpt">{e.description.split('\n\n')[0]}</p>}
        <span className="ev-card-cta">View story
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </span>
      </div>
    </motion.div>
  )
}
