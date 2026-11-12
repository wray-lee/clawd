import { ARMS_UP, type Action, type Fx } from '../sprites'

// Up the left side, over the head, down the right: where the spell's sparks fly.
const RING: [number, number][] = [[2, -1], [1, -1], [0, 0], [0, 2], [0, 4], [0, 6], [0, 8], [1, 9], [2, 9]]

// Using a skill: arms up, casting; two comets of sparks circle its head.
export const skill: Action = ({ t }) => {
  const spark = (lead: number): Fx[] =>
    ['*', '+', '.'].map((ch, i) => {
      const [row, col] = RING[(lead - i + RING.length) % RING.length]!
      return [row, col, ch]
    })
  const lead = Math.floor(t / 2) % RING.length
  return { arms: ARMS_UP, fx: [...spark(lead), ...spark(lead + Math.floor(RING.length / 2))] }
}
