import { expect, test } from 'claude-code/testing'

import { actions, type ActionName } from './actions'
import { actionFor, activityOf, frame, react, start, step, W, type Activity, type Row } from './clawd'

const BAND = {
  plugin: 'clawd',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 20,
    bodyColumns: 40,
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const glyphs = (rows: Row[]) => rows.map(r => r.map(seg => seg.text).join(''))
const play = (activity: Activity | null, ticks: number, columns = 40, s = start()) => {
  for (let i = 0; i < ticks; i++) s = step(s, activity, columns)
  return s
}

test('Clawd starts at the right edge', async () => {
  const rows = glyphs(frame({ ...start(), t: 5 }, null, 40))
  expect(rows[1]!.indexOf('▐')).toBe(40 - W + 1)
})

test('thinking walks and turns at the edge; tools stand still', async () => {
  let s = start()
  for (let i = 0; i < 200; i++) {
    s = step(s, 'think', 20)
    expect(s.x >= 0 && s.x <= 20 - W).toBe(true)
  }
  expect(s.idle).toBe(0)
  expect(play('shell', 50, 20, s).x).toBe(s.x)
})

test('idle long enough means asleep with z, on the side that has room', async () => {
  const s = { ...play(null, 1300, 30), t: 18 }
  expect(actionFor(s, null)).toBe('sleep')
  const rows = glyphs(frame(s, null, 30))
  expect(rows[1]).toContain('▐█████▌') // eyes closed
  // At the right edge the z's float to the left.
  expect(rows[0]!.indexOf('z') < rows[1]!.indexOf('▐')).toBe(true)
})

test('awake Clawd looks like the welcome screen', async () => {
  const rows = glyphs(frame({ ...start(), t: 5 }, null, 12))
  expect(rows[1]).toContain('▐▛███▜▌')
  expect(rows[2]).toContain('▝▜█████▛▘')
})

test('each tool picks its action, and events play over it', async () => {
  expect(actionFor(start(), activityOf('Bash'))).toBe('shell')
  expect(actionFor(start(), activityOf('Grep'))).toBe('read')
  expect(actionFor(start(), activityOf('Edit'))).toBe('edit')
  expect(actionFor(start(), activityOf('Agent'))).toBe('walk')
  const s = react(start(), 'celebrate')
  expect(actionFor(s, 'shell')).toBe('celebrate')
  expect(actionFor(play('shell', 20, 40, s), 'shell')).toBe('shell') // over after 2s
})

test('every action stays inside the band, at any width', async () => {
  for (const name of Object.keys(actions) as ActionName[]) {
    for (const columns of [4, 12, 40]) {
      for (let t = 0; t < 120; t++) {
        const x = t % 2 === 0 ? 0 : Number.MAX_SAFE_INTEGER
        const pose = actions[name]({ t, x: Math.min(x, Math.max(0, columns - W)), columns, blink: false })
        for (const part of [pose.head, pose.arms, pose.legs]) if (part) expect([...part].length).toBe(W)
      }
    }
    // Drawn through the scene, nothing passes the width either.
    const s = name === 'celebrate' || name === 'oops' || name === 'wake' ? react(start(), name) : start()
    for (const columns of [4, 12, 40]) {
      for (const row of glyphs(frame(s, null, columns))) expect([...row].length <= columns).toBe(true)
    }
  }
})

test('every action looks different from standing idle', async () => {
  const still = (n: ActionName) =>
    JSON.stringify(Array.from({ length: 60 }, (_, t) => actions[n]({ t, x: 10, columns: 40, blink: false })))
  for (const name of Object.keys(actions) as ActionName[]) {
    if (name !== 'idle') expect(still(name) === still('idle')).toBe(false)
  }
})

test('the band draws Clawd in the theme orange and hides on /clawd', async ($, on) => {
  on('command.register', () => ({ value: { command: 'clawd' } }))
  on('clock.every', () => ({ value: undefined }))
  // Stands for the engine's own band, which a hidden Clawd hands back to.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.complete', () => ({ text: '' }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  // The row's outer Text matches too; the colored one is the inner slice.
  const texts = await ui.findAll({ type: 'Text', text: /▐▛███▜▌/ })
  expect(texts.some(t => t.props.color === 'claude')).toBe(true) // the welcome screen's own orange
  await ui.unmount()

  // A finished turn shows happy eyes.
  await $.turn.complete({ answer: 'done', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' })
  const happy = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await happy.find({ type: 'Text', text: /▐▟███▙▌/ })).not.toBe(undefined)
  await happy.unmount()

  await $.command.run({
    command: 'clawd',
    args: '',
    origin: { kind: 'plugin', name: 'test' },
    presentation: { isFullscreen: false, columns: 80 },
  })
  const hidden = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await hidden.find({ type: 'Text', text: /▐/ })).toBe(undefined)
  expect((await hidden.find({ type: 'Text' }))?.text).toBe('engine')
  await hidden.unmount()
})
