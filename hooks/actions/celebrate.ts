import { ARMS_UP, HAPPY, type Action } from '../sprites'

// A turn finished: happy eyes, arms up, hopping among sparkles.
export const celebrate: Action = ({ t }) => {
  const up = t % 6 < 3
  const flip = t % 4 < 2
  return {
    head: HAPPY,
    arms: ARMS_UP,
    top: up ? 0 : 1,
    fx: up ? [] : [flip ? [0, -1, '+'] : [0, 9, '+'], flip ? [1, 10, '*'] : [1, -2, '*']],
  }
}
