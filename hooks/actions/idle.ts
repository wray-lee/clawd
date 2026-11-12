import { ARMS_UP, LOOK_L, LOOK_R, type Action } from '../sprites'

// Waiting: blinks, glances left and right now and then, hops and waves every
// ~10s. Slow on purpose: each change is a redraw, and idle is most of the day.
export const idle: Action = ({ t, blink }) => {
  const hop = t % 100 >= 97
  const glance = t % 120
  const head = blink ? undefined : glance >= 20 && glance < 26 ? LOOK_L : glance >= 26 && glance < 32 ? LOOK_R : undefined
  return { head, arms: hop ? ARMS_UP : undefined, top: hop ? 0 : 1 }
}
