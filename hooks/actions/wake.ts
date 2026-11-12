import { ARMS_UP, HEAD, type Action } from '../sprites'

// Woken by a new prompt: eyes wide, arms up, "!".
export const wake: Action = () => ({ head: HEAD, arms: ARMS_UP, fx: [[0, 4, '!']] })
