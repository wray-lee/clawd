// Every action Clawd can play. To add one: write actions/<name>.ts exporting an
// Action, list it here, and pick it in clawd.ts (`actionFor`, or `CLICK` for a
// reaction to a click).
import { bonk } from './bonk'
import { celebrate } from './celebrate'
import { echo } from './echo'
import { edit } from './edit'
import { highfive } from './highfive'
import { idle } from './idle'
import { oops } from './oops'
import { peek } from './peek'
import { pet } from './pet'
import { read } from './read'
import { shell } from './shell'
import { shoo } from './shoo'
import { sleep } from './sleep'
import { spin } from './spin'
import { wake } from './wake'
import { walk } from './walk'

export const actions = {
  // what Claude is doing
  walk, shell, read, edit,
  // between turns
  idle, sleep, echo,
  // reactions to the session
  celebrate, oops, wake,
  // reactions to a click
  pet, spin, shoo, peek, bonk, highfive,
}
export type ActionName = keyof typeof actions
