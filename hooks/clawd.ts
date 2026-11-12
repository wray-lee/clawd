// The scene: what Clawd is doing and where, and how a frame is drawn. Each
// action's look lives in actions/; no `$` here, so tests drive it frame by frame.

import { actions, type ActionName } from './actions'
import { ARMS_DOWN, BLINK, HEAD, LEGS_A, MINI_BLINK, MINI_BODY, MINI_HEAD, MINI_W, TINY_BODY, TINY_HEAD, TINY_W, W, type Pose } from './sprites'

export { W }
export const ROWS = 4

const SLEEP_AFTER = 1200 // ticks idle (~2 min at 100ms) before a nap

// What Claude is doing right now, from the running tool; null between turns.
export type Activity = 'think' | 'shell' | 'read' | 'edit'
// Short reactions that play over everything else: to the session, then to a click.
const EVENT_TICKS = {
  celebrate: 20, oops: 10, wake: 8,
  pet: 12, spin: 10, shoo: 10, peek: 10, bonk: 10, highfive: 12,
} satisfies Partial<Record<ActionName, number>>
export type EventKind = keyof typeof EVENT_TICKS

// A click plays the reaction that fits what Clawd is doing.
const CLICK: Partial<Record<ActionName, EventKind>> = {
  sleep: 'wake', idle: 'pet', echo: 'pet',
  walk: 'spin', shell: 'shoo', read: 'peek', edit: 'bonk', celebrate: 'highfive',
}

const TYPING_TICKS = 15 // Clawd types along until 1.5s after your last key

export type Scene = {
  t: number
  x: number
  dir: 1 | -1
  idle: number // ticks since Claude last worked
  event: { kind: EventKind; until: number } | null
  typing: { keys: number; char: string; until: number } | null
}

export type Tone = 'body' | 'fx' | 'helper' | 'none'
export type Segment = { text: string; tone: Tone; color?: string }

// A running subagent, drawn as a small Clawd in its own color. depth 1 is one
// the main loop started; a subagent's own subagents are 2 and up, and smaller.
export type Helper = { id: string; parent?: string; depth: number; color: string }

// Helpers in the order they line up: each one's subagents right after it.
export function lineUp(helpers: Helper[]): Helper[] {
  const ids = new Set(helpers.map(h => h.id))
  const out: Helper[] = []
  const add = (h: Helper) => {
    out.push(h)
    for (const c of helpers) if (c.parent === h.id) add(c)
  }
  // A helper whose parent already finished stands in line on its own.
  for (const h of helpers) if (!h.parent || !ids.has(h.parent)) add(h)
  return out
}
export type Row = Segment[]

// Starts at the right edge: frame and step clamp x to the band's width.
export const start = (): Scene => ({ t: 0, x: Number.MAX_SAFE_INTEGER, dir: -1, idle: 0, event: null, typing: null })

export const isAsleep = (s: Scene, activity: Activity | null) => activity === null && s.idle >= SLEEP_AFTER

export const react = (s: Scene, kind: EventKind): Scene => ({
  ...s,
  idle: 0,
  dir: kind === 'spin' ? (s.dir === 1 ? -1 : 1) : s.dir,
  event: { kind, until: s.t + EVENT_TICKS[kind] },
})

// A click on Clawd: the reaction for what it is doing now; nothing over a
// reaction to the session that is still playing (oops, wake).
export function poke(s: Scene, activity: Activity | null): Scene {
  const kind = CLICK[actionFor(s, activity)]
  return kind ? react(s, kind) : s
}

// The person typed `text` into the prompt; a sleeping Clawd wakes first.
export function typed(s: Scene, text: string): Scene {
  const woken = isAsleep(s, null) ? react(s, 'wake') : s
  const keys = (s.typing?.keys ?? 0) + 1
  return { ...woken, idle: 0, typing: { keys, char: [...text].pop() ?? '', until: s.t + TYPING_TICKS } }
}

export function activityOf(tool: string): Activity {
  if (/^(Bash|BashOutput|KillShell|PowerShell)$/.test(tool)) return 'shell'
  if (/^(Read|Grep|Glob|LS|WebFetch|WebSearch|ToolSearch)$/.test(tool)) return 'read'
  if (/^(Edit|MultiEdit|Write|NotebookEdit)$/.test(tool)) return 'edit'
  return 'think'
}

const ACTIVITY_ACTION: Record<Activity, ActionName> = { think: 'walk', shell: 'shell', read: 'read', edit: 'edit' }

export function actionFor(s: Scene, activity: Activity | null): ActionName {
  if (s.event) return s.event.kind
  if (s.typing) return 'echo'
  if (activity) return ACTIVITY_ACTION[activity]
  return isAsleep(s, activity) ? 'sleep' : 'idle'
}

// One 100ms tick.
export function step(s: Scene, activity: Activity | null, columns: number): Scene {
  const t = s.t + 1
  const max = Math.max(0, columns - W)
  const event = s.event && t < s.event.until ? s.event : null
  const typing = s.typing && t < s.typing.until ? s.typing : null
  let { dir } = s
  let x = Math.min(s.x, max)
  // Only walks while thinking; at a tool it stops to work.
  if (activity === 'think' && !event && !typing && t % 2 === 0) {
    if (x + dir < 0 || x + dir > max) dir = dir === 1 ? -1 : 1
    x = Math.min(max, Math.max(0, x + dir))
  }
  const isQuiet = activity === null && !event && !typing
  return { t, x, dir, idle: isQuiet ? s.idle + 1 : 0, event, typing }
}

export function frame(s: Scene, activity: Activity | null, columns: number, helpers: Helper[] = []): Row[] {
  const chars = Array.from({ length: ROWS }, () => Array<string>(columns).fill(' '))
  const tones = Array.from({ length: ROWS }, () => Array<Tone>(columns).fill('none'))
  const colors = Array.from({ length: ROWS }, () => Array<string | undefined>(columns).fill(undefined))
  const put = (row: number, col: number, text: string, tone: Tone, color?: string) =>
    [...text].forEach((ch, i) => {
      const c = col + i
      if (ch === ' ' || row < 0 || row >= ROWS || c < 0 || c >= columns) return
      chars[row]![c] = ch
      tones[row]![c] = tone
      colors[row]![c] = color
    })

  const x0 = Math.min(s.x, Math.max(0, columns - W))
  const blink = s.t % 37 < 2 // a short blink every ~3.7s
  const pose: Pose = actions[actionFor(s, activity)]({ t: s.t, x: x0, columns, blink, typed: s.typing })
  const x = Math.max(0, x0 + (pose.dx ?? 0))
  const top = pose.top ?? 1

  put(top, x, pose.head ?? (blink ? BLINK : HEAD), 'body')
  put(top + 1, x, pose.arms ?? ARMS_DOWN, 'body')
  put(top + 2, x, pose.legs ?? LEGS_A, 'body')
  for (const [row, col, text] of pose.fx ?? []) put(row, x + col, text, 'fx')
  drawHelpers(s.t, x0, columns, lineUp(helpers), put)

  // Runs of one tone become one Text each, trailing blanks dropped.
  return chars.map((line, r) => {
    const row: Row = []
    line.forEach((ch, c) => {
      const tone = tones[r]![c]!
      const color = colors[r]![c]
      const last = row[row.length - 1]
      if (last && last.tone === tone && last.color === color) last.text += ch
      else row.push(color ? { text: ch, tone, color } : { text: ch, tone })
    })
    if (row[row.length - 1]?.tone === 'none') row.pop()
    return row
  })
}

// Helpers line up beside Clawd, on the side with more room, each hopping on
// its own beat. Those that do not fit show as a dim "+N".
function drawHelpers(t: number, x0: number, columns: number, line: Helper[],
  put: (row: number, col: number, text: string, tone: Tone, color?: string) => void) {
  const toLeft = x0 + W / 2 >= columns / 2
  let cursor = toLeft ? x0 - 1 : x0 + W + 1
  for (const [i, h] of line.entries()) {
    const w = h.depth > 1 ? TINY_W : MINI_W
    const col = toLeft ? cursor - w : cursor
    if (col < 0 || col + w > columns) {
      const more = `+${line.length - i}`
      put(3, toLeft ? Math.max(0, cursor - more.length) : cursor, more, 'fx')
      return
    }
    // Each hops and blinks on its own beat; two rows, so a hop lifts it one.
    const top = (t + i * 4) % 12 < 2 ? 1 : 2
    const blink = (t + i * 7) % 41 < 2
    if (h.depth > 1) {
      put(top, col, TINY_HEAD, 'helper', h.color)
      put(top + 1, col, TINY_BODY, 'helper', h.color)
    } else {
      put(top, col, blink ? MINI_BLINK : MINI_HEAD, 'helper', h.color)
      put(top + 1, col, MINI_BODY, 'helper', h.color)
    }
    cursor = toLeft ? col - 1 : col + w + 1
  }
}
