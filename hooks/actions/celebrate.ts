import { PALETTE } from '../palette'
import { ARMS_UP, HAPPY, type Action, type Fx } from '../sprites'

// Confetti pieces on both sides: column from Clawd's left edge, and a phase so
// they don't fall in step.
const PIECES = [[-4, 0], [-2, 2], [-3, 3], [10, 1], [12, 3], [11, 0]] as const
const FLUTTER = ['▘', '▝', '▗', '▖']

// A turn finished: happy eyes, arms up, hopping while confetti falls.
export const celebrate: Action = ({ t }) => ({
  head: HAPPY,
  arms: ARMS_UP,
  top: t % 6 < 3 ? 0 : 1,
  fx: PIECES.map(([col, phase], i): Fx => {
    const fall = Math.floor(t / 2) + phase
    return [fall % 4, col, FLUTTER[(fall + i) % 4]!, PALETTE[(i * 5) % PALETTE.length]]
  }),
})
