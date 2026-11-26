// The scene: what Clawd is doing and where, and how a frame is drawn. Each
// action's look lives in actions/; no `$` here, so tests drive it frame by frame.

import { actions, type ActionName } from './actions'
import { HAT, fxColor } from './palette'
import type { Run } from './view'
import { ARMS_DOWN, BLINK, HEAD, LEGS_A, MINI_BLINK, MINI_BODY, MINI_HAT, MINI_HEAD, MINI_W, PIXEL, TINY_BODY, TINY_HAT, TINY_HEAD, TINY_W, W, BIG_HAT, type Pose } from './sprites'

export { W }
export const ROWS = 4

const SLEEP_AFTER = 6000 // ticks idle (10 min at 100ms) before a nap

// What Claude is doing right now, from the running tool; null between turns.
export type Activity = 'think' | 'shell' | 'read' | 'fetch' | 'search' | 'edit' | 'skill' | 'mcp' | 'compact' | 'todo' | 'plan'
// Short reactions that play over everything else: to the session, then to a click.
const EVENT_TICKS = {
  celebrate: 20, oops: 10, wake: 8, hello: 16, shrug: 12, sad: 16,
  pet: 12, spin: 10, shoo: 10, peek: 10, bonk: 10, highfive: 12, found: 12, poof: 10, zap: 10,
} satisfies Partial<Record<ActionName, number>>
export type EventKind = keyof typeof EVENT_TICKS

// A click plays the reaction that fits what Clawd is doing.
const CLICK: Partial<Record<ActionName, EventKind>> = {
  sleep: 'wake', idle: 'pet', echo: 'pet',
  walk: 'spin', shell: 'shoo', read: 'peek', edit: 'bonk', celebrate: 'highfive',
  search: 'found', skill: 'poof', mcp: 'zap', fetch: 'peek', compact: 'shoo', todo: 'peek', plan: 'peek',
}

const TYPING_TICKS = 15 // Clawd types along until 1.5s after your last key

export type Scene = {
  t: number
  x: number
  dir: 1 | -1
  idle: number // ticks since Claude last worked
  event: { kind: EventKind; until: number } | null
  typing: { keys: number; char: string; until: number } | null
  taps: number // quick clicks on the body in a row, for the easter egg
  tapAt: number // the tick of the last one
  morph: { until: number; toChan: boolean } | null // the switch to Claude-chan or back, playing
}

export type Tone = 'body' | 'fx' | 'helper' | 'none'
export type Segment = { text: string; tone: Tone; color?: string; bg?: string }

// A running subagent, drawn as a small Clawd in its own color. depth 1 is one
// the main loop started; a subagent's own subagents are 2 and up, and smaller.
// A workflow's agents wear a purple hat.
export type Helper = { id: string; parent?: string; depth: number; color: string; isWorkflow?: boolean }

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
export const start = (): Scene => ({ t: 0, x: Number.MAX_SAFE_INTEGER, dir: -1, idle: 0, event: null, typing: null, taps: 0, tapAt: 0, morph: null })

// The easter egg: this many clicks on the body, each within TAP_GAP ticks of
// the last, switches between Clawd and Claude-chan.
export const TAPS = 7
const TAP_GAP = 6

// A click on the body: counts it, and says whether it completed the egg.
export function tap(s: Scene): { scene: Scene; isEgg: boolean } {
  const taps = s.taps && s.t - s.tapAt <= TAP_GAP ? s.taps + 1 : 1
  return taps >= TAPS ? { scene: { ...s, taps: 0 }, isEgg: true } : { scene: { ...s, taps, tapAt: s.t }, isEgg: false }
}

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
  if (/^(Grep|Glob|WebSearch|ToolSearch)$/.test(tool)) return 'search'
  if (/^(Read|LS)$/.test(tool)) return 'read'
  if (tool === 'WebFetch') return 'fetch'
  if (/^(Edit|MultiEdit|Write|NotebookEdit)$/.test(tool)) return 'edit'
  if (tool === 'Skill') return 'skill'
  if (/^(TodoWrite|TaskCreate|TaskUpdate|TaskList|TaskGet)$/.test(tool)) return 'todo'
  if (/^(EnterPlanMode|ExitPlanMode)$/.test(tool)) return 'plan'
  if (tool.startsWith('mcp__')) return 'mcp'
  return 'think'
}

// A tool's action plays for at least this many ticks (1.5s), so a quick
// search or skill is seen and not just a flicker.
export const HOLD = 15
export type Recent = { activity: Activity; until: number } | null

// What Clawd acts out now: compacting while the conversation compacts, else
// the newest running tool, else the last tool while its hold lasts, else
// thinking while Claude works.
export function activityNow(running: readonly string[], recent: Recent, t: number, isWorking: boolean, isCompacting = false): Activity | null {
  if (isCompacting) return 'compact'
  const tool = running[running.length - 1]
  if (tool) return activityOf(tool)
  if (recent && t < recent.until) return recent.activity
  return isWorking ? 'think' : null
}

const ACTIVITY_ACTION: Record<Activity, ActionName> = {
  think: 'walk', shell: 'shell', read: 'read', fetch: 'fetch', search: 'search', edit: 'edit', skill: 'skill', mcp: 'mcp', compact: 'compact', todo: 'todo', plan: 'plan',
}

export function actionFor(s: Scene, activity: Activity | null): ActionName {
  if (s.event) return s.event.kind
  if (s.typing) return 'echo'
  if (activity) return ACTIVITY_ACTION[activity]
  return isAsleep(s, activity) ? 'sleep' : 'idle'
}

// One 100ms tick.
export function step(s: Scene, activity: Activity | null, columns: number, w = W): Scene {
  const t = s.t + 1
  const max = Math.max(0, columns - w)
  const morph = s.morph && t < s.morph.until ? s.morph : null
  const live = s.event && t < s.event.until ? s.event : null
  // The switch over, whoever it brought in says hi, unless a reaction is playing.
  const event = s.morph && !morph && !live ? { kind: 'hello' as const, until: t + EVENT_TICKS.hello } : live
  const typing = s.typing && t < s.typing.until ? s.typing : null
  let { dir } = s
  // While switching, Clawd and she each keep their place: no clamping to the
  // other's width, which would make Clawd jump as the smoke starts.
  let x = morph ? s.x : Math.min(s.x, max)
  // Only walks while thinking; at a tool it stops to work.
  if (activity === 'think' && !event && !typing && !morph && t % 2 === 0) {
    if (x + dir < 0 || x + dir > max) dir = dir === 1 ? -1 : 1
    x = Math.min(max, Math.max(0, x + dir))
  }
  const isQuiet = activity === null && !event && !typing
  return { ...s, t, x, dir, idle: isQuiet ? s.idle + 1 : 0, event, typing, morph }
}

export type Put = (row: number, col: number, text: string, tone: Tone, color?: string, soft?: boolean, bg?: string) => void

// A blank band to draw on: `put` draws, `rows` reads it back as runs of one
// tone and color each, trailing blanks dropped.
export function canvas(height: number, columns: number): { put: Put; rows: () => Row[] } {
  const cells = Array.from({ length: height }, () => Array.from({ length: columns }, (): Segment => ({ text: ' ', tone: 'none' })))
  // A soft put (the corner label) leaves cells already drawn alone.
  const put: Put = (row, col, text, tone, color, soft = false, bg) =>
    [...text].forEach((ch, i) => {
      const c = col + i
      if (ch === ' ' || row < 0 || row >= height || c < 0 || c >= columns) return
      if (soft && cells[row]![c]!.tone !== 'none') return
      cells[row]![c] = { text: ch, tone, color, bg }
    })
  const rows = () => cells.map(line => {
    const row: Row = []
    for (const { text, tone, color, bg } of line) {
      const last = row[row.length - 1]
      if (last && last.tone === tone && last.color === color && last.bg === bg) last.text += text
      else row.push({ text, tone, ...(color && { color }), ...(bg && { bg }) })
    }
    if (row[row.length - 1]?.tone === 'none') row.pop()
    return row
  })
  return { put, rows }
}

export function frame(s: Scene, activity: Activity | null, columns: number, helpers: Helper[] = []): Row[] {
  const { put, rows } = canvas(ROWS, columns)
  const line = lineUp(helpers)
  let x0 = Math.min(s.x, Math.max(0, columns - W))
  // With helpers hidden, Clawd stands clear of their label under the "[-]".
  const labelW = drawHelpers(s.t, x0, columns, line, () => {})
  if (labelW) x0 = Math.min(x0, Math.max(0, columns - labelW - 1 - W))
  const blink = s.t % 53 < 2 // a short blink every ~5s
  const pose: Pose = actions[actionFor(s, activity)]({ t: s.t, x: x0, columns, blink, typed: s.typing })
  const x = Math.max(0, x0 + (pose.dx ?? 0))
  const top = pose.top ?? 1

  put(top, x, pose.head ?? (blink ? BLINK : HEAD), 'body')
  put(top + 1, x, pose.arms ?? ARMS_DOWN, 'body')
  put(top + 2, x, pose.legs ?? LEGS_A, 'body')
  for (const [row, col, text, color] of pose.fx ?? []) [...text].forEach((ch, i) => put(row, x + col + i, ch, 'fx', color ?? fxColor(ch)))
  drawHelpers(s.t, x0, columns, line, put)
  return rows()
}

// Helpers line up beside Clawd, on the side with more room, each hopping on
// its own beat. At most MAX_SHOWN are drawn (pixels, 1 column and rare, don't
// count), and only those that fit. The rest are counted under the engine's
// "[-]" in two narrow columns, subagents then a workflow's agents: "+N" (hat
// purple for the workflow's) and below it a pixel in each one's color.
const MAX_SHOWN = 8
export const FX_REACH = 5

// `big` (beside Claude-chan) makes each helper one size bigger: a subagent is
// a whole Clawd, its own subagents the sizes a subagent's were.
export function drawHelpers(t: number, x0: number, columns: number, line: Helper[], put: Put, w = W, big = false): number {
  const toLeft = x0 + w / 2 >= columns / 2
  // Clawd's effects (a hammer, z's, confetti) reach FX_REACH columns past its
  // body; helpers start beyond them, so none is ever covered.
  const start = toLeft ? x0 - 1 - FX_REACH : x0 + w + 1 + FX_REACH
  // 0 a whole Clawd, 1 mini, 2 tiny, 3 a pixel.
  const sizeOf = (h: Helper) => Math.min(3, h.depth - (big ? 1 : 0))
  const widthOf = (h: Helper) => [W, MINI_W, TINY_W, 1][sizeOf(h)]!
  // How many fit in order, from Clawd outward, short of column `end` on the right.
  const fit = (end: number) => {
    let cursor = start
    let n = 0
    let counted = 0
    for (const h of line) {
      const w = widthOf(h)
      const col = toLeft ? cursor - w : cursor
      if (sizeOf(h) < 3 && ++counted > MAX_SHOWN) break
      if (col < 0 || col + w > end) break
      cursor = toLeft ? col - 1 : col + w + 1
      n++
    }
    return n
  }
  // The label for the hidden helpers: [row, offset, text, color] parts, and its
  // width. Each column is "+N" on row 1, then rows 2 and 3 of pixels as wide.
  const labelOf = (hidden: Helper[]) => {
    const parts: [number, number, string, string][] = []
    let w = 0
    for (const isWorkflow of [false, true]) {
      const group = hidden.filter(h => !!h.isWorkflow === isWorkflow)
      if (!group.length) continue
      if (w) w += 1
      const tag = `+${group.length}`
      const cw = Math.max(2, tag.length)
      parts.push([1, w, tag, isWorkflow ? HAT : 'text'])
      group.slice(0, 2 * cw).forEach((h, i) => parts.push([2 + Math.floor(i / cw), w + (i % cw), '▀', h.color]))
      w += cw
    }
    return { parts, w }
  }
  let shown = fit(columns)
  // On the right, keep the label's corner clear of helpers.
  if (shown < line.length && !toLeft) shown = Math.min(shown, fit(columns - labelOf(line.slice(shown)).w - 1))
  const { parts, w: labelW } = labelOf(line.slice(shown))

  let cursor = start
  for (const [i, h] of line.slice(0, shown).entries()) {
    const w = widthOf(h)
    const col = toLeft ? cursor - w : cursor
    // Each hops and blinks on its own beat; two rows, so a hop lifts it one.
    const top = (t + i * 4) % 12 < 2 ? 1 : 2
    const blink = (t + i * 7) % 53 < 2
    const size = sizeOf(h)
    if (size === 3) put(top + 1, col, PIXEL, 'helper', h.color)
    else if (size === 0) {
      // Three rows: standing on the bottom row, a hop lifts it one.
      if (h.isWorkflow) put(top - 2, col, BIG_HAT, 'helper', HAT)
      put(top - 1, col, blink ? BLINK : HEAD, 'helper', h.color)
      put(top, col, ARMS_DOWN, 'helper', h.color)
      put(top + 1, col, LEGS_A, 'helper', h.color)
    } else if (size === 2) {
      if (h.isWorkflow) put(top - 1, col, TINY_HAT, 'helper', HAT)
      put(top, col, TINY_HEAD, 'helper', h.color)
      put(top + 1, col, TINY_BODY, 'helper', h.color)
    } else {
      if (h.isWorkflow) put(top - 1, col, MINI_HAT, 'helper', HAT)
      put(top, col, blink ? MINI_BLINK : MINI_HEAD, 'helper', h.color)
      put(top + 1, col, MINI_BODY, 'helper', h.color)
    }
    cursor = toLeft ? col - 1 : col + w + 1
  }
  if (!parts.length) return 0
  // The label, drawn last; soft, so it never covers Clawd's effects.
  const at = Math.max(0, columns - labelW)
  for (const [row, dx, text, color] of parts) put(row, at + dx, text, 'helper', color, true)
  return labelW
}

// What the cell at column x of row y shows, for a click on the band.
export function toneAt(rows: Row[], x: number, y: number): Tone {
  let c = 0
  for (const seg of rows[y] ?? []) {
    c += [...seg.text].length
    if (x < c) return seg.tone
  }
  return 'none'
}

// A row as ./view.ts draws it: Clawd in the theme's `claude` orange (the
// welcome screen's), Claude-chan's pixels, helpers and effects in their own
// colors, the rest dim.
export function runsOf(row: Row): Run[] {
  return row.map(({ text, tone, color, bg }) =>
    tone === 'none' ? { text } : { text, color: color ?? (tone === 'body' ? 'claude' : 'subtle'), ...(bg && { bg }) })
}
