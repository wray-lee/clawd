import { ARMS_UP, HAPPY, type Action } from '../sprites'

// A click while searching: found it! Happy eyes, the glass held high, a "!".
export const found: Action = ({ t }) => ({
  head: HAPPY,
  arms: ARMS_UP,
  top: t % 6 < 2 ? 0 : 1,
  fx: [[0, 9, 'O'], [0, 3, '!']],
})
