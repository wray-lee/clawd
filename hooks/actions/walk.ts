import { ARMS_DOWN, ARMS_UP, LEGS_A, LEGS_B, type Action } from '../sprites'

// Thinking: walks back and forth, arms swinging with each step.
export const walk: Action = ({ t }) => {
  const stride = Math.floor(t / 2) % 2 === 0
  return { arms: stride ? ARMS_UP : ARMS_DOWN, legs: stride ? LEGS_A : LEGS_B }
}
