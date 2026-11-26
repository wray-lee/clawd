// The surface module that draws the band, in a Client's own region. There the
// pointer is the module's: a press can't start a text selection, so Clawd is
// never highlighted (inverted) or copied, and a left click is posted to the
// hooks module with its cell, which decides what it hit.
import type { ClientModule } from 'claude-code'

// One run of cells: its text, its color (absent: blank cells), and the color
// behind it (Claude-chan's lower pixels).
export type Run = { text: string; color?: string; bg?: string }
export type ViewProps = { rows: Run[][] }

const ClawdView: ClientModule<ViewProps> = (props, surface) => {
  const { Box, Text } = surface.elements
  surface.onPointer(e => {
    if (e.type === 'down' && e.button === 'left') surface.post({ x: e.x, y: e.y })
  })
  return Box({
    flexDirection: 'column',
    children: props.rows.map(runs =>
      Box({
        flexDirection: 'row',
        height: 1,
        children: runs.map(({ text, color, bg }) =>
          color ? Text({ children: [text], color, ...(bg && { backgroundColor: bg }) }) : Box({ width: text.length, height: 1, flexShrink: 0 }),
        ),
      }),
    ),
  })
}
export default ClawdView
