// Every action Clawd can play. To add one: write actions/<name>.ts exporting an
// Action, list it here, and pick it in clawd.ts (`actionFor`, or `CLICK` for a
// reaction to a click).
import { bonk } from './bonk'
import { celebrate } from './celebrate'
import { compact } from './compact'
import { echo } from './echo'
import { edit } from './edit'
import { fetch } from './fetch'
import { found } from './found'
import { hello } from './hello'
import { highfive } from './highfive'
import { idle } from './idle'
import { mcp } from './mcp'
import { oops } from './oops'
import { peek } from './peek'
import { pet } from './pet'
import { plan } from './plan'
import { poof } from './poof'
import { read } from './read'
import { sad } from './sad'
import { search } from './search'
import { shell } from './shell'
import { shoo } from './shoo'
import { shrug } from './shrug'
import { skill } from './skill'
import { sleep } from './sleep'
import { spin } from './spin'
import { todo } from './todo'
import { wake } from './wake'
import { walk } from './walk'
import { zap } from './zap'

export const actions = {
  // what Claude is doing
  walk, shell, read, fetch, search, edit, skill, mcp, compact, todo, plan,
  // between turns
  idle, sleep, echo,
  // reactions to the session
  celebrate, oops, wake, hello, shrug, sad,
  // reactions to a click
  pet, spin, shoo, peek, bonk, highfive, found, poof, zap,
}
export type ActionName = keyof typeof actions
