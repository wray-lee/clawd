import { BLINK, W, type Action, type Fx } from '../sprites'

// Long idle: eyes shut, z's drift up on whichever side has room.
export const sleep: Action = ({ t, x, columns }) => {
  const right = x + W + 4 <= columns
  const at = (offset: number, back: number) => (right ? W + offset : -back)
  const phase = Math.floor(t / 10) % 4 // a z a second: few redraws while asleep
  const fx: Fx[] = []
  if (phase >= 1) fx.push([1, at(0, 1), 'z'])
  if (phase >= 2) fx.push([0, at(1, 2), 'z'])
  if (phase >= 3) fx.push([0, at(3, 4), 'Z'])
  return { head: BLINK, fx }
}
