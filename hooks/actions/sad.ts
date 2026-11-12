import { DOWN, type Action } from '../sprites'

const TEAR = '#5fafff'

// The turn ended in an error or a refusal: eyes cast down, a tear rolls
// down beside its face.
export const sad: Action = ({ t }) => {
  const fell = Math.floor(t / 4) % 3 // rows 1 to 3
  return { head: DOWN, fx: [[1 + fell, -1, fell === 2 ? '.' : fell ? ',' : "'", TEAR]] }
}
