// Mockup art library: illustrated scene parts drawn as SVG. Each part's origin is its bottom center.
// Usage: <g data-art="combine" transform="translate(860 700)"></g>
// Colors come from CSS variables set per scene (season and time of day), so one drawing restyles everywhere.

const DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <radialGradient id="leafShade" cx=".35" cy=".3" r=".75">
      <stop offset="0" stop-color="#fff" stop-opacity=".3" />
      <stop offset=".55" stop-color="#fff" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity=".25" />
    </radialGradient>
    <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" />
      <stop offset="1" stop-color="#dbe3ec" />
    </linearGradient>
    <linearGradient id="siloShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e4e8ec" />
      <stop offset=".35" stop-color="#c3c9cf" />
      <stop offset="1" stop-color="#7d858c" />
    </linearGradient>
    <linearGradient id="binRoof" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d9dee3" />
      <stop offset="1" stop-color="#8a9298" />
    </linearGradient>
    <linearGradient id="machBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4c9a3a" />
      <stop offset="1" stop-color="#2b6322" />
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d6ecf5" />
      <stop offset=".5" stop-color="#8fbfd4" />
      <stop offset="1" stop-color="#5b8fa8" />
    </linearGradient>
    <radialGradient id="rimShade" cx=".35" cy=".35" r=".7">
      <stop offset="0" stop-color="#fff" stop-opacity=".45" />
      <stop offset="1" stop-color="#000" stop-opacity=".2" />
    </radialGradient>
    <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#ffeaa0" stop-opacity=".6" />
      <stop offset="1" stop-color="#ffeaa0" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="moonShade" cx=".4" cy=".4" r=".65">
      <stop offset="0" stop-color="#fffbe8" />
      <stop offset="1" stop-color="#e6d9b0" />
    </radialGradient>
    <pattern id="corn-fall" width="26" height="130" patternUnits="userSpaceOnUse">
      <path d="M13 130 L13 16" stroke="#8d6d2a" stroke-width="3" />
      <path d="M13 100 Q3 92 1 104 Q6 99 13 104 Z M13 80 Q23 70 26 82 Q20 78 13 84 Z M13 56 Q2 48 1 60 Q6 55 13 60 Z" fill="#c9a24c" />
      <ellipse cx="16" cy="72" rx="3" ry="9" fill="#d9b86a" transform="rotate(15 16 72)" />
      <path d="M13 18 L7 3 M13 18 L13 0 M13 18 L19 4" stroke="#d9b866" stroke-width="2" fill="none" />
    </pattern>
    <pattern id="corn-summer" width="26" height="130" patternUnits="userSpaceOnUse">
      <path d="M13 130 L13 16" stroke="#2f6b27" stroke-width="3" />
      <path d="M13 100 Q1 90 0 104 Q6 98 13 104 Z M13 80 Q25 70 26 84 Q20 78 13 84 Z M13 56 Q1 46 0 60 Q6 54 13 60 Z M13 38 Q24 30 25 42 Q19 38 13 42 Z" fill="#4f9a3a" />
      <ellipse cx="17" cy="72" rx="4" ry="11" fill="#9cc25a" transform="rotate(15 17 72)" />
      <path d="M13 18 L7 3 M13 18 L13 0 M13 18 L19 4" stroke="#d8c46a" stroke-width="2" fill="none" />
    </pattern>
    <pattern id="seedlings" width="40" height="24" patternUnits="userSpaceOnUse">
      <path d="M20 22 L20 12 M20 14 Q12 6 10 12 Q15 12 20 16 M20 13 Q28 4 31 10 Q25 11 20 15" stroke="#5f9f3c" stroke-width="2.5" fill="#76b84c" />
    </pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <!-- Time-of-day light, applied to the land group -->
    <filter id="light-dusk" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="1.05 .08 0 0 .03  0 .8 0 0 0  0 0 .64 0 0  0 0 0 1 0" />
    </filter>
    <filter id="light-night" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values=".2 0 0 0 .01  0 .25 0 0 .02  0 .06 .42 0 .05  0 0 0 1 0" />
    </filter>
  </defs>
</svg>`

const CANOPY = `
  <circle cx="0" cy="-100" r="46" /><circle cx="-36" cy="-76" r="34" /><circle cx="36" cy="-74" r="32" />
  <circle cx="-20" cy="-126" r="30" /><circle cx="22" cy="-122" r="30" /><circle cx="0" cy="-66" r="30" />`

const ART = {
  tree: `
    <path d="M-7 0 C-5 -20 -5 -40 -3 -64 L3 -64 C5 -40 5 -20 7 0 Z" fill="#4a3322" />
    <g fill="var(--leaf)">${CANOPY}</g>
    <g fill="url(#leafShade)">${CANOPY}</g>`,

  cloud: `
    <g fill="url(#cloudGrad)">
      <ellipse cx="-50" cy="8" rx="45" ry="18" /><ellipse cx="55" cy="6" rx="50" ry="20" />
      <ellipse cx="-10" cy="-18" rx="40" ry="26" /><ellipse cx="30" cy="-14" rx="34" ry="22" />
      <ellipse cx="0" cy="4" rx="72" ry="24" />
    </g>`,

  farmstead: `
    <rect x="250" y="-280" width="70" height="280" fill="url(#siloShade)" />
    <path d="M250 -280 A35 32 0 0 1 320 -280 Z" fill="url(#siloShade)" />
    <g stroke="#6f777e" stroke-width="2" opacity=".55">
      <line x1="250" y1="-220" x2="320" y2="-220" /><line x1="250" y1="-160" x2="320" y2="-160" />
      <line x1="250" y1="-100" x2="320" y2="-100" /><line x1="250" y1="-40" x2="320" y2="-40" />
    </g>
    <path d="M100 0 L262 -8 L262 -112 L100 -110 Z" fill="#7e2a1e" />
    <path d="M110 -110 L272 -114 L242 -168 L80 -165 Z" fill="#5d5550" />
    <path d="M80 -165 L242 -168 L160 -199 L0 -196 Z" fill="#746c66" />
    <path d="M-100 0 L-100 -110 L100 -110 L100 0 Z" fill="#b5392a" />
    <path d="M-110 -110 L-80 -165 L0 -196 L80 -165 L110 -110 Z" fill="#b5392a" />
    <g stroke="#000" stroke-width="2" opacity=".08">
      <line x1="-75" y1="-110" x2="-75" y2="0" /><line x1="-55" y1="-110" x2="-55" y2="0" />
      <line x1="55" y1="-110" x2="55" y2="0" /><line x1="75" y1="-110" x2="75" y2="0" />
    </g>
    <path d="M-112 -110 L-80 -166 L0 -198 L80 -166 L112 -110" fill="none" stroke="#f1ead8" stroke-width="6" stroke-linejoin="round" />
    <rect x="-46" y="-88" width="92" height="88" fill="#a1301f" stroke="#f1ead8" stroke-width="5" />
    <path d="M-46 -88 L46 0 M46 -88 L-46 0 M0 -88 L0 0" stroke="#f1ead8" stroke-width="5" />
    <rect x="-18" y="-162" width="36" height="34" fill="#4a1a12" stroke="#f1ead8" stroke-width="4" />
    <path d="M140 -82 L162 -83 L162 -61 L140 -60 Z M205 -85 L227 -86 L227 -64 L205 -63 Z" fill="#4a1a12" stroke="#e9dfc6" stroke-width="3" />
    <rect x="-103" y="-8" width="206" height="8" fill="#8c8478" />`,

  farmLights: `
    <g fill="#ffd27a" filter="url(#glow)">
      <rect x="-16" y="-160" width="32" height="30" />
      <path d="M142 -80 L160 -81 L160 -63 L142 -62 Z M207 -83 L225 -84 L225 -66 L207 -65 Z" />
    </g>`,

  farmSnow: `
    <path d="M-112 -110 L-80 -166 L0 -198 L80 -166 L112 -110" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round" stroke-linecap="round" />
    <path d="M80 -165 L242 -168 L160 -199 L0 -196 Z" fill="#f4f7fa" />
    <path d="M110 -110 L272 -114 L242 -168 L80 -165 Z" fill="#dfe6ee" />
    <path d="M250 -282 A35 32 0 0 1 320 -282 Z" fill="#fff" />`,

  combine: `
    <ellipse cx="0" cy="-2" rx="225" ry="12" fill="#000" opacity=".22" />
    <path d="M-150 -82 L-215 -82 L-232 -30 L-150 -22 Z" fill="#2b6322" />
    <path d="M-215 -82 L-282 -24 L-232 -20 L-232 -30 Z" fill="#f2c230" />
    <path d="M-215 -82 L-282 -24" stroke="#fff3b8" stroke-width="3" opacity=".7" />
    <path d="M-160 -72 L-95 -130 L-70 -112 L-140 -36 Z" fill="#234f1c" />
    <path d="M-100 -150 L165 -150 L178 -62 L-95 -62 Z" fill="url(#machBody)" />
    <rect x="-95" y="-102" width="270" height="7" fill="#f2c230" />
    <rect x="110" y="-142" width="52" height="34" rx="3" fill="#1d3a17" />
    <g stroke="#4c7a3f" stroke-width="2">
      <line x1="114" y1="-134" x2="158" y2="-134" /><line x1="114" y1="-125" x2="158" y2="-125" /><line x1="114" y1="-116" x2="158" y2="-116" />
    </g>
    <path d="M-40 -150 L150 -150 L138 -210 L-28 -210 Z" fill="#3f8a31" />
    <path class="grain" d="M-24 -210 Q55 -236 134 -210 Z" fill="#e2b84a" />
    <path d="M-28 -210 L138 -210" stroke="#f2c230" stroke-width="4" />
    <path d="M160 -150 L172 -200 L-14 -226 L-26 -212" fill="none" stroke="#2d5e22" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="140" y="-240" width="9" height="90" fill="#3a3a3a" />
    <g class="puffs">
      <circle class="puff" cx="144" cy="-246" r="9" fill="#cfcfcf" />
      <circle class="puff" cx="144" cy="-246" r="9" fill="#cfcfcf" style="animation-delay:-1s" />
      <circle class="puff" cx="144" cy="-246" r="9" fill="#cfcfcf" style="animation-delay:-2s" />
    </g>
    <path d="M-122 -150 L-40 -150 L-40 -224 L-112 -224 L-128 -188 Z" fill="#234f1c" />
    <path d="M-116 -156 L-46 -156 L-46 -218 L-108 -218 L-122 -188 Z" fill="url(#glass)" />
    <circle cx="-76" cy="-180" r="10" fill="#2b2b2b" opacity=".55" />
    <path d="M-87 -186 Q-76 -198 -65 -186 Z" fill="#c43a2a" opacity=".75" />
    <line x1="-80" y1="-218" x2="-80" y2="-156" stroke="#1d3a17" stroke-width="3" />
    <rect x="-122" y="-234" width="88" height="12" rx="4" fill="#f4f1e6" />
    <rect x="-126" y="-232" width="10" height="7" rx="2" fill="#fff6c8" />
    <g stroke="#222" stroke-width="3">
      <line x1="-112" y1="-150" x2="-120" y2="-66" /><line x1="-100" y1="-150" x2="-108" y2="-66" />
      <line x1="-113" y1="-130" x2="-101" y2="-130" /><line x1="-115" y1="-108" x2="-103" y2="-108" /><line x1="-117" y1="-86" x2="-105" y2="-86" />
    </g>
    <path d="M-104 -62 Q-40 -128 24 -62" fill="none" stroke="#234f1c" stroke-width="10" />
    <g transform="translate(-40 -56)">
      <circle r="56" fill="#1e1e1e" />
      <g class="spin">
        <circle r="50" fill="none" stroke="#3a3a3a" stroke-width="8" stroke-dasharray="8 8" />
        <circle r="30" fill="#f2c230" /><circle r="30" fill="url(#rimShade)" />
        <g fill="#8a6d12"><circle cx="0" cy="-19" r="3.5" /><circle cx="16" cy="-9" r="3.5" /><circle cx="16" cy="9" r="3.5" /><circle cx="0" cy="19" r="3.5" /><circle cx="-16" cy="9" r="3.5" /><circle cx="-16" cy="-9" r="3.5" /></g>
        <circle r="9" fill="#5a4a10" />
      </g>
    </g>
    <g transform="translate(135 -35)">
      <circle r="35" fill="#1e1e1e" />
      <g class="spin">
        <circle r="30" fill="none" stroke="#3a3a3a" stroke-width="6" stroke-dasharray="6 6" />
        <circle r="18" fill="#f2c230" /><circle r="18" fill="url(#rimShade)" />
        <rect x="-2" y="-14" width="4" height="28" fill="#8a6d12" />
        <circle r="6" fill="#5a4a10" />
      </g>
    </g>`,

  combineLights: `
    <path d="M-126 -230 L-560 -40 L-560 40 L-240 -18 Z" fill="url(#beam)" />
    <path d="M-116 -156 L-46 -156 L-46 -218 L-108 -218 L-122 -188 Z" fill="#ffdf8a" opacity=".5" />
    <circle cx="-121" cy="-229" r="7" fill="#fff6c8" filter="url(#glow)" />`,

  tractorBody: `
    <ellipse cx="0" cy="-2" rx="130" ry="10" fill="#000" opacity=".22" />
    <path d="M-110 -70 L-110 -106 L14 -112 L22 -70 Z" fill="url(#machBody)" />
    <rect x="-118" y="-104" width="10" height="34" fill="#1d3a17" />
    <rect x="-105" y="-96" width="116" height="5" fill="#f2c230" />
    <rect x="-62" y="-142" width="7" height="34" fill="#3a3a3a" />
    <path d="M12 -70 L12 -186 L92 -186 L98 -70 Z" fill="#234f1c" />
    <rect x="20" y="-178" width="66" height="72" fill="url(#glass)" />
    <circle cx="52" cy="-150" r="10" fill="#2b2b2b" opacity=".55" />
    <rect x="6" y="-196" width="98" height="12" rx="4" fill="#f4f1e6" />
    <path d="M14 -80 Q76 -152 138 -80" fill="none" stroke="#234f1c" stroke-width="12" />
    <g transform="translate(76 -62)">
      <circle r="62" fill="#1e1e1e" />
      <g class="spin">
        <circle r="55" fill="none" stroke="#3a3a3a" stroke-width="9" stroke-dasharray="9 9" />
        <circle r="34" fill="#f2c230" /><circle r="34" fill="url(#rimShade)" /><circle r="10" fill="#5a4a10" />
        <rect x="-2" y="-28" width="4" height="56" fill="#8a6d12" />
      </g>
    </g>
    <g transform="translate(-80 -33)">
      <circle r="33" fill="#1e1e1e" />
      <g class="spin">
        <circle r="28" fill="none" stroke="#3a3a3a" stroke-width="6" stroke-dasharray="6 6" />
        <circle r="18" fill="#f2c230" /><circle r="18" fill="url(#rimShade)" /><circle r="6" fill="#5a4a10" />
        <rect x="-2" y="-14" width="4" height="28" fill="#8a6d12" />
      </g>
    </g>`,

  planter: `
    <ellipse cx="205" cy="-2" rx="80" ry="7" fill="#000" opacity=".18" />
    <rect x="130" y="-46" width="150" height="16" rx="4" fill="#234f1c" />
    <g fill="#5a5a5a"><circle cx="160" cy="-20" r="14" /><circle cx="205" cy="-20" r="14" /><circle cx="250" cy="-20" r="14" /></g>
    <rect x="186" y="-80" width="40" height="36" rx="4" fill="#f2c230" />
    <line x1="130" y1="-40" x2="100" y2="-50" stroke="#234f1c" stroke-width="6" />`,

  grainCart: `
    <ellipse cx="350" cy="-2" rx="130" ry="10" fill="#000" opacity=".22" />
    <path d="M120 -46 L250 -62" stroke="#3a3a3a" stroke-width="7" stroke-linecap="round" />
    <path d="M240 -52 L222 -158 L472 -168 L456 -52 Z" fill="#b5392a" />
    <path d="M330 -52 L318 -160 L472 -168 L456 -52 Z" fill="#000" opacity=".12" />
    <path class="cart-load" d="M228 -158 Q345 -200 468 -166 Z" fill="#e2b84a" />
    <path d="M222 -158 L472 -168" stroke="#7a2418" stroke-width="6" stroke-linecap="round" />
    <path d="M250 -110 L460 -116" stroke="#7a2418" stroke-width="3" opacity=".6" />
    <g transform="translate(350 -44)">
      <circle r="44" fill="#1e1e1e" />
      <g class="spin">
        <circle r="38" fill="none" stroke="#3a3a3a" stroke-width="7" stroke-dasharray="7 7" />
        <circle r="24" fill="#d8d2c0" /><circle r="24" fill="url(#rimShade)" /><circle r="8" fill="#6a6450" />
        <rect x="-2" y="-19" width="4" height="38" fill="#8a8470" />
      </g>
    </g>`,

  stalk: `
    <path d="M0 0 L0 -112" stroke="#8d6d2a" stroke-width="3" />
    <path d="M0 -30 Q-12 -38 -14 -26 Q-8 -31 0 -26 Z M0 -50 Q12 -60 15 -48 Q8 -52 0 -46 Z M0 -74 Q-12 -82 -13 -70 Q-7 -75 0 -70 Z" fill="#c9a24c" />
    <ellipse cx="4" cy="-58" rx="3" ry="9" fill="#d9b86a" transform="rotate(15 4 -58)" />
    <path d="M0 -112 L-6 -126 M0 -112 L0 -130 M0 -112 L6 -125" stroke="#d9b866" stroke-width="2" fill="none" />`,

  stubbleStrip: Array.from({ length: 60 }, (_, i) => {
    const h = 6 + ((i * 7) % 9)
    const x = i * 9
    return `<line x1="${x}" y1="0" x2="${x + 2}" y2="${-h}" stroke="#a8834c" stroke-width="2.5" stroke-linecap="round" />`
  }).join(''),

  farmer: `
    <ellipse cx="0" cy="0" rx="26" ry="5" fill="#000" opacity=".2" />
    <path d="M-15 0 L-15 -10 L-2 -10 L-2 0 Z M2 0 L2 -10 L16 -10 L16 0 Z" fill="#3b2616" />
    <path d="M-13 -70 L-1 -70 L-2 -10 L-14 -10 Z M1 -70 L13 -70 L14 -10 L2 -10 Z" fill="#3c5a8a" />
    <path d="M1 -70 L13 -70 L14 -10 L8 -10 Z" fill="#000" opacity=".15" />
    <path d="M-18 -118 L18 -118 L20 -64 L-20 -64 Z" fill="#8a5a2b" />
    <path d="M6 -118 L18 -118 L20 -64 L10 -64 Z" fill="#000" opacity=".12" />
    <path d="M-10 -118 L0 -104 L10 -118 Z" fill="#6e4420" />
    <line x1="0" y1="-104" x2="0" y2="-66" stroke="#5e3a1b" stroke-width="2" />
    <path d="M-24 -114 L-16 -116 L-17 -74 L-26 -76 Z" fill="#7a4f25" />
    <circle cx="-22" cy="-72" r="5.5" fill="#e8b48c" />
    <rect x="-5" y="-124" width="10" height="8" fill="#d9a07a" />
    <circle cx="0" cy="-134" r="13" fill="#e8b48c" />
    <circle cx="-5" cy="-136" r="1.8" fill="#3b2616" /><circle cx="5" cy="-136" r="1.8" fill="#3b2616" />
    <path d="M-5 -129 Q0 -125 5 -129" fill="none" stroke="#8a4a32" stroke-width="1.8" stroke-linecap="round" />
    <path d="M-14 -138 Q0 -156 14 -138 Z" fill="#c43a2a" />
    <path d="M-14 -138 L-26 -135 L-14 -133 Z" fill="#a52e20" />
    <g transform="translate(16 -112)">
      <g class="wave">
        <path d="M-3 0 L6 -4 L22 -38 L15 -42 Z" fill="#7a4f25" />
        <circle cx="19" cy="-44" r="5.5" fill="#e8b48c" />
      </g>
    </g>`,

  goose: `
    <g transform="translate(4 -2)"><g class="flap" style="animation-delay:-.2s"><path d="M0 0 Q12 -22 28 -22 Q16 -10 10 2 Z" fill="#3a3028" /></g></g>
    <path d="M14 -2 L26 0 L14 4 Z" fill="#2a2420" />
    <ellipse cx="0" cy="0" rx="18" ry="6.5" fill="#8a7a68" />
    <ellipse cx="2" cy="3" rx="13" ry="3" fill="#cbbfab" />
    <path d="M-14 -2 L-32 -5" stroke="#1d1a17" stroke-width="4" stroke-linecap="round" />
    <ellipse cx="-35" cy="-5" rx="5.5" ry="3.8" fill="#1d1a17" />
    <ellipse cx="-34" cy="-3.5" rx="2.5" ry="1.5" fill="#fff" />
    <path d="M-40 -5 L-44 -4 L-40 -3 Z" fill="#1d1a17" />
    <g transform="translate(-2 -3)"><g class="flap"><path d="M0 0 Q10 -28 26 -26 Q14 -12 10 2 Z" fill="#5a4c3f" /></g></g>`,

  bin: `
    <rect x="-60" y="-120" width="120" height="120" fill="url(#siloShade)" />
    <g stroke="#6f777e" stroke-width="1.5" opacity=".5">
      <line x1="-60" y1="-100" x2="60" y2="-100" /><line x1="-60" y1="-80" x2="60" y2="-80" /><line x1="-60" y1="-60" x2="60" y2="-60" />
      <line x1="-60" y1="-40" x2="60" y2="-40" /><line x1="-60" y1="-20" x2="60" y2="-20" />
    </g>
    <path d="M-66 -120 L0 -170 L66 -120 Z" fill="url(#binRoof)" />
    <rect x="-8" y="-182" width="16" height="14" fill="#8a9095" />
    <rect x="-14" y="-50" width="28" height="50" fill="#5b6268" />`,

  binSnow: `<path d="M-68 -120 L0 -172 L68 -120 L60 -116 L0 -160 L-60 -116 Z" fill="#fff" />`,

  binLight: `<rect x="-12" y="-48" width="24" height="46" fill="#ffd27a" filter="url(#glow)" />`,

  moon: `
    <circle r="46" fill="url(#moonShade)" />
    <g fill="#d8c99a" opacity=".55"><circle cx="-12" cy="-10" r="8" /><circle cx="14" cy="8" r="6" /><circle cx="-4" cy="18" r="4" /></g>`,

  stars: [
    [60, 40], [140, 110], [230, 60], [330, 150], [420, 30], [520, 120], [610, 70], [700, 170], [790, 40], [880, 120],
    [960, 60], [1050, 150], [1140, 30], [1360, 80], [1440, 160], [1520, 50], [1580, 130], [180, 220], [470, 250],
    [760, 260], [990, 240], [1230, 280], [1500, 250], [300, 320], [640, 330], [1100, 340],
  ].map(([x, y], i) => `<circle class="twinkle" cx="${x}" cy="${y}" r="${i % 3 ? 2 : 3}" fill="#fff" />`).join(''),
}

document.body.insertAdjacentHTML('afterbegin', DEFS)
document.querySelectorAll('[data-art]').forEach((g) => {
  g.innerHTML = ART[g.dataset.art]
})
