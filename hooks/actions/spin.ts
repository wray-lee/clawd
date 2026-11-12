import { LOOK_L, LOOK_R, type Action } from '../sprites'

// Clicked while walking: turns around, a little dizzy.
export const spin: Action = ({ t }) => ({
  head: t % 2 === 0 ? LOOK_L : LOOK_R,
  fx: [[0, 4, t % 4 < 2 ? '?' : '@']],
})
