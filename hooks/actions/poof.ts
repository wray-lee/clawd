import { BLINK, type Action } from '../sprites'

// A click while casting: the spell goes poof. Eyes squeezed shut, a puff of
// smoke spreads and thins out.
export const poof: Action = ({ t }) => {
  const puff = t % 10 < 5 ? '~*~' : '. ~ .'
  return {
    head: BLINK,
    dx: t % 2 === 0 ? 1 : -1,
    fx: [[0, 4 - Math.floor(puff.length / 2), puff], [2, -1, '~'], [2, 9, '~']],
  }
}
