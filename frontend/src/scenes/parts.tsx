import type { CSSProperties } from 'react'
import type { TimeOfDay } from '../seasons/config'
import { place } from './place'

/** Landscape parts shared by every season. Each part's origin is its bottom center. */

interface PartProps {
  x: number
  y: number
  scale?: number
}

export function Hills() {
  return (
    <>
      <path
        d="M0 470 C200 430 380 455 560 440 C760 422 960 455 1160 432 C1340 412 1480 440 1600 430 L1600 620 L0 620 Z"
        fill="var(--hill-far)"
      />
      <path
        d="M0 540 C180 505 360 530 540 515 C720 500 900 530 1080 512 C1260 495 1420 520 1600 505 L1600 620 L0 620 Z"
        fill="var(--hill-mid)"
      />
    </>
  )
}

/** Plowed ground with rows that widen toward the viewer. */
export function Field() {
  return (
    <>
      <path d="M0 590 C300 575 700 585 1000 578 C1250 572 1450 580 1600 576 L1600 900 L0 900 Z" fill="var(--ground)" />
      <g fill="none" stroke="var(--ground-row)" strokeLinecap="round">
        <path d="M0 625 Q800 615 1600 620" strokeWidth="5" />
        <path d="M0 665 Q800 655 1600 660" strokeWidth="7" />
        <path d="M0 715 Q800 705 1600 710" strokeWidth="9" />
        <path d="M0 780 Q800 770 1600 775" strokeWidth="11" />
        <path d="M0 860 Q800 850 1600 855" strokeWidth="13" />
      </g>
      <rect y="770" width="1600" height="130" fill="#000" opacity=".07" />
    </>
  )
}

function Canopy() {
  return (
    <>
      <circle cx="0" cy="-100" r="46" />
      <circle cx="-36" cy="-76" r="34" />
      <circle cx="36" cy="-74" r="32" />
      <circle cx="-20" cy="-126" r="30" />
      <circle cx="22" cy="-122" r="30" />
      <circle cx="0" cy="-66" r="30" />
    </>
  )
}

/** Leafy tree; `leaf` picks one of the scene's three leaf colors. */
export function Tree({ x, y, scale, leaf = 'a' }: PartProps & { leaf?: 'a' | 'b' | 'c' }) {
  return (
    <g transform={place(x, y, scale)} style={{ '--leaf': `var(--leaf-${leaf})` } as CSSProperties}>
      <path d="M-7 0 C-5 -20 -5 -40 -3 -64 L3 -64 C5 -40 5 -20 7 0 Z" fill="#4a3322" />
      <g fill="var(--leaf)">
        <Canopy />
      </g>
      <g fill="url(#scene-leaf-shade)">
        <Canopy />
      </g>
    </g>
  )
}

export function Cloud({ x, y, scale }: PartProps) {
  return (
    <g transform={place(x, y, scale)} fill="url(#scene-cloud)">
      <ellipse cx="-50" cy="8" rx="45" ry="18" />
      <ellipse cx="55" cy="6" rx="50" ry="20" />
      <ellipse cx="-10" cy="-18" rx="40" ry="26" />
      <ellipse cx="30" cy="-14" rx="34" ry="22" />
      <ellipse cx="0" cy="4" rx="72" ry="24" />
    </g>
  )
}

/** Red gambrel barn with a silo behind it. */
export function Farmstead({ x, y, scale }: PartProps) {
  return (
    <g transform={place(x, y, scale)}>
      <ellipse cx="80" cy="0" rx="270" ry="16" fill="#000" opacity=".15" />
      <rect x="250" y="-280" width="70" height="280" fill="url(#scene-metal)" />
      <path d="M250 -280 A35 32 0 0 1 320 -280 Z" fill="url(#scene-metal)" />
      <g stroke="#6f777e" strokeWidth="2" opacity=".55">
        <line x1="250" y1="-220" x2="320" y2="-220" />
        <line x1="250" y1="-160" x2="320" y2="-160" />
        <line x1="250" y1="-100" x2="320" y2="-100" />
        <line x1="250" y1="-40" x2="320" y2="-40" />
      </g>
      <path d="M100 0 L262 -8 L262 -112 L100 -110 Z" fill="#7e2a1e" />
      <path d="M110 -110 L272 -114 L242 -168 L80 -165 Z" fill="#5d5550" />
      <path d="M80 -165 L242 -168 L160 -199 L0 -196 Z" fill="#746c66" />
      <path d="M-100 0 L-100 -110 L100 -110 L100 0 Z" fill="#b5392a" />
      <path d="M-110 -110 L-80 -165 L0 -196 L80 -165 L110 -110 Z" fill="#b5392a" />
      <g stroke="#000" strokeWidth="2" opacity=".08">
        <line x1="-75" y1="-110" x2="-75" y2="0" />
        <line x1="-55" y1="-110" x2="-55" y2="0" />
        <line x1="55" y1="-110" x2="55" y2="0" />
        <line x1="75" y1="-110" x2="75" y2="0" />
      </g>
      <path
        d="M-112 -110 L-80 -166 L0 -198 L80 -166 L112 -110"
        fill="none"
        stroke="#f1ead8"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <rect x="-46" y="-88" width="92" height="88" fill="#a1301f" stroke="#f1ead8" strokeWidth="5" />
      <path d="M-46 -88 L46 0 M46 -88 L-46 0 M0 -88 L0 0" stroke="#f1ead8" strokeWidth="5" />
      <rect x="-18" y="-162" width="36" height="34" fill="#4a1a12" stroke="#f1ead8" strokeWidth="4" />
      <path
        d="M140 -82 L162 -83 L162 -61 L140 -60 Z M205 -85 L227 -86 L227 -64 L205 -63 Z"
        fill="#4a1a12"
        stroke="#e9dfc6"
        strokeWidth="3"
      />
      <rect x="-103" y="-8" width="206" height="8" fill="#8c8478" />
    </g>
  )
}

/** Barn windows lit at night; place with the same props as its Farmstead. */
export function FarmLights({ x, y, scale }: PartProps) {
  return (
    <g transform={place(x, y, scale)} fill="#ffd27a" filter="url(#scene-glow)">
      <rect x="-16" y="-160" width="32" height="30" />
      <path d="M142 -80 L160 -81 L160 -63 L142 -62 Z M207 -83 L225 -84 L225 -66 L207 -65 Z" />
    </g>
  )
}

/** Day sun high in the sky, or a low orange sun at dusk. Sits behind the hills. */
export function Sun({ time }: { time: Exclude<TimeOfDay, 'night'> }) {
  return time === 'day' ? (
    <circle cx="320" cy="190" r="52" fill="#fff6d6" />
  ) : (
    <circle cx="300" cy="490" r="85" fill="#ffb766" />
  )
}

export function Moon({ x, y, scale }: PartProps) {
  return (
    <g transform={place(x, y, scale)}>
      <circle r="46" fill="url(#scene-moon)" />
      <g fill="#d8c99a" opacity=".55">
        <circle cx="-12" cy="-10" r="8" />
        <circle cx="14" cy="8" r="6" />
        <circle cx="-4" cy="18" r="4" />
      </g>
    </g>
  )
}

const STAR_POINTS = [
  [60, 40], [140, 110], [230, 60], [330, 150], [420, 30], [520, 120], [610, 70], [700, 170], [790, 40],
  [880, 120], [960, 60], [1050, 150], [1140, 30], [1360, 80], [1440, 160], [1520, 50], [1580, 130],
  [180, 220], [470, 250], [760, 260], [990, 240], [1230, 280], [1500, 250], [300, 320], [640, 330], [1100, 340],
]

export function Stars() {
  return (
    <g fill="#fff">
      {STAR_POINTS.map(([cx, cy], i) => (
        <circle key={i} className="scene-twinkle" cx={cx} cy={cy} r={i % 3 ? 2 : 3} />
      ))}
    </g>
  )
}
