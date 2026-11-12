import { ARMS_UP, LOOK_L, LOOK_R, type Action } from '../sprites'

// Waiting: blinks, glances left and right now and then, hops and waves every ~6s.
export const idle: Action = ({ t, blink }) => {
  const hop = t % 60 >= 57
  const glance = t % 90
  const head = blink ? undefined : glance >= 20 && glance < 26 ? LOOK_L : glance >= 26 && glance < 32 ? LOOK_R : undefined
  return { head, arms: hop ? ARMS_UP : undefined, top: hop ? 0 : 1 }
}
