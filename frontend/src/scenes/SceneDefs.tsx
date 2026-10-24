/**
 * Gradients and filters every scene shares, rendered once by the app.
 * Stop colors are fixed: CSS variables inside defs resolve here, not in the scene that uses them.
 */
export function SceneDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="scene-leaf-shade" cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </radialGradient>
        <linearGradient id="scene-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe3ec" />
        </linearGradient>
        <linearGradient id="scene-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e4e8ec" />
          <stop offset=".35" stopColor="#c3c9cf" />
          <stop offset="1" stopColor="#7d858c" />
        </linearGradient>
        <radialGradient id="scene-moon" cx=".4" cy=".4" r=".65">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="1" stopColor="#e6d9b0" />
        </radialGradient>
        <filter id="scene-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Time-of-day light, applied to a scene's land layer */}
        <filter id="scene-light-dusk" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1.05 .08 0 0 .03  0 .8 0 0 0  0 0 .64 0 0  0 0 0 1 0" />
        </filter>
        <filter id="scene-light-night" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values=".2 0 0 0 .01  0 .25 0 0 .02  0 .06 .42 0 .05  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  )
}
