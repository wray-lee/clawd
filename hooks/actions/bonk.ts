import { ARMS_UP, BLINK, type Action } from '../sprites'

// Clicked while editing: the hammer slips onto its own head. Ouch.
export const bonk: Action = ({ t }) => ({
  head: BLINK,
  arms: ARMS_UP,
  dx: t % 2 === 0 ? 1 : -1,
  fx: [[0, 4, t % 4 < 2 ? '*' : 'x']],
})
