// The scene: what Clawd is doing and where, and how a frame is drawn. Each
// action's look lives in actions/; no `$` here, so tests drive it frame by frame.

import { actions, type ActionName } from './actions'
import { ARMS_DOWN, BLINK, HEAD, LEGS_A, W, type Pose } from './sprites'

export { W }
export const ROWS = 4

const SLEEP_AFTER = 1200 // ticks idle (~2 min at 100ms) before a nap

// What Claude is doing right now, from the running tool; null between turns.
export type Activity = 'think' | 'shell' | 'read' | 'edit'
// Short reactions that play over everything else.
export type EventKind = 'celebrate' | 'oops' | 'wake'
const EVENT_TICKS: Record<EventKind, number> = { celebrate: 20, oops: 10, wake: 8 }

export type Scene = {
  t: number
  x: number
  dir: 1 | -1
  idle: number // ticks since Claude last worked
  event: { kind: EventKind; until: number } | null
}

export type Tone = 'body' | 'fx' | 'none'
export type Segment = { text: string; tone: Tone }
export type Row = Segment[]

// Starts at the right edge: frame and step clamp x to the band's width.
export const start = (): Scene => ({ t: 0, x: Number.MAX_SAFE_INTEGER, dir: -1, idle: 0, event: null })

export const isAsleep = (s: Scene, activity: Activity | null) => activity === null && s.idle >= SLEEP_AFTER

export const react = (s: Scene, kind: EventKind): Scene => ({
  ...s,
  idle: 0,
  event: { kind, until: s.t + EVENT_TICKS[kind] },
})

export function activityOf(tool: string): Activity {
  if (/^(Bash|BashOutput|KillShell|PowerShell)$/.test(tool)) return 'shell'
  if (/^(Read|Grep|Glob|LS|WebFetch|WebSearch|ToolSearch)$/.test(tool)) return 'read'
  if (/^(Edit|MultiEdit|Write|NotebookEdit)$/.test(tool)) return 'edit'
  return 'think'
}

const ACTIVITY_ACTION: Record<Activity, ActionName> = { think: 'walk', shell: 'shell', read: 'read', edit: 'edit' }

export function actionFor(s: Scene, activity: Activity | null): ActionName {
  if (s.event) return s.event.kind
  if (activity) return ACTIVITY_ACTION[activity]
  return isAsleep(s, activity) ? 'sleep' : 'idle'
}

// One 100ms tick.
export function step(s: Scene, activity: Activity | null, columns: number): Scene {
  const t = s.t + 1
  const max = Math.max(0, columns - W)
  const event = s.event && t < s.event.until ? s.event : null
  let { dir } = s
  let x = Math.min(s.x, max)
  // Only walks while thinking; at a tool it stops to work.
  if (activity === 'think' && !event && t % 2 === 0) {
    if (x + dir < 0 || x + dir > max) dir = dir === 1 ? -1 : 1
    x = Math.min(max, Math.max(0, x + dir))
  }
  return { t, x, dir, idle: activity === null && !event ? s.idle + 1 : 0, event }
}

export function frame(s: Scene, activity: Activity | null, columns: number): Row[] {
  const chars = Array.from({ length: ROWS }, () => Array<string>(columns).fill(' '))
  const tones = Array.from({ length: ROWS }, () => Array<Tone>(columns).fill('none'))
  const put = (row: number, col: number, text: string, tone: Tone) =>
    [...text].forEach((ch, i) => {
      const c = col + i
      if (ch === ' ' || row < 0 || row >= ROWS || c < 0 || c >= columns) return
      chars[row]![c] = ch
      tones[row]![c] = tone
    })

  const x0 = Math.min(s.x, Math.max(0, columns - W))
  const blink = s.t % 37 < 2 // a short blink every ~3.7s
  const pose: Pose = actions[actionFor(s, activity)]({ t: s.t, x: x0, columns, blink })
  const x = Math.max(0, x0 + (pose.dx ?? 0))
  const top = pose.top ?? 1

  put(top, x, pose.head ?? (blink ? BLINK : HEAD), 'body')
  put(top + 1, x, pose.arms ?? ARMS_DOWN, 'body')
  put(top + 2, x, pose.legs ?? LEGS_A, 'body')
  for (const [row, col, text] of pose.fx ?? []) put(row, x + col, text, 'fx')

  // Runs of one tone become one Text each, trailing blanks dropped.
  return chars.map((line, r) => {
    const row: Row = []
    line.forEach((ch, c) => {
      const tone = tones[r]![c]!
      const last = row[row.length - 1]
      if (last && last.tone === tone) last.text += ch
      else row.push({ text: ch, tone })
    })
    if (row[row.length - 1]?.tone === 'none') row.pop()
    return row
  })
}
