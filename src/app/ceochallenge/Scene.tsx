'use client'

import { memo, useEffect, useState } from 'react'
import type { BizId } from '@/lib/ceo/types'

export interface SceneVibe {
  crowd: number // 0..1 how full the business is
  mood: number // 0..1 how good the place looks/feels to customers
  staff: number // 0..1 team morale
  shine: number // 0..1 overall fortune (weather)
}

interface Props {
  biz: BizId
  vibe: SceneVibe
  profit: number // weekly profit (sign drives money particles)
  timelapse?: boolean // fast day/night cycle between decisions
  sceneKey?: string | number // change to replay the walking animation
}

const ACCENT: Record<BizId, string> = {
  cafe: '#C8782E',
  restaurant: '#D9482B',
  tech: '#3B7BF6',
  fashion: '#C2389A',
  hotel: '#2E9E6B',
}

const SIGN: Record<BizId, string> = {
  cafe: 'BREW LANE',
  restaurant: "AMMA'S KITCHEN",
  tech: 'NEXORA',
  fashion: 'THREAD & CO.',
  hotel: 'ELLA RIDGE',
}

const DOOR_X = 214

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => { setR(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return r
}
const GROUND = 252

/** A round-headed stick figure, in the style of the explainer cartoons the game is modelled on. */
function Person({ x, y = GROUND, mood, item, flip = false, still = false, skin = '#FFFFFF', reduced = false }: {
  x: number; y?: number; mood: number; item?: 'cup' | 'bag' | 'case' | 'laptop' | null; flip?: boolean; still?: boolean; skin?: string; reduced?: boolean
}) {
  const mouth = mood > 0.62 ? 'M-4.5 3.5 Q0 8 4.5 3.5' : mood > 0.38 ? 'M-4 5 L4 5' : 'M-4.5 7 Q0 2.5 4.5 7'
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} className={still ? '' : 'ceo-bob'}>
      {still || reduced ? (
        <g>
          <line x1="0" y1="-26" x2="-6" y2="0" className="ceo-limb" />
          <line x1="0" y1="-26" x2="6" y2="0" className="ceo-limb" />
        </g>
      ) : (
        <g>
          {/* Legs swing around the hip (0, -26) in the figure's own coordinates. */}
          <line x1="0" y1="-26" x2="0" y2="0" className="ceo-limb">
            <animateTransform attributeName="transform" type="rotate" values="-18 0 -26;18 0 -26;-18 0 -26" dur="0.7s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="-26" x2="0" y2="0" className="ceo-limb">
            <animateTransform attributeName="transform" type="rotate" values="18 0 -26;-18 0 -26;18 0 -26" dur="0.7s" repeatCount="indefinite" />
          </line>
        </g>
      )}
      <line x1="0" y1="-52" x2="0" y2="-26" className="ceo-limb" />
      <line x1="0" y1="-46" x2="-9" y2="-33" className="ceo-limb" />
      <line x1="0" y1="-46" x2="9" y2="-33" className="ceo-limb" />
      {item === 'cup' && <rect x="7" y="-40" width="7" height="9" rx="1.5" fill="#fff" stroke="#111" strokeWidth="2" />}
      {item === 'bag' && <path d="M6 -36 h12 l-1.5 13 h-9 Z" fill="#C2389A" stroke="#111" strokeWidth="2" />}
      {item === 'case' && <rect x="6" y="-30" width="11" height="15" rx="2" fill="#2E9E6B" stroke="#111" strokeWidth="2" />}
      {item === 'laptop' && <rect x="6" y="-40" width="13" height="9" rx="1" fill="#3B7BF6" stroke="#111" strokeWidth="2" />}
      <circle cx="0" cy="-64" r="12.5" fill={skin} stroke="#111" strokeWidth="2.5" />
      <circle cx="-4" cy="-66" r="1.7" fill="#111" />
      <circle cx="4" cy="-66" r="1.7" fill="#111" />
      <path d={mouth} transform="translate(0 -64)" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

function Building({ biz, crowd, accent }: { biz: BizId; crowd: number; accent: string }) {
  const lit = (i: number, n: number) => (i / n < crowd + 0.08 ? '#FFE7A8' : '#3A3F4A')
  switch (biz) {
    case 'cafe':
      return (
        <g>
          <rect x="70" y="92" width="260" height="160" fill="#EADCCB" stroke="#111" strokeWidth="3" />
          <path d="M60 92 h280 l-14 34 h-252 Z" fill="#fff" stroke="#111" strokeWidth="3" />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <path key={i} d={`M${66 + i * 40} 92 h20 l-2 34 h-20 Z`} fill={accent} />
          ))}
          <rect x="86" y="140" width="104" height="80" fill={lit(1, 2)} stroke="#111" strokeWidth="3" />
          <line x1="86" y1="196" x2="190" y2="196" stroke="#111" strokeWidth="3" />
          <path d="M104 196 v-14 h32 v14 M112 182 v-6 h4 v6" fill="none" stroke="#111" strokeWidth="2.5" />
          <rect x="196" y="150" width="40" height="102" fill="#6B4A33" stroke="#111" strokeWidth="3" />
          <circle cx="228" cy="204" r="2.5" fill="#111" />
          <rect x="250" y="140" width="66" height="80" fill={lit(0, 2)} stroke="#111" strokeWidth="3" />
          <path d="M283 150 c-12 0 -12 18 0 18 c12 0 12 -18 0 -18 Z M295 156 c7 0 7 8 0 8" fill="#fff" stroke="#111" strokeWidth="2" />
        </g>
      )
    case 'restaurant':
      return (
        <g>
          <rect x="72" y="112" width="256" height="140" fill="#F1E3C8" stroke="#111" strokeWidth="3" />
          <path d="M50 116 L200 64 L350 116 Z" fill="#B5462F" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
          <path d="M50 116 q-10 -2 -14 -10 M350 116 q10 -2 14 -10" fill="none" stroke="#111" strokeWidth="3" />
          {[110, 290].map(x => (
            <g key={x}>
              <line x1={x} y1="116" x2={x} y2="130" stroke="#111" strokeWidth="2" />
              <ellipse cx={x} cy="140" rx="8" ry="11" fill={crowd > 0.3 ? '#FFB347' : '#C9B79C'} stroke="#111" strokeWidth="2" />
            </g>
          ))}
          <rect x="92" y="158" width="94" height="70" fill={lit(1, 2)} stroke="#111" strokeWidth="3" />
          <rect x="196" y="150" width="40" height="102" fill="#7A3B22" stroke="#111" strokeWidth="3" />
          <rect x="248" y="158" width="62" height="70" fill={lit(0, 2)} stroke="#111" strokeWidth="3" />
          <ellipse cx="139" cy="214" rx="26" ry="5" fill="#8A5A3B" stroke="#111" strokeWidth="2" />
        </g>
      )
    case 'tech':
      return (
        <g>
          <rect x="96" y="44" width="208" height="208" fill="#D7E3F2" stroke="#111" strokeWidth="3" />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 5 }).map((__, c) => (
              <rect key={`${r}-${c}`} x={110 + c * 38} y={58 + r * 32} width="28" height="22" fill={lit(r * 5 + c, 20)} stroke="#111" strokeWidth="2" />
            )),
          )}
          <rect x="190" y="196" width="48" height="56" fill="#2B3445" stroke="#111" strokeWidth="3" />
          <line x1="214" y1="196" x2="214" y2="252" stroke="#9FB3CC" strokeWidth="2" />
        </g>
      )
    case 'fashion':
      return (
        <g>
          <rect x="62" y="96" width="276" height="156" fill="#F3E4EC" stroke="#111" strokeWidth="3" />
          <rect x="62" y="96" width="276" height="22" fill={accent} stroke="#111" strokeWidth="3" />
          <rect x="80" y="134" width="116" height="94" fill={lit(1, 2)} stroke="#111" strokeWidth="3" />
          {[108, 150].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="152" r="7" fill="#fff" stroke="#111" strokeWidth="2" />
              <path d={`M${x - 11} 162 h22 l5 46 h-32 Z`} fill={i ? '#F2B134' : accent} stroke="#111" strokeWidth="2" />
            </g>
          ))}
          <rect x="196" y="140" width="40" height="112" fill="#fff" stroke="#111" strokeWidth="3" />
          <rect x="250" y="134" width="72" height="94" fill={lit(0, 2)} stroke="#111" strokeWidth="3" />
          <line x1="256" y1="150" x2="316" y2="150" stroke="#111" strokeWidth="2" />
          {[264, 280, 296, 310].map((x, i) => (
            <path key={x} d={`M${x} 150 l-6 14 h12 Z`} fill={['#2E9E6B', '#F2B134', accent, '#3B7BF6'][i]} stroke="#111" strokeWidth="1.5" />
          ))}
        </g>
      )
    case 'hotel':
      return (
        <g>
          <rect x="84" y="112" width="232" height="140" fill="#F2EBDD" stroke="#111" strokeWidth="3" />
          <path d="M70 116 L200 76 L330 116 Z" fill="#5C7D5A" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
          {[0, 1, 2, 3].map(i => (
            <g key={i}>
              <rect x={102 + i * 52} y="126" width="34" height="28" fill={lit(i, 8)} stroke="#111" strokeWidth="2" />
              <line x1={98 + i * 52} y1="158" x2={140 + i * 52} y2="158" stroke="#111" strokeWidth="3" />
            </g>
          ))}
          {[0, 1, 3].map(i => (
            <rect key={i} x={102 + i * 52} y="176" width="34" height="28" fill={lit(i + 4, 8)} stroke="#111" strokeWidth="2" />
          ))}
          <rect x="196" y="176" width="40" height="76" fill="#6B4A33" stroke="#111" strokeWidth="3" />
        </g>
      )
  }
}

function Backdrop({ biz, shine }: { biz: BizId; shine: number }) {
  // Hills behind the hotel; a skyline behind everything else.
  if (biz === 'hotel') {
    return (
      <g>
        <path d="M-10 190 L60 96 L120 150 L190 70 L262 140 L320 92 L410 176 V260 H-10 Z" fill={shine > 0.45 ? '#9CC79A' : '#93A595'} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-10 214 Q100 168 210 200 T410 190 V260 H-10 Z" fill={shine > 0.45 ? '#6FAF73' : '#7E9480'} />
      </g>
    )
  }
  const tone = shine > 0.45 ? '#D9D2C7' : '#BCC0C6'
  return (
    <g fill={tone} stroke="#111" strokeWidth="2" opacity="0.75">
      <rect x="0" y="120" width="56" height="140" />
      <rect x="18" y="96" width="30" height="24" />
      <rect x="342" y="104" width="64" height="156" />
      <rect x="352" y="80" width="24" height="24" />
    </g>
  )
}

function Scene({ biz, vibe, profit, timelapse, sceneKey }: Props) {
  const reduced = useReducedMotion()
  const accent = ACCENT[biz]
  const crowd = Math.max(0, Math.min(1, vibe.crowd))
  const shine = Math.max(0, Math.min(1, vibe.shine))
  const sky = shine > 0.62 ? ['#FFD9A8', '#FFF4E4'] : shine > 0.4 ? ['#CFE3F5', '#F6EFE6'] : ['#9AA7B6', '#D9DDE2']
  const item = biz === 'cafe' ? 'cup' : biz === 'fashion' ? 'bag' : biz === 'hotel' ? 'case' : biz === 'tech' ? 'laptop' : null

  // Customers walking in (more when it's busier) and passers-by who don't stop (more when it looks tired).
  const walkersIn = 1 + Math.round(crowd * 6)
  const passers = Math.round((1 - vibe.mood) * 3)
  const coins = profit > 0 ? Math.min(6, 2 + Math.round(profit / 120_000)) : 0
  const bills = profit < 0 ? Math.min(5, 2 + Math.round(-profit / 60_000)) : 0

  return (
    <svg viewBox="0 0 400 300" className="ceo-scene-svg" role="img" aria-label={`${SIGN[biz]} — ${crowd > 0.6 ? 'busy' : crowd > 0.3 ? 'steady' : 'quiet'}`}>
      <defs>
        <linearGradient id={`sky-${biz}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#sky-${biz})`} />

      {/* Weather tells you how things are going before any number does. */}
      {shine > 0.55 ? (
        <g className="ceo-sun">
          <circle cx="340" cy="46" r="20" fill="#FFC23D" stroke="#111" strokeWidth="2.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <line key={a} x1="340" y1="18" x2="340" y2="10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${a} 340 46)`} />
          ))}
        </g>
      ) : (
        <g className="ceo-cloud">
          <path d="M300 60 a16 16 0 0 1 28 -12 a20 20 0 0 1 36 6 a14 14 0 0 1 2 28 h-62 a14 14 0 0 1 -4 -22 Z" fill="#fff" stroke="#111" strokeWidth="2.5" />
          {shine < 0.3 && [312, 328, 344, 360].map((x, i) => (
            <line key={x} x1={x} y1="90" x2={x - 6} y2="104" stroke="#5B7FA6" strokeWidth="2.5" strokeLinecap="round" className="ceo-rain" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </g>
      )}

      <Backdrop biz={biz} shine={shine} />
      <Building biz={biz} crowd={crowd} accent={accent} />

      {/* Sign */}
      <g>
        <rect x={200 - SIGN[biz].length * 6.2 - 14} y={biz === 'tech' ? 18 : biz === 'restaurant' ? 30 : biz === 'hotel' ? 48 : 58} width={SIGN[biz].length * 12.4 + 28} height="26" rx="5" fill="#111" />
        <text x="200" y={(biz === 'tech' ? 18 : biz === 'restaurant' ? 30 : biz === 'hotel' ? 48 : 58) + 18} textAnchor="middle" className="ceo-sign" fill={crowd > 0.15 ? '#FFE7A8' : '#8A8A8A'}>
          {SIGN[biz]}
        </text>
      </g>

      {/* Staff member at the door — their face is the team's morale. */}
      <Person x={DOOR_X - 2} y={biz === 'tech' ? 250 : 246} mood={vibe.staff} still skin="#FFF6E0" />

      {/* Pavement */}
      <rect x="0" y={GROUND} width="400" height={300 - GROUND} fill="#CFC6BA" stroke="#111" strokeWidth="3" />
      <line x1="0" y1={GROUND + 18} x2="400" y2={GROUND + 18} stroke="#B5AB9E" strokeWidth="2" strokeDasharray="14 10" />

      {/* Money */}
      <g key={`money-${sceneKey}`}>
        {Array.from({ length: coins }).map((_, i) => (
          <g key={`c${i}`} className="ceo-coin" style={{ animationDelay: `${0.4 + i * 0.45}s`, ['--cx' as string]: `${(i % 3) * 22 - 22}px` }}>
            <circle cx={DOOR_X} cy="150" r="9" fill="#FFC23D" stroke="#111" strokeWidth="2" />
            <text x={DOOR_X} y="154.5" textAnchor="middle" className="ceo-coin-t">+</text>
          </g>
        ))}
        {Array.from({ length: bills }).map((_, i) => (
          <g key={`b${i}`} className="ceo-bill" style={{ animationDelay: `${0.3 + i * 0.5}s`, ['--bx' as string]: `${120 + i * 25}px` }}>
            <rect x={DOOR_X - 10} y="170" width="20" height="12" rx="2" fill="#7BC47F" stroke="#111" strokeWidth="2" />
          </g>
        ))}
      </g>

      {/* People */}
      <g key={`people-${sceneKey}`} className="ceo-people">
        {Array.from({ length: walkersIn }).map((_, i) => {
          const fromLeft = i % 2 === 0
          return (
            <g
              key={`in${i}`}
              className={fromLeft ? 'ceo-walk-in-l' : 'ceo-walk-in-r'}
              style={{ animationDelay: `${(i * 1.15) % 6.9}s`, animationDuration: `${6.4 + (i % 3) * 0.6}s` }}
            >
              <Person x={DOOR_X} mood={vibe.mood} item={i % 2 ? item : null} flip={!fromLeft} reduced={reduced} />
            </g>
          )
        })}
        {Array.from({ length: passers }).map((_, i) => (
          <g key={`p${i}`} className="ceo-pass" style={{ animationDelay: `${1.6 + i * 2.3}s` }}>
            <Person x={-30} y={GROUND + 30} mood={0.4} reduced={reduced} />
          </g>
        ))}
      </g>

      {/* Time passing between decisions */}
      {timelapse && <rect width="400" height="300" className="ceo-timelapse" />}
    </svg>
  )
}

export default memo(Scene)
