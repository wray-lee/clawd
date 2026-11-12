import { LOOK_L, LOOK_R, TYPE_L, TYPE_R, type Action, type Fx } from '../sprites'

// Searching: holds a magnifying glass out to one side, then the other, and
// looks through it; now and then a "?" pops up.
export const search: Action = ({ t, blink }) => {
  const right = Math.floor(t / 12) % 2 === 0
  const lens: Fx[] = right ? [[1, 10, 'O'], [2, 9, '/']] : [[1, -2, 'O'], [2, -1, '\\']]
  return {
    head: blink ? undefined : right ? LOOK_R : LOOK_L,
    arms: right ? TYPE_R : TYPE_L,
    fx: t % 24 < 6 ? [...lens, [0, 4, '?']] : lens,
  }
}
