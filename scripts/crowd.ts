// A crowd of 14 helpers at 100 and 60 columns, as ANSI text: crowd.png.
//
//   bun scripts/crowd.ts > crowd.ans
import { frame, start, type Helper } from '../hooks/clawd'
import { PALETTE } from '../hooks/palette'
import { paint } from './paint'

const crowd: Helper[] = Array.from({ length: 14 }, (_, i) => ({
  id: `h${i}`,
  depth: i % 5 === 4 ? 2 : 1,
  parent: i % 5 === 4 ? `h${i - 1}` : undefined,
  color: PALETTE[i % PALETTE.length]!,
  isWorkflow: i % 3 === 0,
}))
for (const columns of [100, 60]) {
  console.log([...paint(frame({ ...start(), t: 5 }, null, columns, crowd)), `\x1b[38;5;244m${'─'.repeat(columns)}\x1b[0m`, ''].join('\n'))
}
