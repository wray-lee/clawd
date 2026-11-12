// Clawd's parts, as drawn on Claude Code's welcome screen. Every glyph is one
// column wide (ASCII or quadrant blocks), so CJK terminals stay aligned.

export const W = 9 // sprite width

export const HEAD = ' ▐▛███▜▌ '
export const BLINK = ' ▐█████▌ '
export const LOOK_L = ' ▐▜██▜█▌ '
export const LOOK_R = ' ▐█▛██▛▌ '
export const HAPPY = ' ▐▟███▙▌ ' // ^ ^ eyes

export const ARMS_DOWN = '▝▜█████▛▘'
export const ARMS_UP = '▗▜█████▛▖'
export const TYPE_L = '▗▜█████▛▘'
export const TYPE_R = '▝▜█████▛▖'

export const LEGS_A = '  ▘▘ ▝▝  '
export const LEGS_B = '  ▝▝ ▘▘  '

// One effect glyph run: row in the band, column from Clawd's left edge, text.
export type Fx = [row: number, col: number, text: string]

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
