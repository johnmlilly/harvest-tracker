/** Clamp a percentage to 0-100 so scene positions never leave the field. Non-finite input becomes 0. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}
