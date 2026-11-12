// How often Clawd's frame changes (each change is a redraw of the whole UI)
// and what working out one frame costs.
//
//   bun scripts/perf.ts
import { frame, start, step, type Helper } from '../hooks/clawd'

const changes = (s: ReturnType<typeof start>, ticks: number) => {
  let last = ''
  let n = 0
  for (let i = 0; i < ticks; i++) {
    s = step(s, null, 80)
    const key = JSON.stringify(frame(s, null, 80))
    if (key !== last) n++
    last = key
  }
  return n
}
console.log(`idle:   ${changes(start(), 600)} redraws a minute`)
console.log(`asleep: ${changes({ ...start(), idle: 1e6 }, 600)} redraws a minute`)

const crowd: Helper[] = Array.from({ length: 12 }, (_, i) => ({ id: `h${i}`, depth: 1, color: '#ff5f87', isWorkflow: i % 2 === 0 }))
for (const helpers of [[], crowd]) {
  let s = start()
  const t0 = performance.now()
  for (let i = 0; i < 10000; i++) {
    s = step(s, null, 120)
    JSON.stringify(frame(s, null, 120, helpers))
  }
  console.log(`a frame with ${helpers.length} helpers: ${((performance.now() - t0) / 10).toFixed(1)} µs`)
}
