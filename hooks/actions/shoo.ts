import { ARMS_DOWN, ARMS_UP, type Action } from '../sprites'

// Clicked while running a command: waves you off, busy.
export const shoo: Action = ({ t }) => ({
  arms: t % 2 === 0 ? ARMS_UP : ARMS_DOWN,
  fx: [[0, 3, t % 6 < 3 ? '!?' : '?!']],
})
