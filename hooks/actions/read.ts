import { LOOK_L, LOOK_R, type Action } from '../sprites'

// Reading or searching: eyes scan left and right, a dot trail grows.
export const read: Action = ({ t, blink }) => ({
  head: blink ? undefined : Math.floor(t / 8) % 2 === 0 ? LOOK_L : LOOK_R,
  fx: [[0, 2, '.'.repeat((Math.floor(t / 4) % 3) + 1)]],
})
