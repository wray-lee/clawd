import { LOOK_L, LOOK_R, type Action } from '../sprites'

// A click while on an MCP call: the line crackles. Static over the antenna,
// eyes darting left and right.
export const zap: Action = ({ t }) => ({
  head: t % 4 < 2 ? LOOK_L : LOOK_R,
  dx: t % 3 === 0 ? 1 : 0,
  fx: [[0, 4, '|'], [0, t % 2 === 0 ? 1 : 2, t % 2 === 0 ? '#~' : '~#'], [0, t % 2 === 0 ? 6 : 7, t % 2 === 0 ? '~#' : '#~']],
})
