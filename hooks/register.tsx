import { atom, read, update } from 'claude-code'
import type { Hook, Register } from 'claude-code'

import { ROWS, activityOf, frame, isAsleep, poke, react, start, step, typed, type Activity, type Helper } from './clawd'
import { pick } from './palette'

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
  let shown: { columns: number; isWorking: boolean } | null = null
  // Tools running now, newest last: the newest picks Clawd's activity.
  const running: string[] = []
  // Subagents running now, workflow agents included: one helper Clawd each.
  const helpers = new Map<string, Helper>()
  const activity = (isWorking: boolean): Activity | null => {
    const tool = running[running.length - 1]
    if (tool) return activityOf(tool)
    return isWorking ? 'think' : null
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'clawd', description: 'Show or hide Clawd above the prompt' })
    $.clock.every(100, async () => {
      // Once a second, drop helpers whose subagent the engine lists as over.
      if (scene.t % 10 === 0 && helpers.size) await settle($, helpers)
      if (!shown) return
      scene = step(scene, activity(shown.isWorking), shown.columns)
      $.ui.invalidate('ui.render')
    })

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
    try {
      const result = await next(e)
      if ('isError' in result && result.isError) scene = react(scene, 'oops')
      return result
    } finally {
      running.splice(running.lastIndexOf(e.tool), 1)
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
      })
      $.ui.invalidate('ui.render')
    }
    return result
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId && helpers.has(e.agentId)) await settle($, helpers, e.agentId)
    // The main thread's answers only: not a subagent's, an abort or an error.
    if (!e.agentId && e.reason === 'answer') scene = react(scene, 'celebrate')
    return next(e)
  })

  on('command.run', { command: 'clawd' }, async $ => {
    const hidden = await update($, isHidden, v => !v)

    return { text: hidden ? 'Clawd is hiding.' : 'Clawd is back.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const columns = e.props.bodyColumns
    if (e.surface !== 'terminal' || e.props.hasSurvey || e.props.maxRows < ROWS || columns < 1 || (await read($, isHidden))) {
      shown = null
      return next(e)
    }
    shown = { columns, isWorking: e.props.isWorking }
    const { Box, Button, Text } = $.ui.resolve(e)
    const isWorking = shown.isWorking
    const onPress = () => {
      scene = poke(scene, activity(isWorking))
      $.ui.invalidate('ui.render')
    }

    // `claude` is the theme key the welcome screen paints Clawd with, so it is
    // the same orange in every theme and terminal. Clawd's own cells are plain
    // Buttons, so a click on it lands; the space around it is not.
    return (
      <Box flexDirection="column">
        {frame(scene, activity(isWorking), columns, [...helpers.values()]).map((row, r) => (
          <Box flexDirection="row">
            {row.map((seg, i) =>
              seg.tone === 'body' ? (
                <Button key={`clawd-${r}-${i}`} plain onPress={onPress}>
                  <Text color="claude">{seg.text}</Text>
                </Button>
              ) : seg.tone === 'helper' ? (
                <Text color={seg.color}>{seg.text}</Text>
              ) : (
                <Text dimColor={seg.tone === 'fx'}>{seg.text}</Text>
              ),
            )}
          </Box>
        ))}
      </Box>
    )
  })
}
