/** SVG transform that places a scene part (origin at its bottom center). */
export function place(x: number, y: number, scale = 1) {
  return scale === 1 ? `translate(${x} ${y})` : `translate(${x} ${y}) scale(${scale})`
}
