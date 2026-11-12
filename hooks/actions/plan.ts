import { LOOK_L, LOOK_R, TYPE_L, TYPE_R, W, type Action, type Fx } from '../sprites'

const PAPER = '#5fafaf' // the plan mode teal
const INK = '#ffd75f'
const ROUTE = ['   ', 'o  ', 'o- ', 'o->', 'o->', 'o->']

// Planning: holds up a blueprint beside it, on the side with room, and draws
// a route on it step by step while watching.
export const plan: Action = ({ t, x, columns }) => {
  const right = x + W + 5 <= columns
  const at = right ? 9 : -5
  const route = ROUTE[Math.floor(t / 3) % ROUTE.length]!
  const fx: Fx[] = [
    [1, at, '▛▀▀▀▜', PAPER],
    [2, at, '▌', PAPER], [2, at + 1, right ? route : [...route].reverse().join('').replace('>', '<'), INK], [2, at + 4, '▐', PAPER],
    [3, at, '▙▄▄▄▟', PAPER],
  ]
  return { head: right ? LOOK_R : LOOK_L, arms: right ? TYPE_R : TYPE_L, fx }
}
