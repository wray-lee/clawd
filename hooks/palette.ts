// Colors for what is drawn around the big Clawd, which keeps the theme's own
// `claude` orange. All are xterm-256 cube colors, so a 256-color terminal
// shows exactly these and no two collapse into one.

// Helper bodies: twelve hues around the wheel, none near Clawd's orange or
// the hat's purple.
export const PALETTE = [
  '#ff5f87', '#ffd75f', '#87d75f', '#5fd7af', '#5fd7ff', '#5f87ff',
  '#ff87d7', '#d7ff87', '#87afd7', '#afd7ff', '#ffffaf', '#5fafaf',
] as const

// A workflow agent's hat: the theme's purple the `ultracode` label is drawn in.
export const HAT = 'merged'

// Effect glyphs by character; any other effect is drawn dim.
const FX: Record<string, string> = {
  '*': '#ffd75f', '+': '#ffd75f', // sparkles
  z: '#87afff', Z: '#87afff', // sleep
  '!': '#ff5f5f', '?': '#ff5f5f', // surprise
  '>': '#87d787', _: '#87d787', // shell prompt
  '|': '#5fd7d7', '(': '#5fd7d7', ')': '#5fd7d7', // MCP antenna and waves
  O: '#d7d7d7', '/': '#af875f', '\\': '#af875f', // magnifying glass
  '~': '#bcbcbc', '#': '#ffd75f', // smoke and static
}
export const fxColor = (ch: string): string | undefined => FX[ch]

// A random color no helper on screen wears yet; any once all are taken.
export function pick(taken: Iterable<string> = [], random = Math.random): string {
  const used = new Set(taken)
  const free = PALETTE.filter(c => !used.has(c))
  const pool = free.length ? free : PALETTE
  return pool[Math.floor(random() * pool.length)]!
}
