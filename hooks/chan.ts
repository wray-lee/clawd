// Claude-chan, the easter egg: a pixel-art girl in place of Clawd. Each cell
// is two pixels, the top one the glyph's color and the bottom one its
// background. She comes in two sizes, 16 rows and 12, each drawn by
// scripts/chan.py; the scene (where she stands, what she does) is Clawd's.

import type { ActionName } from './actions'
import { GAP, LENGTH, fidgetAt } from './actions/idle'
import { actionFor, canvas, drawHelpers, lineUp, type Activity, type Helper, type Put, type Row, type Scene } from './clawd'
import { CHAN_KEY, CHAN_MORPH, CHAN_PAL, CHAN_SCREEN_COLORS, CHAN_SIZES } from './chan-sprites'
import { ARMS_DOWN, HEAD, LEGS_A, W, keyGlyph } from './sprites'

export type ChanSize = (typeof CHAN_SIZES)[number]
type PoseName = keyof ChanSize['poses']
// Every size has each pose in as many frames, so either tells how many.
const POSES = CHAN_SIZES[0].poses

// The biggest of her sizes that fits in `rows`; none when even the small one doesn't.
export const sizeFor = (rows: number): ChanSize | undefined => CHAN_SIZES.find(z => z.rows <= rows)

// Clawd's actions, each as her pose that acts it out. Typing along and a
// shell command share the laptop; what its screen says tells them apart.
const POSE: Record<ActionName, PoseName> = {
  walk: 'walk', shell: 'laptop', echo: 'laptop', read: 'read', fetch: 'fetch', search: 'search',
  edit: 'write', skill: 'skill', mcp: 'mcp', compact: 'compact', todo: 'todo', plan: 'plan',
  idle: 'idle', sleep: 'sleep',
  celebrate: 'celebrate', oops: 'oops', wake: 'wake', hello: 'hello', shrug: 'shrug', sad: 'sad',
  pet: 'pet', spin: 'dizzy', shoo: 'puff', peek: 'peek', bonk: 'bonk', highfive: 'highfive',
  found: 'found', poof: 'poof', zap: 'zap',
}

// Ticks each frame shows; a pose's frames loop. Absent: 4.
const EVERY: Partial<Record<PoseName, number>> = {
  walk: 2, laptop: 2, sleep: 8, skill: 2, celebrate: 2, hello: 3, fetch: 5, plan: 6, todo: 6, mcp: 3, zap: 2,
}

// Her fidgets while idle, one at the end of each of Clawd's gaps: a pose, and
// the ticks each of its frames shows.
const FIDGETS: [PoseName, number][] = [
  ['hop', 3], ['hello', 3], ['wake', 10], ['look', 10], ['hum', 5],
  ['sneeze', 5], ['heart', 7], ['read', 10], ['nod', 5],
]

// The pose and frame on screen at tick t.
export function poseAt(s: Scene, activity: Activity | null): [PoseName, number] {
  const pose = POSE[actionFor(s, activity)]
  const { t } = s
  if (pose === 'idle') {
    const at = (t % GAP) - (GAP - LENGTH) // the last 2s of each gap
    if (at >= 0) {
      const [fidget, every] = FIDGETS[fidgetAt(Math.floor(t / GAP), FIDGETS.length)]!
      return [fidget, Math.floor(at / every) % POSES[fidget].length]
    }
    return ['idle', t % 53 < 2 ? 1 : 0] // a blink every ~5s
  }
  return [pose, Math.floor(t / (EVERY[pose] ?? 4)) % POSES[pose].length]
}

// The switch between Clawd and her takes two ticks a frame.
export const MORPH_TICKS = CHAN_MORPH.length * 2

// The morph frame on screen, Clawd to her or back; null when not switching.
function morphFrame(s: Scene): number | null {
  if (!s.morph) return null
  const i = Math.min(CHAN_MORPH.length - 1, Math.floor((MORPH_TICKS - (s.morph.until - s.t)) / 2))
  return s.morph.toChan ? i : CHAN_MORPH.length - 1 - i
}

// The pixels of the frame on screen: rows of palette indexes, -1 for none.
export function pixels(s: Scene, activity: Activity | null, size: ChanSize = CHAN_SIZES[0]): number[][] {
  const m = morphFrame(s)
  const [pose, n]: [PoseName, number] = m === null ? poseAt(s, activity) : ['morph', m]
  const rows: readonly string[] = size.poses[pose][n]!
  // Drawn facing right; walking left, mirrored.
  const isMirrored = pose === 'walk' && s.dir === -1
  return rows.map(r => {
    const px = [...r].map(ch => (ch === '.' ? -1 : CHAN_KEY.indexOf(ch)))
    return isMirrored ? px.reverse() : px
  })
}

// What her laptop's screen says: a prompt with a blinking cursor, or the
// last key the person typed (see keyGlyph).
function screen(s: Scene, activity: Activity | null): string | null {
  const action = actionFor(s, activity)
  if (action === 'shell') return s.t % 6 < 3 ? '>_' : '> '
  if (action !== 'echo') return null
  return '> ' + keyGlyph(s.typing?.char ?? '')
}

export function chanFrame(s: Scene, activity: Activity | null, columns: number, helpers: Helper[] = [], size: ChanSize = CHAN_SIZES[0]): Row[] {
  const { rows: CHAN_ROWS, w: CHAN_W } = size
  const { put, rows } = canvas(CHAN_ROWS, columns)
  const line = lineUp(helpers)
  // Helpers stand on her bottom row, a whole Clawd each, drawn as in Clawd's band.
  const atFeet: Put = (row, ...rest) => put(row + CHAN_ROWS - 4, ...rest)
  let x = Math.min(s.x, Math.max(0, columns - CHAN_W))
  const labelW = drawHelpers(s.t, x, columns, line, () => {}, CHAN_W, true)
  if (labelW) x = Math.min(x, Math.max(0, columns - labelW - 1 - CHAN_W))

  // While switching, Clawd himself stands where his band has him, on her
  // bottom row, and the smoke around him is centered on him.
  const m = morphFrame(s)
  const [clawdDy, isOnClawd] = m === null ? [null, false] : CHAN_MORPH[m]!
  const clawdX = Math.min(s.x, Math.max(0, columns - W), labelW ? Math.max(0, columns - labelW - 1 - W) : Infinity)
  if (clawdDy !== null)
    [HEAD, ARMS_DOWN, LEGS_A].forEach((part, i) => put(CHAN_ROWS - 3 + clawdDy + i, clawdX, part, 'body'))
  const at = x + (isOnClawd ? clawdX - x - (CHAN_W - W) / 2 | 0 : 0)

  const px = pixels(s, activity, size)
  for (let r = 0; r < CHAN_ROWS; r++)
    for (let c = 0; c < CHAN_W; c++) {
      const top = CHAN_PAL[px[2 * r]![c]!]
      const bottom = CHAN_PAL[px[2 * r + 1]![c]!]
      if (top && bottom) put(r, at + c, top === bottom ? '█' : '▀', 'body', top, false, top === bottom ? undefined : bottom)
      else if (top) put(r, at + c, '▀', 'body', top)
      else if (bottom) put(r, at + c, '▄', 'body', bottom)
    }
  const text = m === null ? screen(s, activity) : null
  if (text) {
    const [row, col] = size.screen
    const [fg, bg] = CHAN_SCREEN_COLORS
    put(row, x + col, text, 'body', fg, false, bg)
  }
  drawHelpers(s.t, x, columns, line, atFeet, CHAN_W, true)
  return rows()
}
