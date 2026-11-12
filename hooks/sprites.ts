// Clawd's parts, as drawn on Claude Code's welcome screen. Every glyph is one
// column wide (ASCII or quadrant blocks), so CJK terminals stay aligned.

export const W = 9 // sprite width

export const HEAD = ' ▐▛███▜▌ '
export const BLINK = ' ▐█████▌ '
export const LOOK_L = ' ▐▜██▜█▌ '
export const LOOK_R = ' ▐█▛██▛▌ '
export const HAPPY = ' ▐▟███▙▌ ' // ^ ^ eyes
export const DOWN = ' ▐▀███▀▌ ' // eyes cast down

export const ARMS_DOWN = '▝▜█████▛▘'
export const ARMS_UP = '▗▜█████▛▖'
export const TYPE_L = '▗▜█████▛▘'
export const TYPE_R = '▝▜█████▛▖'

export const LEGS_A = '  ▘▘ ▝▝  '
export const LEGS_B = '  ▝▝ ▘▘  '

// One effect glyph run: row in the band, column from Clawd's left edge, text,
// and its color (absent: the color palette.ts gives the glyph).
export type Fx = [row: number, col: number, text: string, color?: string]

// What an action asks for this frame; anything left out keeps the default
// (open eyes that blink, arms down, legs together, standing on row 1).
export type Pose = {
  head?: string
  arms?: string
  legs?: string
  top?: number // 0 is a hop
  dx?: number // nudge sideways this frame only
  fx?: Fx[]
}

export type ActionCtx = {
  t: number // ticks of 100ms
  x: number // Clawd's left column
  columns: number // band width
  blink: boolean
  typed: { keys: number; char: string } | null // the person's typing, while it lasts
}

export type Action = (c: ActionCtx) => Pose

// A helper Clawd, one per running subagent: Clawd's head narrowed to 5
// columns over its arms and four legs, 2 rows.
export const MINI_W = 5
export const MINI_HEAD = '▐▛█▜▌'
export const MINI_BLINK = '▐███▌'
export const MINI_BODY = '▜▜▀▛▛'

// A subagent's own subagent: 3 columns, two eyes over two legs.
export const TINY_W = 3
export const TINY_HEAD = '▛█▜'
export const TINY_BODY = '▜▀▛'

// A workflow agent's top hat, a row above its head, one per size.
export const MINI_HAT = '▂▟█▙▂'
export const TINY_HAT = '▗█▖'

// Three levels down and deeper: one pixel, 1 column.
export const PIXEL = '▖'
