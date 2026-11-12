// Colors a helper Clawd can wear. Theme keys, not hex, so each stays readable
// in light, dark and colorblind themes alike. `claude` stays the big one's.
export const PALETTE = [
  'success', 'error', 'warning', 'suggestion', 'remember',
  'permission', 'planMode', 'autoAccept', 'ide', 'merged',
] as const

// A random color no helper on screen wears yet; any once all are taken.
export function pick(taken: Iterable<string> = [], random = Math.random): string {
  const used = new Set(taken)
  const free = PALETTE.filter(c => !used.has(c))
  const pool = free.length ? free : PALETTE
  return pool[Math.floor(random() * pool.length)]!
}
