import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { ROWS, frame, start, step } from './clawd'

const isHidden = atom({ plugin: 'clawd', key: 'isHidden' } as const, false)

export const register: Register = on => {
  let scene = start()
  // What the last render showed; the timer only ticks while Clawd is on screen.
  let shown: { columns: number; isWorking: boolean } | null = null

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'clawd', description: 'Show or hide Clawd above the prompt' })
    $.clock.every(100, () => {
      if (!shown) return
      scene = step(scene, shown.isWorking, shown.columns)
      $.ui.invalidate('ui.render')
    })

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
    const { Box, Text } = $.ui.resolve(e)

    // `claude` is the theme key the welcome screen paints Clawd with, so it is
    // the same orange in every theme and terminal.
    return (
      <Box flexDirection="column">
        {frame(scene, shown.isWorking, columns).map(row => (
          <Text wrap="truncate">
            {row.pad}
            <Text color="claude">{row.body}</Text>
            <Text dimColor>{row.zzz}</Text>
          </Text>
        ))}
      </Box>
    )
  })
}
