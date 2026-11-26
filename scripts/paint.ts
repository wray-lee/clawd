// A frame as ANSI text, colored the way this terminal draws the theme.
import type { Row } from '../hooks/clawd'

const THEME: Record<string, string> = { claude: '174', merged: '147', subtle: '244', text: '255' }

const sgr = (color: string, layer = 38) => {
  if (!color.startsWith('#')) return `\x1b[${layer};5;${THEME[color] ?? '250'}m`
  const n = parseInt(color.slice(1), 16)
  return `\x1b[${layer};2;${n >> 16};${(n >> 8) & 255};${n & 255}m`
}

// Clawd's body takes the theme's orange; Claude-chan's pixels bring their own
// colors, the lower one as the background.
export const paint = (rows: Row[]): string[] =>
  rows.map(row => row.map(seg => {
    if (seg.tone === 'none') return seg.text
    const bg = seg.bg ? sgr(seg.bg, 48) : ''
    return sgr(seg.color ?? (seg.tone === 'body' ? 'claude' : 'subtle')) + bg + seg.text + '\x1b[0m'
  }).join(''))
