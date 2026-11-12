import { TYPE_L, TYPE_R, type Action } from '../sprites'

// Running a command: hands take turns typing, a cursor blinks above.
export const shell: Action = ({ t }) => ({
  arms: t % 2 === 0 ? TYPE_L : TYPE_R,
  fx: [[0, 3, t % 10 < 5 ? '>_' : '>']],
})
