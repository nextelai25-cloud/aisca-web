'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid, ZoomIn, ZoomOut, Maximize2, Minimize2, X } from 'lucide-react'

/* ────────────────────────────────────────────────────────────
   NEXTUP 01 e-magazine reader
   Desktop / landscape: two page spreads (cover on its own, then
   2|3, 4|5 ... so every founder photo sits beside their story).
   Phone / portrait: one page at a time.
   Pages turn with a 3D flip that follows your finger or mouse.
   ──────────────────────────────────────────────────────────── */

const RED = '#e11d2a'
const DISPLAY = "'Anton', system-ui, sans-serif"
const BODY = "'Inter', system-ui, -apple-system, sans-serif"

const TOTAL = 60
const ASPECT = 1060 / 1500 // page width / height
const pad = (n: number) => String(n).padStart(2, '0')
const pageSrc = (n: number) => `/nextup01/pages/${pad(n)}.webp`
const thumbSrc = (n: number) => `/nextup01/thumbs/${pad(n)}.webp`

type Mode = 'double' | 'single'
type View = [number, number] // [left, right], 0 = no page
type Flip = { dir: 'next' | 'prev'; to: number; peek?: boolean }

const FOUNDERS: { n: string; name: string; page: number }[] = [
  { n: '01', name: 'Kaveesha Fonseka', page: 18 },
  { n: '02', name: 'Helani Adhikari', page: 21 },
  { n: '03', name: 'Jayani Kaushalya', page: 24 },
  { n: '04', name: 'Himansa Kavindi', page: 27 },
  { n: '05', name: 'Vishwa Kahawala', page: 30 },
  { n: '06', name: 'Ranuth Thewmitha', page: 33 },
  { n: '07', name: 'Shawodh Alahakoon', page: 36 },
  { n: '08', name: 'KR Thuduwage', page: 39 },
  { n: '09', name: 'Samithu Jasinarachchi', page: 42 },
  { n: '10', name: 'Bumitha Wanniarachchi', page: 45 },
  { n: '11', name: 'Pemitha Weerasinghe', page: 46 },
  { n: '12', name: 'Chatula Ewan', page: 51 },
  { n: '13', name: 'Idusha Ravindi', page: 52 },
]

const SECTIONS: { label: string; page: number }[] = [
  { label: 'Cover', page: 1 },
  { label: 'In this issue', page: 3 },
  { label: "Chairman's note", page: 6 },
  { label: 'Business Advisor Junior', page: 8 },
  { label: 'How NEXTUP happened', page: 14 },
  { label: 'Makers', page: 17 },
  { label: 'Builders', page: 29 },
  { label: 'Creators', page: 41 },
  { label: 'Changemakers', page: 49 },
  { label: 'Are you NEXTUP 02?', page: 58 },
]

/* ── Phone (one page) reading order ──
   In print, some founders have their story on the left and photo on the right.
   On a phone that puts two photos back to back (Chatula 51, Idusha 52), so on
   phones every person's photo comes first and their story right after. */
type Person = { tag: string; name: string; photo: number; story: number }
const PEOPLE: Person[] = [
  { tag: "Chairman's note", name: 'Isira Chirayu', photo: 6, story: 7 },
  { tag: 'Business Advisor Junior', name: 'Viraj Henegedera', photo: 9, story: 8 },
  ...FOUNDERS.map(f => {
    // the story is the other page of the printed spread
    const mate = f.page % 2 === 0 ? f.page + 1 : f.page - 1
    return { tag: `Founder ${f.n}`, name: f.name, photo: f.page, story: mate }
  }),
]
const PERSON_OF: Record<number, { person: Person; kind: 'photo' | 'story' }> = {}
PEOPLE.forEach(p => { PERSON_OF[p.photo] = { person: p, kind: 'photo' }; PERSON_OF[p.story] = { person: p, kind: 'story' } })

const PHONE_ORDER: number[] = (() => {
  const order = Array.from({ length: TOTAL }, (_, i) => i + 1)
  PEOPLE.forEach(p => {
    const a = order.indexOf(p.photo), b = order.indexOf(p.story)
    if (a > b) { order[a] = p.story; order[b] = p.photo }
  })
  return order
})()

function buildViews(mode: Mode): View[] {
  if (mode === 'single') return PHONE_ORDER.map(p => [p, 0] as View)
  const v: View[] = [[0, 1]]
  for (let p = 2; p < TOTAL; p += 2) v.push([p, p + 1 <= TOTAL ? p + 1 : 0])
  if (TOTAL % 2 === 0) v.push([TOTAL, 0])
  return v
}
function viewOfPage(mode: Mode, page: number): number {
  return mode === 'single' ? Math.max(0, PHONE_ORDER.indexOf(page)) : Math.floor(page / 2)
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export default function MagazineReader() {
  /* ── layout ── */
  const shellRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const tagRowRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ w: 0, h: 0, vh: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      // On phones the reader is sized from the screen height so the book,
      // the controls and the header all fit on one screen with no empty gaps.
      const top = shellRef.current ? shellRef.current.getBoundingClientRect().top + window.scrollY : 0
      const controls = (controlsRef.current ? controlsRef.current.offsetHeight : 90) + (tagRowRef.current ? tagRowRef.current.offsetHeight : 0)
      setIsTouch(window.matchMedia('(hover: none)').matches)
      setStage({ w: el.clientWidth, h: el.clientHeight, vh: Math.max(320, window.innerHeight - top - controls) })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    const first = requestAnimationFrame(measure)
    return () => { cancelAnimationFrame(first); ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  const narrow = stage.w < 720
  const sideGutter = narrow ? 14 : 84
  const availW = Math.max(0, stage.w - sideGutter * 2)
  const availH = Math.max(0, narrow ? stage.vh - 20 : stage.h - 24)
  const doubleH = Math.min(availH, availW / (2 * ASPECT))
  const singleH = Math.min(availH, availW / ASPECT)
  const mode: Mode = stage.w >= 680 && doubleH >= singleH * 0.62 ? 'double' : 'single'
  const pageH = Math.floor(mode === 'double' ? doubleH : singleH)
  const pageW = Math.floor(pageH * ASPECT)

  const views = useMemo(() => buildViews(mode), [mode])

  /* ── position (stored as a page so switching modes keeps your place) ── */
  const [page, setPage] = useState(1)
  const vi = Math.min(viewOfPage(mode, page), views.length - 1)
  const view = views[vi]

  const [flip, setFlip] = useState<Flip | null>(null)
  const flipRef = useRef<Flip | null>(null)
  useLayoutEffect(() => { flipRef.current = flip }, [flip])
  const peekTimer = useRef<number | null>(null)
  const prog = useRef(0)
  const raf = useRef<number | null>(null)
  const animating = useRef(false)
  const [interacted, setInteracted] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)

  /* element refs written to directly during animation (smooth 60fps) */
  const bookRef = useRef<HTMLDivElement>(null)
  const leafRef = useRef<HTMLDivElement>(null)
  const frontShade = useRef<HTMLDivElement>(null)
  const backShade = useRef<HTMLDivElement>(null)
  const sheen = useRef<HTMLDivElement>(null)
  const revealShade = useRef<HTMLDivElement>(null)
  const landShade = useRef<HTMLDivElement>(null)

  const offsetFor = useCallback((v: View) => {
    if (mode !== 'double') return 0
    if (v[0] === 0) return -pageW / 2 // cover alone: centre it
    if (v[1] === 0) return pageW / 2 // back cover alone
    return 0
  }, [mode, pageW])

  const apply = useCallback((p: number) => {
    prog.current = p
    const book = bookRef.current
    if (book) {
      const from = offsetFor(views[vi])
      const to = flip ? offsetFor(views[flip.to]) : from
      book.style.transform = `translateX(${from + (to - from) * p}px)`
    }
    if (!flip) return
    const s = Math.sin(p * Math.PI)
    let rot = 0
    if (mode === 'double') rot = flip.dir === 'next' ? -180 * p : 180 * p
    else rot = flip.dir === 'next' ? -180 * p : -180 * (1 - p)
    if (leafRef.current) leafRef.current.style.transform = `rotateY(${rot}deg)`
    const q = mode === 'single' && flip.dir === 'prev' ? 1 - p : p
    if (frontShade.current) frontShade.current.style.opacity = String(Math.min(0.75, q * 0.9))
    if (backShade.current) backShade.current.style.opacity = String(Math.min(0.75, (1 - q) * 0.9))
    if (sheen.current) sheen.current.style.opacity = String(s * 0.9)
    if (revealShade.current) revealShade.current.style.opacity = String((mode === 'single' && flip.dir === 'prev' ? p : 1 - p) * 0.7)
    if (landShade.current) landShade.current.style.opacity = String(s * 0.45)
  }, [flip, mode, offsetFor, vi, views])

  // keep DOM in sync after React renders a new flip / view / size
  useLayoutEffect(() => {
    if (bookRef.current) bookRef.current.style.transition = flip ? 'none' : 'transform .55s cubic-bezier(.22,1,.36,1)'
    apply(prog.current)
  }, [apply, flip, pageW])

  const stopAnim = () => {
    if (peekTimer.current) { clearTimeout(peekTimer.current); peekTimer.current = null }
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = null
    animating.current = false
  }

  const applyRef = useRef(apply)
  useLayoutEffect(() => { applyRef.current = apply }, [apply])

  const tween = useCallback((target: number, ms: number, ease: (t: number) => number, done: () => void) => {
    stopAnim()
    animating.current = true
    const start = performance.now()
    const from = prog.current
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      applyRef.current(from + (target - from) * ease(t))
      if (t < 1) raf.current = requestAnimationFrame(step)
      else { raf.current = null; animating.current = false; done() }
    }
    raf.current = requestAnimationFrame(step)
  }, [])

  /* finish: commit the new view */
  const commit = useCallback((f: Flip) => {
    const first = views[f.to][0] || views[f.to][1]
    prog.current = 0
    setFlip(null)
    setPage(first)
  }, [views])

  const canNext = vi < views.length - 1
  const canPrev = vi > 0

  // a pending "turn" request that needs the flip state rendered first
  const pending = useRef<null | { dir: 'next' | 'prev' }>(null)

  const turn = useCallback((dir: 'next' | 'prev') => {
    setInteracted(true)
    if (animating.current && !(flip?.peek)) return
    if (dir === 'next' ? !canNext : !canPrev) return
    if (flip?.peek) {
      stopAnim()
      if (flip.dir !== dir) { prog.current = 0; setFlip(null); pending.current = { dir }; return }
      setFlip({ dir, to: flip.to })
      pending.current = { dir }
      return
    }
    prog.current = 0
    setFlip({ dir, to: dir === 'next' ? vi + 1 : vi - 1 })
    pending.current = { dir }
  }, [canNext, canPrev, flip, vi])

  // run the turn animation once the flip layer exists in the DOM
  useEffect(() => {
    if (!pending.current) return
    if (!flip) {
      const d = pending.current.dir
      pending.current = null
      turn(d)
      return
    }
    if (flip.peek) return
    pending.current = null
    const f = flip
    const remaining = 1 - prog.current
    tween(1, Math.max(260, (mode === 'double' ? 900 : 700) * remaining), prog.current > 0.05 ? easeOut : easeInOut, () => commit(f))
  }, [flip, tween, commit, mode, turn])

  const jumpTo = useCallback((p: number, fade = true) => {
    setInteracted(true)
    stopAnim()
    prog.current = 0
    setFlip(null)
    setPage(Math.max(1, Math.min(TOTAL, p)))
    if (fade) setFadeKey(k => k + 1)
  }, [])

  /* ── idle hint: the page corner lifts a little to show it can be turned ── */
  const drag = useRef<null | { x: number; y: number; t: number; dir: 'next' | 'prev' | null; id: number; rect: DOMRect }>(null)
  const peeks = useRef(0)
  useEffect(() => {
    if (interacted || !stage.w || flip || peeks.current >= 3) return
    const id = window.setTimeout(() => {
      if (animating.current || flipRef.current || drag.current) return
      if (vi >= views.length - 1) return
      peeks.current += 1
      prog.current = 0
      setFlip({ dir: 'next', to: vi + 1, peek: true })
    }, peeks.current === 0 ? 1600 : 2600)
    return () => clearTimeout(id)
  }, [interacted, stage.w, vi, views.length, flip])

  useEffect(() => {
    if (!flip?.peek) return
    const f = flip
    const lift = mode === 'double' ? 0.13 : 0.16
    tween(lift, 650, easeInOut, () => {
      peekTimer.current = window.setTimeout(() => {
        peekTimer.current = null
        if (flipRef.current !== f) return
        tween(0, 600, easeInOut, () => { if (flipRef.current === f) setFlip(null) })
      }, 420)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flip])

  /* ── drag / swipe / tap ── */

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (animating.current && !flip?.peek) return
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), dir: null, id: e.pointerId, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.dir) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return
      const dir = dx < 0 ? 'next' : 'prev'
      if (dir === 'next' ? !canNext : !canPrev) return
      setInteracted(true)
      stopAnim()
      d.dir = dir
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      if (!flip || flip.dir !== dir) { prog.current = 0; setFlip({ dir, to: dir === 'next' ? vi + 1 : vi - 1 }) }
      else setFlip({ dir, to: flip.to })
      return
    }
    const span = mode === 'double' ? pageW * 1.5 : pageW * 1.1
    const p = Math.max(0, Math.min(1, (d.dir === 'next' ? -dx : dx) / span))
    apply(p)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.dir) {
      // a tap / click: left side goes back, right side goes forward
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        const rel = (e.clientX - d.rect.left) / d.rect.width
        turn(rel < 0.5 ? 'prev' : 'next')
      }
      return
    }
    const f = flip
    if (!f) return
    const v = dx / Math.max(1, performance.now() - d.t)
    const fast = d.dir === 'next' ? v < -0.45 : v > 0.45
    if (prog.current > 0.32 || fast) {
      tween(1, Math.max(220, 650 * (1 - prog.current)), easeOut, () => commit(f))
    } else {
      tween(0, 380, easeOut, () => setFlip(null))
    }
  }

  const onPointerCancel = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || d.id !== e.pointerId || !d.dir) return
    if (flipRef.current) tween(0, 320, easeOut, () => setFlip(null))
  }

  /* ── keyboard ── */
  const [grid, setGrid] = useState(false)
  const [zoom, setZoom] = useState<null | number>(null)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (zoom !== null || grid) { if (e.key === 'Escape') { setZoom(null); setGrid(false) } return }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); turn('next') }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn('prev') }
      else if (e.key === 'Home') jumpTo(1)
      else if (e.key === 'End') jumpTo(TOTAL)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [turn, jumpTo, zoom, grid])

  /* ── preload the pages around you ── */
  useEffect(() => {
    const want = new Set<number>()
    for (let i = vi - 2; i <= vi + 3; i++) if (views[i]) views[i].forEach(p => p && want.add(p))
    want.forEach(p => { const im = new Image(); im.decoding = 'async'; im.src = pageSrc(p) })
  }, [vi, views])

  /* ── fullscreen ── */
  const [fsOk, setFsOk] = useState(false)
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setFsOk(!!document.documentElement.requestFullscreen))
    const h = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => { cancelAnimationFrame(id); document.removeEventListener('fullscreenchange', h) }
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else shellRef.current?.requestFullscreen?.().catch(() => {})
  }

  /* ── what to draw ── */
  const target = flip ? views[flip.to] : null
  let staticL = view[0], staticR = view[1], leafFront = 0, leafBack = 0
  if (flip && target) {
    if (mode === 'double') {
      if (flip.dir === 'next') { staticL = view[0]; staticR = target[1]; leafFront = view[1]; leafBack = target[0] }
      else { staticL = target[0]; staticR = view[1]; leafFront = view[0]; leafBack = target[1] }
    } else {
      if (flip.dir === 'next') { staticL = target[0]; leafFront = view[0] }
      else { staticL = view[0]; leafFront = target[0] }
    }
  }

  const who = mode === 'single' ? PERSON_OF[view[0]] : undefined
  const label = (() => {
    const shown = view.filter(Boolean)
    if (who) return who.person.tag.startsWith('Founder') ? who.person.tag : who.person.name.split(' ')[0]
    if (shown.length === 1 && shown[0] === 1) return 'Cover'
    if (shown.length === 1 && shown[0] === TOTAL) return 'Back cover'
    return shown.map(pad).join(' · ')
  })()

  const progressPct = views.length > 1 ? (vi / (views.length - 1)) * 100 : 0
  const edgeL = mode === 'double' ? Math.round(Math.min(7, (vi / (views.length - 1)) * 7)) : 0
  const edgeR = mode === 'double' ? Math.round(Math.min(7, ((views.length - 1 - vi) / (views.length - 1)) * 7)) : 0

  const bookW = mode === 'double' ? pageW * 2 : pageW
  const showHint = !interacted && stage.w > 0

  return (
    <div ref={shellRef} className="mz-shell">
      {/* ── reader ── */}
      {/* phones: who you are reading, so photo and story always read as a pair */}
      {mode === 'single' && stage.w > 0 && (
        <div ref={tagRowRef} className="mz-tagrow">
          {who && (
            <div key={who.person.photo} className="mz-tag">
              <span className="mz-tag-k">{who.person.tag}</span>
              <span className="mz-tag-n">{who.person.name}</span>
              <span className="mz-tag-dots" aria-label={who.kind === 'photo' ? 'Photo, story next' : 'Story'}>
                <i className={who.kind === 'photo' ? 'on' : ''} />
                <i className={who.kind === 'story' ? 'on' : ''} />
              </span>
            </div>
          )}
        </div>
      )}

      <div ref={stageRef} className="mz-stage" style={narrow && pageH > 0 ? { flex: 'none', height: pageH + 20 } : undefined}>
        {pageW > 0 && (
          <div
            className="mz-book-wrap"
            style={{ width: bookW, height: pageH, perspective: mode === 'double' ? pageW * 4.2 : pageW * 3.2 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            <div ref={bookRef} key={fadeKey} className="mz-book mz-fade" style={{ width: bookW, height: pageH }}>
              {/* page edges, thicker on the side you have read */}
              {edgeL > 0 && view[0] !== 0 && <div className="mz-edge mz-edge-l" style={{ width: edgeL, left: -edgeL }} />}
              {edgeR > 0 && (view[1] !== 0 || flip) && <div className="mz-edge mz-edge-r" style={{ width: edgeR, right: -edgeR }} />}

              {mode === 'double' ? (
                <>
                  <Slot side="left" page={staticL} w={pageW} h={pageH}>
                    {flip && flip.dir === 'prev' && <div ref={revealShade} className="mz-shade mz-shade-fromR" />}
                    {flip && flip.dir === 'next' && <div ref={landShade} className="mz-shade mz-shade-fromR" />}
                  </Slot>
                  <Slot side="right" page={staticR} w={pageW} h={pageH}>
                    {flip && flip.dir === 'next' && <div ref={revealShade} className="mz-shade mz-shade-fromL" />}
                    {flip && flip.dir === 'prev' && <div ref={landShade} className="mz-shade mz-shade-fromL" />}
                  </Slot>
                  {flip && (
                    <div
                      ref={leafRef}
                      className="mz-leaf"
                      style={{
                        width: pageW, height: pageH,
                        left: flip.dir === 'next' ? pageW : 0,
                        transformOrigin: flip.dir === 'next' ? 'left center' : 'right center',
                      }}
                    >
                      <Face page={leafFront} side={flip.dir === 'next' ? 'right' : 'left'}>
                        <div ref={frontShade} className={`mz-shade ${flip.dir === 'next' ? 'mz-shade-fromL' : 'mz-shade-fromR'}`} />
                        <div ref={sheen} className={`mz-sheen ${flip.dir === 'next' ? 'mz-sheen-r' : 'mz-sheen-l'}`} />
                      </Face>
                      <Face page={leafBack} back side={flip.dir === 'next' ? 'left' : 'right'}>
                        <div ref={backShade} className={`mz-shade ${flip.dir === 'next' ? 'mz-shade-fromR' : 'mz-shade-fromL'}`} />
                      </Face>
                    </div>
                  )}
                  {!flip && view[0] !== 0 && view[1] !== 0 && <div className="mz-spine" style={{ left: pageW - 30 }} />}
                </>
              ) : (
                <>
                  <Slot side="single" page={staticL} w={pageW} h={pageH}>
                    {flip && <div ref={revealShade} className="mz-shade mz-shade-fromL" />}
                  </Slot>
                  {flip && (
                    <div ref={leafRef} className="mz-leaf" style={{ width: pageW, height: pageH, left: 0, transformOrigin: 'left center' }}>
                      <Face page={leafFront} side="single">
                        <div ref={frontShade} className="mz-shade mz-shade-fromL" />
                        <div ref={sheen} className="mz-sheen mz-sheen-r" />
                      </Face>
                      <Face page={0} back side="single" paper>
                        <div ref={backShade} className="mz-shade mz-shade-fromR" />
                      </Face>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* first visit hint */}
            {showHint && (
              <div className="mz-hint" aria-hidden>
                <span className="mz-hint-hand">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v1" /><path d="M14 10V4a2 2 0 0 0-4 0v2" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
                </span>
                <span>{isTouch ? 'Swipe to turn the page' : 'Click or drag the page to turn'}</span>
                <span className="mz-hint-arrows"><i /><i /><i /></span>
              </div>
            )}
          </div>
        )}

        {/* side arrows */}
        <button className={`mz-arrow mz-arrow-l ${narrow ? 'mz-arrow-sm' : ''}`} onClick={() => turn('prev')} disabled={!canPrev} aria-label="Previous page">
          <ChevronLeft size={narrow ? 20 : 26} />
        </button>
        <button className={`mz-arrow mz-arrow-r ${narrow ? 'mz-arrow-sm' : ''} ${showHint ? 'mz-arrow-pulse' : ''}`} onClick={() => turn('next')} disabled={!canNext} aria-label="Next page">
          <ChevronRight size={narrow ? 20 : 26} />
        </button>
      </div>

      {/* ── controls ── */}
      <div ref={controlsRef} className="mz-controls">
        <div className="mz-progress">
          <input
            type="range" min={0} max={views.length - 1} value={vi}
            onChange={e => { const v = views[Number(e.target.value)]; jumpTo(v[0] || v[1], false) }}
            aria-label="Page"
            style={{ background: `linear-gradient(90deg, ${RED} ${progressPct}%, rgba(255,255,255,0.14) ${progressPct}%)` }}
          />
        </div>
        <div className="mz-bar">
          <button className="mz-tool" onClick={() => setGrid(true)} aria-label="All pages">
            <LayoutGrid size={16} /><span className="mz-tool-label">All pages</span>
          </button>
          <div className="mz-count">
            <span className="mz-count-now">{label}</span>
            <span className="mz-count-of">{who ? (who.kind === 'photo' ? '· photo' : '· story') : `/ ${pad(TOTAL)}`}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="mz-tool" onClick={() => setZoom(narrow ? 2 : 1)} aria-label="Zoom in to read">
              <ZoomIn size={16} /><span className="mz-tool-label">Zoom</span>
            </button>
            {fsOk && (
              <button className="mz-tool" onClick={toggleFs} aria-label="Full screen">
                {isFs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── all pages overlay ── */}
      {grid && (
        <div className="mz-overlay" onClick={() => setGrid(false)}>
          <div className="mz-panel" onClick={e => e.stopPropagation()}>
            <div className="mz-panel-head">
              <div>
                <span className="mz-eyebrow">NEXTUP 01 · The Young Founders Edition</span>
                <h3 className="mz-panel-title">Jump to a page</h3>
              </div>
              <button className="mz-close" onClick={() => setGrid(false)} aria-label="Close"><X size={18} /></button>
            </div>

            <p className="mz-sub">The founders</p>
            <div className="mz-chips">
              {FOUNDERS.map(f => (
                <button key={f.n} className="mz-chip" onClick={() => { jumpTo(f.page); setGrid(false) }}>
                  <b>{f.n}</b>{f.name}
                </button>
              ))}
            </div>

            <p className="mz-sub">Sections</p>
            <div className="mz-chips">
              {SECTIONS.map(s => (
                <button key={s.label} className="mz-chip mz-chip-plain" onClick={() => { jumpTo(s.page); setGrid(false) }}>
                  {s.label}<em>p.{pad(s.page)}</em>
                </button>
              ))}
            </div>

            <p className="mz-sub">Every page</p>
            <div className="mz-thumbs">
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map(p => {
                const on = view.includes(p)
                return (
                  <button key={p} className={`mz-thumb ${on ? 'on' : ''}`} onClick={() => { jumpTo(p); setGrid(false) }}>
                    <img src={thumbSrc(p)} alt={`Page ${p}`} loading="lazy" draggable={false} />
                    <span>{pad(p)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── zoom overlay ── */}
      {zoom !== null && (
        <div className="mz-zoom">
          <div className="mz-zoom-bar">
            <span className="mz-count-now" style={{ fontSize: 14 }}>{label}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="mz-tool" onClick={() => setZoom(z => Math.max(1, (z || 1) - 0.5))} aria-label="Zoom out"><ZoomOut size={16} /></button>
              <button className="mz-tool" onClick={() => setZoom(z => Math.min(3, (z || 1) + 0.5))} aria-label="Zoom in"><ZoomIn size={16} /></button>
              <button className="mz-tool" onClick={() => setZoom(null)} aria-label="Close zoom"><X size={16} /></button>
            </div>
          </div>
          <div className="mz-zoom-scroll">
            <div className="mz-zoom-pages" style={{ width: `${(narrow ? 100 : 92) * zoom}%` }}>
              {view.filter(Boolean).map(p => (
                <img key={p} src={pageSrc(p)} alt={`Page ${p}`} draggable={false}
                  style={{ width: view.filter(Boolean).length === 2 ? '50%' : (narrow ? '100%' : '50%') }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mz-shell { position: relative; height: calc(100svh - 76px); min-height: 300px; display: flex; flex-direction: column; background: transparent; }
        .mz-shell:fullscreen { height: 100vh; background: #08080a; }
        .mz-stage { position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .mz-book-wrap { position: relative; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: grab; -webkit-tap-highlight-color: transparent; }
        .mz-book-wrap:active { cursor: grabbing; }
        .mz-book { position: relative; transform-style: preserve-3d; will-change: transform; }
        .mz-book::after { content: ''; position: absolute; left: 4%; right: 4%; bottom: -26px; height: 40px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.75), transparent 70%); filter: blur(6px); z-index: -1; pointer-events: none; }
        .mz-fade { animation: mzFade .45s ease both; }
        @keyframes mzFade { from { opacity: 0; transform: scale(.985); } to { opacity: 1; } }

        .mz-slot { position: absolute; top: 0; overflow: hidden; background: transparent; }
        .mz-slot img, .mz-face img { width: 100%; height: 100%; display: block; object-fit: cover; pointer-events: none; -webkit-user-drag: none; }
        .mz-slot.filled { background: #111; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04); }
        .mz-slot-left.filled::after, .mz-slot-right.filled::after { content: ''; position: absolute; top: 0; bottom: 0; width: 9%; pointer-events: none; }
        .mz-slot-left.filled::after { right: 0; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.38)); }
        .mz-slot-right.filled::after { left: 0; background: linear-gradient(270deg, transparent, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.34)); }
        .mz-slot-left { border-radius: 4px 0 0 4px; }
        .mz-slot-right { border-radius: 0 4px 4px 0; }
        .mz-slot-single { border-radius: 4px; }

        .mz-leaf { position: absolute; top: 0; transform-style: preserve-3d; will-change: transform; z-index: 5; }
        .mz-face { position: absolute; inset: 0; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; background: #111; }
        .mz-face.back { transform: rotateY(180deg); }
        .mz-face.paper { background: linear-gradient(90deg, #1c1c1f, #141416); }
        .mz-face-left { border-radius: 4px 0 0 4px; }
        .mz-face-right { border-radius: 0 4px 4px 0; }

        .mz-shade { position: absolute; inset: 0; pointer-events: none; opacity: 0; }
        .mz-shade-fromL { background: linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.25) 35%, transparent 75%); }
        .mz-shade-fromR { background: linear-gradient(270deg, rgba(0,0,0,0.85), rgba(0,0,0,0.25) 35%, transparent 75%); }
        .mz-sheen { position: absolute; inset: 0; pointer-events: none; opacity: 0; mix-blend-mode: screen; }
        .mz-sheen-r { background: linear-gradient(270deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 18%, transparent 40%); }
        .mz-sheen-l { background: linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 18%, transparent 40%); }
        .mz-spine { position: absolute; top: 0; bottom: 0; width: 60px; pointer-events: none; z-index: 3; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.18) 45%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.18) 55%, transparent); }
        .mz-edge { position: absolute; top: 3px; bottom: 3px; background: repeating-linear-gradient(90deg, #d9d6cf 0 1px, #9e9b95 1px 2px); opacity: .55; }
        .mz-edge-l { border-radius: 3px 0 0 3px; }
        .mz-edge-r { border-radius: 0 3px 3px 0; }

        .mz-arrow { position: absolute; top: 50%; z-index: 20; width: 56px; height: 56px; margin-top: -28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); transition: background .2s, border-color .2s, transform .2s, opacity .2s; }
        .mz-arrow:hover:not(:disabled) { background: ${RED}; border-color: ${RED}; transform: scale(1.06); box-shadow: 0 0 30px rgba(225,29,42,0.45); }
        .mz-arrow:disabled { opacity: 0; pointer-events: none; }
        .mz-arrow-l { left: 16px; }
        .mz-arrow-r { right: 16px; }
        .mz-arrow-l svg { animation: mzNudgeL 1.8s ease-in-out infinite; }
        .mz-arrow-r svg { animation: mzNudgeR 1.8s ease-in-out infinite; }
        @keyframes mzNudgeR { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
        @keyframes mzNudgeL { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }
        .mz-arrow-pulse { border-color: ${RED}; box-shadow: 0 0 0 0 rgba(225,29,42,0.6); animation: mzPulse 1.8s ease-out infinite; }
        @keyframes mzPulse { 0% { box-shadow: 0 0 0 0 rgba(225,29,42,0.55); } 100% { box-shadow: 0 0 0 18px rgba(225,29,42,0); } }
        .mz-arrow-sm { width: 40px; height: 40px; margin-top: -20px; background: rgba(8,8,10,0.6); }
        .mz-arrow-sm.mz-arrow-l { left: 4px; }
        .mz-arrow-sm.mz-arrow-r { right: 4px; }

        .mz-hint { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 15; display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; white-space: nowrap; pointer-events: none;
          background: rgba(8,8,10,0.78); border: 1px solid rgba(225,29,42,0.55); color: #fff; font: 600 12.5px/1 ${BODY}; letter-spacing: .02em; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: 0 12px 30px rgba(0,0,0,0.5); animation: mzHintIn .6s .6s both; }
        @keyframes mzHintIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .mz-hint-hand { color: ${RED}; display: inline-flex; animation: mzSwipe 1.6s ease-in-out infinite; }
        @keyframes mzSwipe { 0% { transform: translateX(10px) rotate(0); } 50% { transform: translateX(-10px) rotate(-12deg); } 100% { transform: translateX(10px) rotate(0); } }
        .mz-hint-arrows { display: inline-flex; gap: 3px; }
        .mz-hint-arrows i { width: 7px; height: 7px; border-top: 2px solid ${RED}; border-right: 2px solid ${RED}; transform: rotate(45deg); opacity: .25; animation: mzChev 1.2s infinite; }
        .mz-hint-arrows i:nth-child(2) { animation-delay: .15s; }
        .mz-hint-arrows i:nth-child(3) { animation-delay: .3s; }
        @keyframes mzChev { 0%,100% { opacity: .2; } 40% { opacity: 1; } }

        .mz-controls { flex-shrink: 0; padding: 10px 20px 14px; max-width: 980px; width: 100%; margin: 0 auto; }
        .mz-progress { display: flex; align-items: center; height: 22px; }
        .mz-progress input { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; min-height: 0; padding: 0; margin: 0; border: 0; border-radius: 4px; outline: none; cursor: pointer; }
        .mz-progress input::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 3px solid ${RED}; box-shadow: 0 0 12px rgba(225,29,42,0.6); }
        .mz-progress input::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 3px solid ${RED}; }
        .mz-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; }
        .mz-count { display: flex; align-items: baseline; gap: 8px; font-family: ${DISPLAY}; }
        .mz-count-now { font-family: ${DISPLAY}; color: #fff; font-size: 20px; letter-spacing: .04em; }
        .mz-count-of { color: rgba(255,255,255,0.4); font-size: 14px; letter-spacing: .06em; }
        .mz-tool { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; border-radius: 999px; cursor: pointer; color: #fff; font: 600 12px/1 ${BODY}; letter-spacing: .06em; text-transform: uppercase;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14); transition: background .2s, border-color .2s; }
        .mz-tool:hover { border-color: ${RED}; background: rgba(225,29,42,0.14); }

        .mz-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(4,4,6,0.86); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); overflow-y: auto; padding: 24px 16px; animation: mzFadeOnly .25s ease both; }
        @keyframes mzFadeOnly { from { opacity: 0; } to { opacity: 1; } }
        .mz-panel { max-width: 1100px; margin: 0 auto; background: #0e0e11; border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; padding: clamp(18px, 3vw, 30px); }
        .mz-panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 8px; }
        .mz-eyebrow { display: block; font: 700 10.5px/1.4 ${BODY}; letter-spacing: .22em; text-transform: uppercase; color: ${RED}; margin-bottom: 6px; }
        .mz-panel-title { font-family: ${DISPLAY}; color: #fff; font-size: clamp(1.6rem, 4vw, 2.2rem); text-transform: uppercase; letter-spacing: .01em; margin: 0; font-weight: 400; }
        .mz-close { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mz-sub { font: 700 11px/1 ${BODY}; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin: 22px 0 12px; }
        .mz-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .mz-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px; border-radius: 999px; cursor: pointer; font: 500 13px/1.2 ${BODY}; color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); transition: all .2s; }
        .mz-chip b { font-family: ${DISPLAY}; font-weight: 400; color: ${RED}; font-size: 14px; letter-spacing: .03em; }
        .mz-chip em { font-style: normal; color: rgba(255,255,255,0.4); font-size: 11.5px; }
        .mz-chip:hover { border-color: ${RED}; background: rgba(225,29,42,0.12); color: #fff; }
        .mz-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 12px; }
        .mz-thumb { position: relative; padding: 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; cursor: pointer; background: #111; aspect-ratio: ${1060} / ${1500}; transition: transform .2s, border-color .2s; }
        .mz-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mz-thumb span { position: absolute; left: 6px; bottom: 6px; font: 700 10px/1 ${BODY}; color: #fff; background: rgba(0,0,0,0.7); padding: 3px 6px; border-radius: 4px; }
        .mz-thumb:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.4); }
        .mz-thumb.on { border: 2px solid ${RED}; box-shadow: 0 0 18px rgba(225,29,42,0.5); }

        .mz-zoom { position: fixed; inset: 0; z-index: 210; background: #060608; display: flex; flex-direction: column; animation: mzFadeOnly .25s ease both; }
        .mz-zoom-bar { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .mz-zoom-scroll { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y pinch-zoom; }
        .mz-zoom-pages { display: flex; margin: 0 auto; max-width: none; }
        .mz-zoom-pages img { display: block; height: auto; max-width: none; }
        .mz-shell button { min-height: 0; }

        .mz-tagrow { flex-shrink: 0; height: 40px; display: flex; align-items: center; justify-content: center; padding: 8px 14px 0; }
        .mz-tag { display: inline-flex; align-items: center; gap: 9px; max-width: 100%; padding: 7px 8px 7px 13px; border-radius: 999px; background: rgba(225,29,42,0.12); border: 1px solid rgba(225,29,42,0.55); white-space: nowrap; animation: mzTagIn .5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes mzTagIn { from { opacity: 0; transform: translateY(-8px) scale(.96); } to { opacity: 1; transform: none; } }
        .mz-tag-k { font-family: ${DISPLAY}; color: ${RED}; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; }
        .mz-tag-n { font: 600 12.5px/1 ${BODY}; color: #fff; overflow: hidden; text-overflow: ellipsis; }
        .mz-tag-dots { display: inline-flex; gap: 4px; padding: 4px 6px; border-radius: 999px; background: rgba(0,0,0,0.35); }
        .mz-tag-dots i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.55); transition: background .3s, transform .3s; }
        .mz-tag-dots i.on { background: ${RED}; transform: scale(1.25); }
        @media (max-height: 520px) and (min-width: 720px) {
          .mz-shell { height: calc(100svh - 52px); }
          .mz-controls { padding: 4px 20px 8px; }
          .mz-bar { margin-top: 4px; }
          .mz-tool { height: 32px; }
          .mz-count-now { font-size: 16px; }
          .mz-arrow { width: 44px; height: 44px; margin-top: -22px; }
          .mz-hint { display: none; }
        }
        @media (max-width: 719px) {
          .mz-shell { height: auto; min-height: 0; }
          .mz-controls { padding: 8px 14px 12px; }
          .mz-tool-label { display: none; }
          .mz-tool { padding: 0 12px; }
          .mz-count-now { font-size: 17px; }
          .mz-hint { bottom: 12px; font-size: 11.5px; padding: 9px 14px; }
        }
      `}</style>
    </div>
  )
}

function Slot({ side, page, w, h, children }: { side: 'left' | 'right' | 'single'; page: number; w: number; h: number; children?: React.ReactNode }) {
  return (
    <div className={`mz-slot mz-slot-${side} ${page ? 'filled' : ''}`} style={{ width: w, height: h, left: side === 'right' ? w : 0 }}>
      {page > 0 && <img src={pageSrc(page)} alt={`Page ${page}`} draggable={false} decoding="sync" />}
      {children}
    </div>
  )
}

function Face({ page, back, side, paper, children }: { page: number; back?: boolean; side: 'left' | 'right' | 'single'; paper?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`mz-face ${back ? 'back' : ''} ${paper ? 'paper' : ''} mz-face-${side}`}>
      {page > 0 && <img src={pageSrc(page)} alt={`Page ${page}`} draggable={false} decoding="sync" />}
      {children}
    </div>
  )
}
