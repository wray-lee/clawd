// A frame as ANSI text, colored the way this terminal draws the theme.
import type { Row } from '../hooks/clawd'

const THEME: Record<string, string> = { claude: '174', merged: '147', subtle: '244', text: '255' }

const sgr = (color: string) => {
  if (!color.startsWith('#')) return `\x1b[38;5;${THEME[color] ?? '250'}m`
  const n = parseInt(color.slice(1), 16)
  return `\x1b[38;2;${n >> 16};${(n >> 8) & 255};${n & 255}m`
}

export const paint = (rows: Row[]): string[] =>
  rows.map(row => row.map(seg => {
    if (seg.tone === 'none') return seg.text
    return sgr(seg.tone === 'body' ? 'claude' : (seg.color ?? 'subtle')) + seg.text + '\x1b[0m'
  }).join(''))
