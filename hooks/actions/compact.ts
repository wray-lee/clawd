import { ARMS_UP, BLINK, type Action } from '../sprites'

const PRESS = '#d7afff'

// The conversation is being compacted: arrows press in from both sides and
// Clawd squeezes its eyes shut on each squeeze.
export const compact: Action = ({ t }) => {
  const near = t % 8 < 4 ? 0 : 1 // the arrows close in, then back off
  return {
    head: near ? BLINK : undefined,
    arms: near ? ARMS_UP : undefined,
    fx: [[1, -3 + near, '>>', PRESS], [1, 10 - near, '<<', PRESS]],
  }
}
