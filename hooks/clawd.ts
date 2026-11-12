// Pure scene logic: no `$`, so the test can drive it frame by frame.

export const ROWS = 4
export const W = 9 // sprite width

// Clawd as drawn on Claude Code's welcome screen, plus a few poses.
const HEAD = ' ▐▛███▜▌ '
const HEAD_BLINK = ' ▐█████▌ '
const ARMS_DOWN = '▝▜█████▛▘'
const ARMS_UP = '▗▜█████▛▖'
const LEGS_A = '  ▘▘ ▝▝  '
const LEGS_B = '  ▝▝ ▘▘  '
const BLANK = ' '.repeat(W)

const SLEEP_AFTER = 1200 // ticks idle (~2 min at 100ms) before a nap

export type Scene = {
  t: number
  x: number
  dir: 1 | -1
  idle: number // ticks since Claude last worked
}

// One row of the band: spaces, Clawd's slice (theme orange), then any z's (dim).
export type Row = { pad: string; body: string; zzz: string }

export const start = (): Scene => ({ t: 0, x: 2, dir: 1, idle: 0 })

// One 100ms tick.
export function step(s: Scene, isWorking: boolean, columns: number): Scene {
  const t = s.t + 1
  if (!isWorking) return { ...s, t, idle: s.idle + 1 }
  let { x, dir } = s
  if (t % 2 === 0) {
    const max = Math.max(0, columns - W)
    if (x + dir < 0 || x + dir > max) dir = dir === 1 ? -1 : 1
    x = Math.min(max, Math.max(0, x + dir))
  }
  return { t, x, dir, idle: 0 }
}

export function frame(s: Scene, isWorking: boolean, columns: number): Row[] {
  const x = Math.min(s.x, Math.max(0, columns - W))
  const blink = s.t % 37 < 2 // a short blink every ~3.7s
  const sprite = [BLANK, BLANK, BLANK, BLANK]
  const zzz = ['', '', '', '']

  if (isWorking) {
    const stride = Math.floor(s.t / 2) % 2 === 0
    sprite.splice(1, 3, blink ? HEAD_BLINK : HEAD, stride ? ARMS_UP : ARMS_DOWN, stride ? LEGS_A : LEGS_B)
  } else if (s.idle >= SLEEP_AFTER) {
    sprite.splice(1, 3, HEAD_BLINK, ARMS_DOWN, LEGS_A)
    // z's drift up and to the right of the head, one after another.
    const phase = Math.floor(s.t / 6) % 4
    zzz[1] = phase >= 1 ? 'z' : ''
    zzz[0] = phase >= 2 ? (phase >= 3 ? ' z Z' : ' z') : ''
  } else {
    // Awake and waiting: blink, and a little hop with a wave every ~6s.
    const hop = s.t % 60 >= 57
    sprite.splice(hop ? 0 : 1, 3, blink ? HEAD_BLINK : HEAD, hop ? ARMS_UP : ARMS_DOWN, LEGS_A)
  }

  // Cut to the band's width so a narrow terminal never wraps.
  const room = Math.max(0, columns - x)
  return sprite.map((body, r) => ({
    pad: ' '.repeat(x),
    body: body.slice(0, room),
    zzz: zzz[r]!.slice(0, Math.max(0, room - W)),
  }))
}
