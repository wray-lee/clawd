import { ARMS_UP, HAPPY, type Action } from '../sprites'

// Clicked while celebrating: a high five, big hop, sparkles everywhere.
export const highfive: Action = ({ t }) => ({
  head: HAPPY,
  arms: ARMS_UP,
  top: t % 4 < 2 ? 0 : 1,
  fx: [[0, -2, '*'], [0, 10, '*'], [1, -1, t % 2 ? '+' : ''], [1, 9, t % 2 ? '' : '+']],
})
