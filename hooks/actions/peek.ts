import { BLINK, HEAD, type Action } from '../sprites'

// Clicked while reading: looks up from the page at you, blinks twice.
export const peek: Action = ({ t }) => ({
  head: t % 4 === 1 ? BLINK : HEAD,
  top: 0,
  fx: [[1, 10, 'o.o']],
})
