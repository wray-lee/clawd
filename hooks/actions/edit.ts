import { ARMS_DOWN, ARMS_UP, W, type Action, type Fx } from '../sprites'

const HEAD = '#bcbcbc' // the hammer's steel
const WOOD = '#af875f' // and its handle

// Editing files: swings a hammer up, then down onto the work with a spark.
// It swings on whichever side has room.
export const edit: Action = ({ t, x, columns }) => {
  const right = x + W + 5 <= columns
  const hit = t % 4 < 2
  const fx: Fx[] = right
    ? hit
      ? [[2, 9, '▄▄', WOOD], [2, 11, '█▌', HEAD], [3, 11, '▀▘', HEAD], [2, 13, '*']]
      : [[1, 9, '▄▄', HEAD], [2, 9, '▐▌', WOOD]] // the handle under the head's middle
    : hit
      ? [[2, -2, '▄▄', WOOD], [2, -4, '▐█', HEAD], [3, -4, '▝▀', HEAD], [2, -5, '*']]
      : [[1, -2, '▄▄', HEAD], [2, -2, '▐▌', WOOD]]
  return { arms: hit ? ARMS_DOWN : ARMS_UP, fx }
}
