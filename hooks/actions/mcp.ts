import { TYPE_L, TYPE_R, type Action } from '../sprites'

// Calling an MCP server: an antenna on its head sends out waves both ways
// while its hands work the keys.
export const mcp: Action = ({ t }) => {
  const reach = Math.floor(t / 3) % 3 // 0, 1 or 2 rings out
  const out = (side: 1 | -1) =>
    Array.from({ length: reach + 1 }, (_, i): [number, number, string] => [0, 4 + side * (2 + i * 2), side > 0 ? ')' : '('])
  return {
    arms: t % 2 === 0 ? TYPE_L : TYPE_R,
    fx: [[0, 4, '|'], ...out(1), ...out(-1)],
  }
}
