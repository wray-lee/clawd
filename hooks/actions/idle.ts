import { ARMS_DOWN, ARMS_UP, BLINK, DOWN, HAPPY, HEAD, LOOK_L, LOOK_R, TYPE_L, TYPE_R, type Action, type Pose } from '../sprites'

const HEART = '#ff5f87'
const STAR = '#ffd75f'

// Waiting: at the end of every GAP ticks (8s) Clawd plays a fidget for 2s, picked at
// random, then stands still and blinks. Still most of the time on purpose:
// each change is a redraw, and idle is most of the day.
const GAP = 80
const LENGTH = 20

const FIDGETS: ((t: number) => Pose)[] = [
  // hops twice
  t => (t % 10 < 3 ? { arms: ARMS_UP, top: 0 } : {}),
  // waves
  t => ({ head: HAPPY, arms: t % 4 < 2 ? TYPE_R : ARMS_DOWN }),
  // stretches, eyes shut
  t => (t < 14 ? { head: BLINK, arms: ARMS_UP } : {}),
  // looks around
  t => ({ head: t < 10 ? LOOK_L : LOOK_R }),
  // dances
  t => ({ head: HAPPY, arms: t % 4 < 2 ? TYPE_L : TYPE_R, dx: t % 4 < 2 ? 0 : 1 }),
  // hums, a ~ drifting over its head
  t => ({ head: HAPPY, fx: [[0, t < 10 ? 6 : 7, '~']] }),
  // yawns
  t => ({ head: BLINK, fx: [[0, 4, t < 8 ? 'o' : 'O']] }),
  // sneezes: a... a... then a shake and a puff
  t => (t < 12 ? { head: DOWN, fx: [[0, 3, t < 6 ? 'a.' : 'a..']] } : { head: BLINK, dx: t % 2, fx: [[0, 6, '*']] }),
  // a heart pops up over its head
  t => ({ head: HAPPY, fx: t < 4 ? [] : [[t < 12 ? 1 : 0, 3, '<3', HEART]] }),
  // juggles a ball over its head
  t => ({ head: t % 8 < 4 ? LOOK_L : LOOK_R, arms: t % 4 < 2 ? TYPE_L : TYPE_R, fx: [[0, [2, 4, 6, 4][Math.floor(t / 2) % 4]!, 'o']] }),
  // crouches, then jumps
  t => (t < 8 ? { head: DOWN, top: 2 } : t < 12 ? { head: HAPPY, arms: ARMS_UP, top: 0 } : {}),
  // gazes at the stars
  t => ({ head: HEAD, fx: [[0, 1, t % 6 < 3 ? '*' : '.', STAR], [0, 7, t % 6 < 3 ? '.' : '*', STAR]] }),
  // cheers, both arms pumping
  t => ({ head: HAPPY, arms: t % 4 < 2 ? ARMS_UP : ARMS_DOWN }),
  // nods off, then snaps awake
  t => (t < 14 ? { head: BLINK, dx: t % 6 < 3 ? 0 : 1 } : { head: HEAD, arms: ARMS_UP, fx: [[0, 4, '!']] }),
]
export const FIDGET_COUNT = FIDGETS.length

// The fidget for the n-th gap: picked by a hash of n, but never the one just
// played. Each depends on the last, so they are worked out in order, once.
const pick = (n: number): number => {
  let x = Math.imul(n + 1, 0x9e3779b1)
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) % FIDGETS.length
}
const played: number[] = []
export const fidgetAt = (n: number): number => {
  while (played.length <= n) {
    const i = played.length
    const last = played[i - 1]
    played.push(i > 0 && pick(i) === last ? (last! + 1) % FIDGETS.length : pick(i))
  }
  return played[n]!
}

export const idle: Action = ({ t }) => {
  const at = (t % GAP) - (GAP - LENGTH) // the last 2s of each gap
  if (at < 0) return {} // stands still; frame() blinks it
  return FIDGETS[fidgetAt(Math.floor(t / GAP))]!(at)
}
