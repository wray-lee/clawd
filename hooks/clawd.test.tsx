import { expect, test } from 'claude-code/testing'

import { frame, start, step } from './clawd'

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

const glyphs = (rows: ReturnType<typeof frame>) => rows.map(r => r.pad + r.body + r.zzz)

test('working walks and turns at the edge', async () => {
  let s = start()
  for (let i = 0; i < 200; i++) {
    s = step(s, true, 20)
    expect(s.x >= 0 && s.x <= 20 - 9).toBe(true)
  }
  expect(s.idle).toBe(0)
})

test('idle long enough means asleep with z', async () => {
  let s = start()
  for (let i = 0; i < 1300; i++) s = step(s, false, 30)
  const rows = glyphs(frame({ ...s, t: 18 }, false, 30))
  expect(rows.join('').includes('z')).toBe(true)
  expect(rows[1]).toContain('▐█████▌') // eyes closed
})

test('awake Clawd looks like the welcome screen', async () => {
  const rows = glyphs(frame({ ...start(), t: 5 }, false, 12))
  expect(rows[1]).toContain('▐▛███▜▌')
  expect(rows[2]).toContain('▝▜█████▛▘')
})

test('a band narrower than Clawd never draws past its width', async () => {
  for (const row of glyphs(frame({ ...start(), x: 30 }, true, 4))) expect(row.length <= 4).toBe(true)
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
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  // The row's outer Text matches too; the colored one is the inner slice.
  const texts = await ui.findAll({ type: 'Text', text: /▐▛███▜▌/ })
  expect(texts.some(t => t.props.color === 'claude')).toBe(true) // the welcome screen's own orange
  await ui.unmount()

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
