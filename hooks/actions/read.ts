import { LOOK_L, LOOK_R, TYPE_L, TYPE_R, W, type Action, type Fx } from '../sprites'

const COVER = '#af875f'
const PAGE = '#e4e4e4'

// Reading files: holds the open pages beside it, on the side with room, eyes
// on them; every two seconds a page stands up at the spine as it turns.
export const read: Action = ({ t, x, columns, blink }) => {
  const right = x + W + 5 <= columns
  const at = right ? 9 : -5
  const fx: Fx[] = [
    [1, at, '▗▄ ▄▖', PAGE],
    [2, at, '██▐██', PAGE],
    [3, at, '▀▀▀▀▀', COVER],
  ]
  if (t % 20 >= 17) fx.push([0, at + 2, '▗', PAGE], [1, at + 2, '█', PAGE])
  const look = right ? LOOK_R : LOOK_L
  return { head: blink ? undefined : look, arms: right ? TYPE_R : TYPE_L, fx }
}
