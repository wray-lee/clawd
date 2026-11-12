import { HAPPY, TYPE_L, TYPE_R, type Action } from '../sprites'

// You are typing: Clawd types along, one hand per key, and holds up the last
// character you typed (ASCII only; anything wider shows as "~").
export const echo: Action = ({ typed, blink }) => {
  const keys = typed?.keys ?? 0
  const char = typed && /^[\x21-\x7e]$/.test(typed.char) ? typed.char : '~'
  return {
    head: keys % 7 === 6 && !blink ? HAPPY : undefined,
    arms: keys % 2 === 0 ? TYPE_L : TYPE_R,
    fx: [[0, 4, char]],
  }
}
