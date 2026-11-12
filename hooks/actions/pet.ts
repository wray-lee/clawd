import { HAPPY, TYPE_L, TYPE_R, type Action } from '../sprites'

// Clicked while idle: happy eyes, a wiggle, sparkles on both sides.
export const pet: Action = ({ t }) => ({
  head: HAPPY,
  arms: t % 2 === 0 ? TYPE_L : TYPE_R,
  fx: t % 4 < 2 ? [[0, 0, '+'], [1, 10, '+']] : [[0, 8, '+'], [1, -2, '+']],
})
