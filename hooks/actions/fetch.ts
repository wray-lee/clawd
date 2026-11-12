import { LOOK_L, LOOK_R, type Action } from '../sprites'

const BAR = '#5fd7ff'
const FILL = '#87d75f'

// Fetching a web page: a download bar above its head fills up, over and over,
// while its eyes watch it go.
export const fetch: Action = ({ t, blink }) => {
  const done = Math.floor(t / 2) % 6 // 0 to 5 of 5 cells
  return {
    head: blink ? undefined : done < 3 ? LOOK_L : LOOK_R,
    fx: [[0, 1, '[', BAR], [0, 2, '='.repeat(done), FILL], [0, 2 + done, '.'.repeat(5 - done), BAR], [0, 7, ']', BAR]],
  }
}
