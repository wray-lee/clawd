import { TYPE_L, TYPE_R, type Action } from '../sprites'

const BOX = '#87afd7'
const TICK = '#87d75f'

// Writing the task list: three boxes above its head get ticked one by one.
export const todo: Action = ({ t }) => {
  const done = Math.floor(t / 4) % 4 // 0 to 3 ticked
  return {
    arms: t % 2 === 0 ? TYPE_L : TYPE_R,
    fx: [0, 1, 2].flatMap((i): [number, number, string, string][] => [
      [0, i * 3, '[', BOX], [0, i * 3 + 1, i < done ? 'x' : ' ', TICK], [0, i * 3 + 2, ']', BOX],
    ]),
  }
}
