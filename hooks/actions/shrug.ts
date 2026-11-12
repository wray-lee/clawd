import { ARMS_DOWN, ARMS_UP, LOOK_L, LOOK_R, type Action } from '../sprites'

// You interrupted the turn: a shrug, arms up and down, eyes aside, "-.-".
export const shrug: Action = ({ t }) => ({
  head: t < 6 ? LOOK_L : LOOK_R,
  arms: t % 6 < 3 ? ARMS_UP : ARMS_DOWN,
  fx: [[0, 3, '-.-']],
})
