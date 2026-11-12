import { HEAD, type Action } from '../sprites'

// A tool failed: a startled "!" and a little shake.
export const oops: Action = ({ t }) => ({ head: HEAD, dx: t % 2 === 0 ? 1 : -1, fx: [[0, 4, '!']] })
