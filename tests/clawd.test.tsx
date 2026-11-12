import { expect, test } from 'claude-code/testing'

import { actions, type ActionName } from '../hooks/actions'
import { FIDGET_COUNT, fidgetAt } from '../hooks/actions/idle'
import { HOLD, actionFor, activityNow, activityOf, drawHelpers, frame, lineUp, poke, react, start, step, typed, W, type Activity, type EventKind, type Helper, type Row } from '../hooks/clawd'
import { HAT, PALETTE, pick } from '../hooks/palette'

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

test('idle, Clawd fidgets every 8s, a different one each time, and naps after 10 minutes', async () => {
  const fidgets = Array.from({ length: 100 }, (_, n) => fidgetAt(n))
  expect(new Set(fidgets).size).toBe(FIDGET_COUNT) // every fidget turns up
  fidgets.slice(1).forEach((f, n) => expect(f).not.toBe(fidgets[n]))
  // Between fidgets it stands as the welcome screen draws it.
  expect(glyphs(frame({ ...start(), t: 50 }, null, 40))[1]).toContain('▐▛███▜▌')
  expect(actionFor(play(null, 5990), null)).toBe('idle')
  expect(actionFor(play(null, 6010), null)).toBe('sleep')
})

test('idle long enough means asleep with z, on the side that has room', async () => {
  const s = { ...play(null, 6100, 30), t: 18 }
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
  expect(actionFor(start(), activityOf('Read'))).toBe('read')
  expect(actionFor(start(), activityOf('Grep'))).toBe('search')
  expect(actionFor(start(), activityOf('WebSearch'))).toBe('search')
  expect(actionFor(start(), activityOf('WebFetch'))).toBe('fetch')
  expect(actionFor(start(), activityOf('TodoWrite'))).toBe('todo')
  expect(actionFor(start(), activityOf('TaskUpdate'))).toBe('todo')
  expect(actionFor(start(), activityOf('EnterPlanMode'))).toBe('plan')
  expect(activityNow(['Bash'], null, 0, true, true)).toBe('compact') // compacting comes first
  expect(actionFor(start(), activityOf('Edit'))).toBe('edit')
  expect(actionFor(start(), activityOf('Skill'))).toBe('skill')
  expect(actionFor(start(), activityOf('mcp__github__search_issues'))).toBe('mcp')
  expect(actionFor(start(), activityOf('Agent'))).toBe('walk')
  // A quick tool's action is held 1.5s after it started, then thinking resumes.
  const recent = { activity: activityOf('Grep'), until: 10 + HOLD }
  expect(activityNow([], recent, 10 + HOLD - 1, true)).toBe('search')
  expect(activityNow([], recent, 10 + HOLD, true)).toBe('think')
  expect(activityNow(['Bash'], recent, 11, true)).toBe('shell') // a running tool comes first
  expect(activityNow([], null, 0, false)).toBe(null)
  const s = react(start(), 'celebrate')
  expect(actionFor(s, 'shell')).toBe('celebrate')
  expect(actionFor(play('shell', 20, 40, s), 'shell')).toBe('shell') // over after 2s
})

const EVENTS = { celebrate: 1, oops: 1, wake: 1, pet: 1, spin: 1, shoo: 1, peek: 1, bonk: 1, highfive: 1, found: 1, poof: 1, zap: 1, hello: 1, shrug: 1, sad: 1 }

test('a click plays the reaction for what Clawd is doing', async () => {
  const clicked = (s: ReturnType<typeof start>, a: Activity | null) => poke(s, a).event?.kind
  expect(clicked(start(), null)).toBe('pet')
  expect(clicked(play(null, 6100), null)).toBe('wake')
  expect(clicked(start(), 'think')).toBe('spin')
  expect(clicked(start(), 'shell')).toBe('shoo')
  expect(clicked(start(), 'read')).toBe('peek')
  expect(clicked(start(), 'edit')).toBe('bonk')
  expect(clicked(start(), 'search')).toBe('found')
  expect(clicked(start(), 'skill')).toBe('poof')
  expect(clicked(start(), 'mcp')).toBe('zap')
  expect(clicked(start(), 'fetch')).toBe('peek')
  expect(clicked(start(), 'compact')).toBe('shoo')
  expect(clicked(start(), 'todo')).toBe('peek')
  expect(clicked(start(), 'plan')).toBe('peek')
  expect(clicked(react(start(), 'celebrate'), null)).toBe('highfive')
  expect(clicked(react(start(), 'oops'), null)).toBe('oops') // a startle is not cut short
  // A spin turns Clawd around.
  expect(poke(start(), 'think').dir).toBe(1)
})

test('typing makes Clawd type along, holding up the last key', async () => {
  let s = typed(typed(start(), 'h'), 'i')
  expect(actionFor(s, null)).toBe('echo')
  expect(s.typing?.keys).toBe(2)
  expect(glyphs(frame(s, null, 40))[0]).toContain('i')
  // Wide characters show as "~", never misaligning the band.
  expect(glyphs(frame(typed(start(), '你'), null, 40))[0]).toContain('~')
  // 1.5s after the last key it goes back to idling.
  expect(actionFor(play(null, 15, 40, s), null)).toBe('idle')
  // Typing wakes a sleeping Clawd.
  expect(typed(play(null, 6100), 'a').event?.kind).toBe('wake')
})

test('the hammer swings on the side that has room', async () => {
  const hammer = (x: number) => actions.edit({ t: 0, x, columns: 40, blink: false, typed: null }).fx!.map(f => f[1])
  expect(hammer(0).every(col => col >= W)).toBe(true) // room on the right
  expect(hammer(40 - W).every(col => col < 0)).toBe(true) // at the right edge, on the left
})

test('every action stays inside the band, at any width', async () => {
  for (const name of Object.keys(actions) as ActionName[]) {
    for (const columns of [4, 12, 40]) {
      for (let t = 0; t < 120; t++) {
        const x = t % 2 === 0 ? 0 : Number.MAX_SAFE_INTEGER
        const pose = actions[name]({ t, x: Math.min(x, Math.max(0, columns - W)), columns, blink: false, typed: { keys: t, char: 'a' } })
        for (const part of [pose.head, pose.arms, pose.legs]) if (part) expect([...part].length).toBe(W)
      }
    }
    // Drawn through the scene, nothing passes the width either.
    const s = name in EVENTS ? react(start(), name as EventKind) : start()
    for (const columns of [4, 12, 40]) {
      for (const row of glyphs(frame(s, null, columns))) expect([...row].length <= columns).toBe(true)
    }
  }
})

test('every action looks different from standing idle', async () => {
  const still = (n: ActionName) =>
    JSON.stringify(Array.from({ length: 60 }, (_, t) => actions[n]({ t, x: 10, columns: 40, blink: false, typed: null })))
  for (const name of Object.keys(actions) as ActionName[]) {
    if (name !== 'idle') expect(still(name) === still('idle')).toBe(false)
  }
})

const helper = (id: string, depth = 1, parent?: string): Helper => ({ id, parent, depth, color: 'success' })

// Each cell as tone and glyph, to compare two frames.
const cells = (rows: Row[]) => rows.map(r => r.flatMap(seg => [...seg.text].map(ch => `${seg.tone}:${ch}`)))

test('helpers and the corner label never cover Clawd or its effects', () => {
  const crowd = Array.from({ length: 12 }, (_, i) => ({ ...helper(`h${i}`, i % 4 === 3 ? 2 : 1), isWorkflow: i % 2 === 0 }))
  const ACTIVITIES: (Activity | null)[] = ['think', 'shell', 'read', 'fetch', 'search', 'edit', 'skill', 'mcp', 'compact', 'todo', 'plan', null]
  for (const columns of [30, 60, 120]) for (const x of [0, 6, columns - W]) for (const a of ACTIVITIES) for (const party of [false, true]) {
    for (let t = 0; t < 40; t++) {
      const s = { ...(party ? react(start(), 'celebrate') : start()), x, t }
      // Clawd steps clear of the label, so compare with it standing there alone.
      const labelW = drawHelpers(t, Math.min(x, columns - W), columns, lineUp(crowd), () => {})
      const at = labelW ? Math.min(x, Math.max(0, columns - labelW - 1 - W)) : x
      const alone = cells(frame({ ...s, x: at }, a, columns))
      const crowded = cells(frame(s, a, columns, crowd))
      alone.forEach((row, r) => row.forEach((cell, c) => {
        if (!cell.startsWith('none')) expect(`${columns}/${x}/${a}/${t}: ${crowded[r]![c]}`).toBe(`${columns}/${x}/${a}/${t}: ${cell}`)
      }))
    }
  }
})

test('each subagent gets a helper; a subagent\'s own ones are smaller', async () => {
  // Clawd at the right edge, so helpers line up on its left.
  const rows = glyphs(frame({ ...start(), t: 5 }, null, 40, [helper('a'), helper('b')]))
  expect(rows[2]!.split('▐▛█▜▌').length - 1).toBe(2)
  const nested = glyphs(frame({ ...start(), t: 5 }, null, 40, [helper('a'), helper('c', 2, 'a')]))
  expect(nested[2]).toContain('▛█▜')
  expect(nested[3]).toContain('▜▀▛')
  // A workflow's agent wears the purple hat; a plain subagent does not.
  const hatted = frame({ ...start(), t: 5 }, null, 40, [{ ...helper('w'), isWorkflow: true }, helper('s')])
  const hats = hatted[1]!.filter(seg => seg.text.includes('▟█▙'))
  expect(hats.length).toBe(1)
  expect(hats[0]!.color).toBe(HAT)
  // Three levels down and deeper, a single pixel each.
  const deep = glyphs(frame({ ...start(), t: 5 }, null, 40, [helper('a'), helper('c', 2, 'a'), helper('d', 3, 'c'), helper('e', 4, 'd')]))
  expect((deep[2]! + deep[3]!).split('▖').length - 1).toBe(2)
  // A child lines up right after its parent, an orphan on its own.
  const order = lineUp([helper('a'), helper('b'), helper('c', 2, 'a'), helper('d', 2, 'gone')]).map(h => h.id)
  expect(order.join()).toBe('a,c,b,d')
  // Too many for the band: the rest are counted under the "[-]" in two columns,
  // subagents then the workflow's agents, and nothing is drawn past the edge.
  const crowd = Array.from({ length: 12 }, (_, i) => ({ ...helper(`h${i}`), isWorkflow: i === 11 }))
  const narrow = glyphs(frame({ ...start(), t: 5 }, null, 20, crowd))
  for (const row of narrow) expect([...row].length <= 20).toBe(true)
  expect(narrow[0]!.trim()).toBe('') // row 0 stays free beside the "[-]"
  // Wide enough for all, still at most 8 drawn: 3 subagents and 1 workflow agent hidden.
  const wide = frame({ ...start(), t: 5 }, null, 200, crowd)
  const right = glyphs(wide).map(row => row.padEnd(200).slice(-5))
  expect(right.slice(1)).toEqual(['+3 +1', '▀▀ ▀ ', '▀    '])
  expect(wide[1]!.find(seg => seg.text === '+1')?.color).toBe(HAT)
  // Pixels (three levels down) don't count toward the 8: all 8 helpers and 5 pixels show.
  const deeps = [...crowd.slice(0, 8), ...Array.from({ length: 5 }, (_, i) => helper(`p${i}`, 3, 'h7'))]
  const roomy = glyphs(frame({ ...start(), t: 5 }, null, 200, deeps))
  expect(roomy[0]).not.toContain('+')
  expect((roomy[2]! + roomy[3]!).split('▖').length - 1).toBe(5)
})

test('helper colors come from the palette, all different until it runs out', async () => {
  const taken: string[] = []
  for (let i = 0; i < PALETTE.length; i++) taken.push(pick(taken))
  expect(new Set(taken).size).toBe(PALETTE.length)
  expect((PALETTE as readonly string[]).includes(pick(taken))).toBe(true)
  expect((PALETTE as readonly string[]).includes(HAT)).toBe(false) // a body never matches the hat
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
  on('agent.spawn', () => ({ model: 'haiku', agentId: 'sub1' }))
  // Listed as running, as a workflow agent is not: a turn's end alone keeps it.
  let listed = [{ id: 'sub1', status: 'running' as const, description: 'd', type: 'Explore' }]
  on('agent.list', () => ({ value: listed }))
  // Not interactive, so Clawd skips its hello and starts out idle.
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: false })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const texts = await ui.findAll({ type: 'Text', text: /▐▛███▜▌|▐█████▌/, in: 'clawd' })
  expect(texts.some(t => t.props.color === 'claude')).toBe(true) // the welcome screen's own orange
  // A click on the empty band does nothing; one on Clawd's body pets it: happy eyes.
  await ui.pointer({ type: 'down', x: 0, y: 1, button: 'left' })
  await ui.redraw()
  expect(await ui.find({ type: 'Text', text: /▐▟███▙▌/, in: 'clawd' })).toBe(undefined)
  await ui.pointer({ type: 'down', x: 40 - W + 2, y: 1, button: 'left' })
  await ui.redraw()
  expect(await ui.find({ type: 'Text', text: /▐▟███▙▌/, in: 'clawd' })).not.toBe(undefined)
  await ui.unmount()

  // A finished turn shows happy eyes.
  await $.turn.complete({ answer: 'done', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' })
  const happy = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await happy.find({ type: 'Text', text: /▐▟███▙▌/, in: 'clawd' })).not.toBe(undefined)
  await happy.unmount()

  // A subagent starts: a helper in a palette color; it finishes: gone.
  await $.agent.spawn({
    tool_use_id: 'tu1', prompt: 'p', description: 'd', subagentType: 'Explore',
    provider: { plugin: 'engine', tier: 'core' }, parentModel: 'opus', background: true, fork: false,
  })
  const busy = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const minis = await busy.findAll({ type: 'Text', text: /▐▛█▜▌|▐███▌/, in: 'clawd' })
  expect(minis.some(t => (PALETTE as readonly string[]).includes(String(t.props.color)))).toBe(true)
  await busy.unmount()
  const end = { answer: 'ok', durationMs: 1, isAborted: false, turnId: 't2', reason: 'answer', agentId: 'sub1' } as const
  await $.turn.complete(end)
  const waiting = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await waiting.find({ type: 'Text', text: /▐▛█▜▌|▐███▌/, in: 'clawd' })).not.toBe(undefined)
  await waiting.unmount()
  listed = []
  await $.turn.complete(end)
  const done = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await done.find({ type: 'Text', text: /▐▛█▜▌|▐███▌/, in: 'clawd' })).toBe(undefined)
  await done.unmount()

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
