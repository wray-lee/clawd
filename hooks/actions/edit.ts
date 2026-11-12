import { ARMS_DOWN, ARMS_UP, type Action } from '../sprites'

// Editing files: arms hammer down, a spark flies on each hit.
export const edit: Action = ({ t }) => {
  const hit = t % 4 < 2
  return {
    arms: hit ? ARMS_DOWN : ARMS_UP,
    fx: hit ? [t % 8 < 4 ? [1, -1, '*'] : [1, 9, '*']] : [],
  }
}
