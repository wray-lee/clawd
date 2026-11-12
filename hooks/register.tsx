import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { ROWS, activityOf, frame, isAsleep, poke, react, start, step, typed, type Activity } from './clawd'

const isHidden = atom({ plugin: 'clawd', key: 'isHidden' } as const, false)

export const register: Register = on => {
  let scene = start()
  // What the last render showed; the timer only ticks while Clawd is on screen.
  let shown: { columns: number; isWorking: boolean } | null = null
  // Tools running now, newest last: the newest picks Clawd's activity.
  const running: string[] = []
  const activity = (isWorking: boolean): Activity | null => {
    const tool = running[running.length - 1]
    if (tool) return activityOf(tool)
    return isWorking ? 'think' : null
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'clawd', description: 'Show or hide Clawd above the prompt' })
    $.clock.every(100, () => {
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

  on('turn.complete', ($, e, next) => {
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
        {frame(scene, activity(isWorking), columns).map((row, r) => (
          <Box flexDirection="row">
            {row.map((seg, i) =>
              seg.tone === 'body' ? (
                <Button key={`clawd-${r}-${i}`} plain onPress={onPress}>
                  <Text color="claude">{seg.text}</Text>
                </Button>
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
