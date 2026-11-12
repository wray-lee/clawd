// Writes every action as ANSI frames, one file per frame, for render.sh.
//
//   bun scripts/frames.ts <out dir>
//
// Also writes picks.txt (the frame of each action for actions.png) and
// ranges.txt (each action's first frame and length, for the GIF's grid).
import { mkdirSync, writeFileSync } from 'node:fs'
import { frame, react, start, typed } from '../hooks/clawd'
import { fidgetAt } from '../hooks/actions/idle'
import { paint } from './paint'

const out = process.argv[2]!
mkdirSync(out, { recursive: true })

const COLS = 44
// When fidget k (hooks/actions/idle.ts) first plays: the last 2s of an 8s gap.
const fidget = (k: number) => 60 + 80 * Array.from({ length: 100 }, (_, n) => fidgetAt(n)).indexOf(k)
type Shot = { label: string; activity: string | null; event?: string; typing?: boolean; ticks: number; pick: number; t0?: number; asleep?: boolean }
const SHOTS: Shot[] = [
  { label: 'thinking: walks', activity: 'think', ticks: 24, pick: 10 },
  { label: 'shell: types', activity: 'shell', ticks: 20, pick: 6 },
  { label: 'reading: read files', activity: 'read', ticks: 20, pick: 6 },
  { label: 'web fetch: download bar', activity: 'fetch', ticks: 24, pick: 6 },
  { label: 'search: magnifying glass', activity: 'search', ticks: 28, pick: 10 },
  { label: 'editing: hammers away', activity: 'edit', ticks: 20, pick: 6 },
  { label: 'skill: casts a spell', activity: 'skill', ticks: 24, pick: 8 },
  { label: 'MCP: antenna waves', activity: 'mcp', ticks: 24, pick: 10 },
  { label: 'compacting: squeezed', activity: 'compact', ticks: 24, pick: 5 },
  { label: 'task list: ticks boxes', activity: 'todo', ticks: 32, pick: 10 },
  { label: 'plan mode: draws a blueprint', activity: 'plan', ticks: 18, pick: 10 },
  { label: 'you type: types along', activity: null, typing: true, ticks: 20, pick: 6 },
  { label: 'turn done: confetti', activity: null, event: 'celebrate', ticks: 20, pick: 7 },
  { label: 'tool failed: oops', activity: null, event: 'oops', ticks: 10, pick: 2 },
  { label: 'interrupted: shrugs', activity: null, event: 'shrug', ticks: 12, pick: 2 },
  { label: 'API error: sad', activity: null, event: 'sad', ticks: 16, pick: 5 },
  { label: 'session start: says hi', activity: null, event: 'hello', ticks: 16, pick: 1 },
  { label: 'idle: dances', activity: null, ticks: 20, pick: 6, t0: fidget(4) },
  { label: 'idle: yawns', activity: null, ticks: 20, pick: 4, t0: fidget(6) },
  { label: 'idle 10 min: naps', activity: null, ticks: 24, pick: 15, asleep: true },
]
const picks: string[] = []
const ranges: string[] = []
let n = 0
for (const shot of SHOTS) {
  let s: any = { ...start(), x: 14 }
  if (shot.asleep) s = { ...s, idle: 1e6 }
  picks.push(String(n + shot.pick).padStart(4, '0'))
  ranges.push(`${n}:${shot.ticks}`)
  for (let t = 0; t < shot.ticks; t++) {
    s = { ...s, t: (shot.t0 ?? 3) + t }
    if (shot.event && t === 0) s = react(s, shot.event)
    if (shot.typing && t % 3 === 0) s = typed(s, 'clawd'[(t / 3) % 5])
    if (shot.activity === 'think') s = { ...s, x: 14 + (Math.floor(t / 2) % 6) }
    const rows = paint(frame(s, shot.activity, COLS))
    const text = ['', ...rows, '', `  \x1b[38;5;250m${shot.label}\x1b[0m`].join('\n')
    writeFileSync(`${out}/${String(n++).padStart(4, '0')}.ans`, text)
  }
}
writeFileSync(`${out}/picks.txt`, picks.join(' '))
writeFileSync(`${out}/ranges.txt`, ranges.join(' '))
console.log(n)
