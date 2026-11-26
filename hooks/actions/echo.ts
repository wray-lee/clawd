import { HAPPY, TYPE_L, TYPE_R, keyGlyph, type Action } from '../sprites'

// You are typing: Clawd types along, one hand per key, and holds up the last
// character you typed (see keyGlyph).
export const echo: Action = ({ typed, blink }) => {
  const keys = typed?.keys ?? 0
  return {
    head: keys % 7 === 6 && !blink ? HAPPY : undefined,
    arms: keys % 2 === 0 ? TYPE_L : TYPE_R,
    fx: [[0, 4, keyGlyph(typed?.char ?? '')]],
  }
}
