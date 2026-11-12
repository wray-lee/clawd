// Every action Clawd can play. To add one: write actions/<name>.ts exporting an
// Action, list it here, and pick it in clawd.ts `actionFor`.
import { celebrate } from './celebrate'
import { edit } from './edit'
import { idle } from './idle'
import { oops } from './oops'
import { read } from './read'
import { shell } from './shell'
import { sleep } from './sleep'
import { wake } from './wake'
import { walk } from './walk'

export const actions = { walk, shell, read, edit, celebrate, oops, wake, sleep, idle }
export type ActionName = keyof typeof actions
