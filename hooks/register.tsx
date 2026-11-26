import { atom, read, update } from 'claude-code'
import type { Hook, Register } from 'claude-code'

import { MORPH_TICKS, chanFrame, sizeFor } from './chan'
import { HOLD, ROWS, W, activityNow, activityOf, frame, isAsleep, poke, react, runsOf, start, step, tap, toneAt, typed, type Activity, type Helper, type Recent, type Row } from './clawd'
import { pick } from './palette'

const NO_ROOM = 'Claude-chan needs 12 free rows above the prompt: make the window taller.'

const isHidden = atom({ plugin: 'clawd', key: 'isHidden' } as const, false)

// A subagent's turn can end while it still waits on background work, so the
// engine's list decides when one is over. Workflow agents are not on it:
// their turn's end is their end.
const ALIVE = new Set(['pending', 'running', 'waiting'])
async function settle($: Parameters<Hook<'turn.complete'>>[0], helpers: Map<string, Helper>, ended?: string) {
  const listed = new Map((await $.agent.list()).map(a => [a.id, a.status]))
  let changed = false
  for (const id of [...helpers.keys()]) {
    const status = listed.get(id)
    if (status ? !ALIVE.has(status) : id === ended) changed = helpers.delete(id) || changed
  }
  if (changed) $.ui.invalidate('ui.render')
}

export const register: Register = on => {
  let scene = start()
  // What the last render showed; the timer only ticks while Clawd is on screen.
  let shown: { columns: number; isWorking: boolean; maxRows: number } | null = null
  // Claude-chan in Clawd's place, the easter egg; kept in $.store across sessions.
  let isChan = false
  let drawn: Row[] = [] // the last frame, to tell what a click hit
  let drawnKey = '' // and as text, to tell whether a tick changed it
  // Tools running now, newest last: the newest picks Clawd's activity.
  const running: string[] = []
  // Subagents running now, workflow agents included: one helper Clawd each.
  const helpers = new Map<string, Helper>()
  let recent: Recent = null // the last tool started, held on screen a moment
  let greet = false // say hi the first time the band shows, if a person is there
  let compacting = 0 // compactions of the main conversation running now
  const activity = (isWorking: boolean): Activity | null => activityNow(running, recent, scene.t, isWorking, compacting > 0)
  // Claude-chan (or the switch to or from her) at the biggest size that fits, else Clawd.
  const chanSize = (s: NonNullable<typeof shown>) => (isChan || scene.morph ? sizeFor(s.maxRows) : undefined)
  const draw = (s: NonNullable<typeof shown>) => {
    const size = chanSize(s)
    const now = activity(s.isWorking)
    return size ? chanFrame(scene, now, s.columns, [...helpers.values()], size) : frame(scene, now, s.columns, [...helpers.values()])
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'clawd',
      description: 'Show or hide Clawd above the prompt; with chan, switch to Claude-chan and back',
      argumentHint: '[chan]',
    })
    isChan = (await $.store.get('isChan')) === true
    $.clock.every(100, async () => {
      // Once a second, drop helpers whose subagent the engine lists as over.
      if (scene.t % 10 === 0 && helpers.size) await settle($, helpers)
      if (!shown) return
      scene = step(scene, activity(shown.isWorking), shown.columns, chanSize(shown)?.w ?? W)
      // Redraw only when the frame changed: idle, most ticks look the same.
      const key = JSON.stringify(draw(shown))
      if (key !== drawnKey) $.ui.invalidate('ui.render')
    })

    greet = e.isInteractive
    return next(e)
  })

  on('prompt.submit', ($, e, next) => {
    if (isAsleep(scene, null)) scene = react(scene, 'wake')
    return next(e)
  })

  // Typing in the prompt: Clawd types along. Observes only; the edit goes on as made.
  on('prompt.edit', ($, e, next) => {
    if (e.inputText) scene = typed(scene, e.inputText)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    running.push(e.tool)
    recent = { activity: activityOf(e.tool), until: scene.t + HOLD }
    try {
      const result = await next(e)
      if ('isError' in result && result.isError) scene = react(scene, 'oops')
      return result
    } finally {
      running.splice(running.lastIndexOf(e.tool), 1)
    }
  })

  // The main conversation compacting (not a subagent's, nor one ahead of time).
  on('session.compact', async ($, e, next) => {
    if (e.agentId || e.trigger === 'precompute') return next(e)
    compacting++
    $.ui.invalidate('ui.render')
    try {
      return await next(e)
    } finally {
      compacting--
    }
  })

  on('agent.spawn', async ($, e, next) => {
    const result = await next(e)
    if ('agentId' in result && result.agentId) {
      const parent = e.parentAgentId ? helpers.get(e.parentAgentId) : undefined
      helpers.set(result.agentId, {
        id: result.agentId,
        parent: e.parentAgentId,
        depth: (parent?.depth ?? 0) + 1,
        color: pick([...helpers.values()].map(h => h.color)),
        isWorkflow: !!e.workflow,
      })
      $.ui.invalidate('ui.render')
    }
    return result
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId && helpers.has(e.agentId)) await settle($, helpers, e.agentId)
    // The main thread's answers only: not a subagent's, an abort or an error.
    // The main thread's turn: celebrate an answer, shrug at an interrupt, and
    // look sad at an error or a refusal.
    if (!e.agentId) scene = react(scene, e.reason === 'answer' ? 'celebrate' : e.reason === 'aborted' ? 'shrug' : 'sad')
    return next(e)
  })

  // A click in the band, from ./view.ts: only one on Clawd's own body counts.
  on('ui.message', async ($, e, next) => {
    if (e.element !== 'clawd') return next(e)
    const { x, y } = (e.data ?? {}) as { x?: number; y?: number }
    if (shown && typeof x === 'number' && typeof y === 'number' && toneAt(drawn, x, y) === 'body') {
      const { scene: tapped, isEgg } = tap(poke(scene, activity(shown.isWorking)))
      scene = tapped
      if (isEgg) {
        // Too few rows for even her small size: say so, or the clicks look ignored.
        if (!swap()) $.ui.toast(NO_ROOM)
        await $.store.set('isChan', isChan)
      }
      $.ui.invalidate('ui.render')
    }
    return {}
  })

  // Clawd to Claude-chan or back, through the puff of smoke; the caller keeps
  // the choice in $.store. False when she is coming and has no room to show.
  const swap = () => {
    isChan = !isChan
    scene = { ...scene, morph: { until: scene.t + MORPH_TICKS, toChan: isChan } }
    return !isChan || !shown || !!chanSize(shown)
  }

  on('command.run', { command: 'clawd' }, async ($, e) => {
    if (e.args.trim() === 'chan') {
      const fits = swap()
      await $.store.set('isChan', isChan)
      $.ui.invalidate('ui.render')
      return { text: !isChan ? 'Clawd is back.' : fits ? 'Claude-chan is here.' : NO_ROOM }
    }
    const hidden = await update($, isHidden, v => !v)

    return { text: hidden ? 'Clawd is hiding.' : 'Clawd is back.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const columns = e.props.bodyColumns
    if (e.surface !== 'terminal' || e.props.hasSurvey || e.props.maxRows < ROWS || columns < 1 || (await read($, isHidden))) {
      shown = null
      return next(e)
    }
    shown = { columns, isWorking: e.props.isWorking, maxRows: e.props.maxRows }
    if (greet) {
      greet = false
      scene = react(scene, 'hello')
    }
    drawn = draw(shown)
    drawnKey = JSON.stringify(drawn)
    const { Client } = $.ui.resolve(e)

    // Drawn by ./view.ts in a region of its own: a press there can't select
    // Clawd's text, and a click comes back as a ui.message.
    return <Client key="clawd" module="./view.ts" props={{ rows: drawn.map(runsOf) }} width={columns} height={drawn.length} />
  })
}
