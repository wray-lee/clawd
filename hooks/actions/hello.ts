import { ARMS_DOWN, HAPPY, TYPE_R, type Action } from '../sprites'

// The session starts: happy eyes, waving one arm, "hi".
export const hello: Action = ({ t }) => ({
  head: HAPPY,
  arms: t % 4 < 2 ? TYPE_R : ARMS_DOWN,
  fx: [[0, 3, 'hi!']],
})
