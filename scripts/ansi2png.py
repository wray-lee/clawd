# ANSI text (Clawd frames, or `tmux capture-pane -e` of a session) -> PNG.
#
#   python3 scripts/ansi2png.py <in.ans> <out.png> [--session] [--size WxH]
#
# --session crops a capture to Clawd's band, the prompt and the agent list.
# --size pads the image to a fixed size, so frames line up in a GIF.
#
# Block characters (halves, quadrants, eighths) are drawn as rectangles on the
# cell grid, as a terminal draws them: rows meet with no seam and no overlap.
# Text is drawn by the font. Needs ImageMagick 7 with Pango and the JetBrains
# Mono font.
import argparse, html, os, re, subprocess, tempfile

BASE16 = ['#1e1e1e', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#dcdfe4',
          '#5c6370', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#ffffff']
FG, BG = '#dcdfe4', '#1e1e1e'
SGR = re.compile(r'(\x1b\[[0-9;]*m)')
CELL_W, CELL_H = 12, 27  # JetBrains Mono at 15pt

# Each block character as rectangles in eighths of a cell: (x0, y0, x1, y1).
def _rects():
    q = {'▘': [(0, 0, 4, 4)], '▝': [(4, 0, 8, 4)], '▖': [(0, 4, 4, 8)], '▗': [(4, 4, 8, 8)]}
    out = {'▀': [(0, 0, 8, 4)], '▐': [(4, 0, 8, 8)], '▔': [(0, 0, 8, 1)], '▕': [(7, 0, 8, 8)]}
    for i, ch in enumerate('▁▂▃▄▅▆▇█'): out[ch] = [(0, 7 - i, 8, 8)]
    for i, ch in enumerate('▉▊▋▌▍▎▏'): out[ch] = [(0, 0, 7 - i, 8)]
    for ch, parts in {'▙': '▘▖▗', '▛': '▘▝▖', '▜': '▘▝▗', '▟': '▝▖▗', '▚': '▘▗', '▞': '▝▖'}.items():
        out[ch] = [r for p in parts for r in q[p]]
    return {**q, **out}
RECTS = _rects()


def c256(n):
    if n < 16: return BASE16[n]
    if n < 232:
        n -= 16
        v = [0, 95, 135, 175, 215, 255]
        return '#%02x%02x%02x' % (v[n // 36], v[n // 6 % 6], v[n % 6])
    g = 8 + (n - 232) * 10
    return '#%02x%02x%02x' % (g, g, g)


def cells(line):
    """Each character of a line with its color, dimness and boldness."""
    out, fg, dim, bold = [], None, False, False
    for part in SGR.split(line):
        if part.startswith('\x1b['):
            codes = [int(c) if c else 0 for c in part[2:-1].split(';')]
            i = 0
            while i < len(codes):
                c = codes[i]
                if c == 0: fg, dim, bold = None, False, False
                elif c == 1: bold = True
                elif c == 2: dim = True
                elif c == 22: dim = bold = False
                elif c == 39: fg = None
                elif 30 <= c <= 37: fg = BASE16[c - 30]
                elif 90 <= c <= 97: fg = BASE16[c - 82]
                elif c in (38, 48) and codes[i + 1:i + 2] == [5]:
                    if c == 38: fg = c256(codes[i + 2])
                    i += 2
                elif c in (38, 48) and codes[i + 1:i + 2] == [2]:
                    if c == 38: fg = '#%02x%02x%02x' % tuple(codes[i + 2:i + 5])
                    i += 4
                i += 1
        else:
            out += [(ch, fg or FG, dim, bold) for ch in part]
    return out


def markup(row):
    """A row's text as Pango markup; blocks are left blank for the rectangles."""
    spans = []
    for ch, fg, dim, bold in row:
        attrs = f' foreground="{fg}"' + (' alpha="55%"' if dim else '') + (' weight="bold"' if bold else '')
        spans.append(f'<span{attrs}>{html.escape(" " if ch in RECTS else ch)}</span>')
    return ''.join(spans) or ' '


def blocks(rows):
    """The rows' block characters as ImageMagick draw primitives."""
    draw = []
    for y, row in enumerate(rows):
        for x, (ch, fg, dim, _) in enumerate(row):
            for x0, y0, x1, y1 in RECTS.get(ch, []):
                px = lambda e, size: round(e * size / 8)
                draw.append(f'fill {fg} fill-opacity {0.55 if dim else 1} rectangle '
                            f'{x * CELL_W + px(x0, CELL_W)},{y * CELL_H + px(y0, CELL_H)} '
                            f'{x * CELL_W + px(x1, CELL_W) - 1},{y * CELL_H + px(y1, CELL_H) - 1}')
    return draw


def crop(lines):
    """A session capture cut to Clawd's band, the prompt and the agent list."""
    plain = [SGR.sub('', l) for l in lines]
    p = max(i for i, l in enumerate(plain) if l.startswith('❯'))
    # Band rows hold at most short effects (z Z, >_, +N); tips and spinners hold words.
    rows = [i for i in range(max(0, p - 10), p - 1) if not re.search(r'[A-Za-z]{3,}', plain[i])]
    while rows and not plain[rows[-1]].strip(): rows.pop()  # the blank gap above the separator
    band = [lines[i] for i in rows[-4:]]
    keep = [''] * (5 - len(band)) + band + lines[p - 1:p + 2]
    m = next((i for i, l in enumerate(plain) if l.strip().startswith('● main')), None)
    if m is not None:
        keep += [''] + [l for l in lines[m:] if SGR.sub('', l).strip()][:6]
    return keep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--session', action='store_true')
    ap.add_argument('--size')
    a = ap.parse_args()
    lines = open(a.src, encoding='utf-8').read().split('\n')
    if a.session: lines = crop(lines)
    rows = [cells(l) for l in lines]
    width = max([len(r) for r in rows] + [1]) * CELL_W
    with tempfile.TemporaryDirectory() as tmp:
        text = os.path.join(tmp, 'text.pango')
        body = '\n'.join(markup(r) for r in rows)
        open(text, 'w', encoding='utf-8').write(f'<span font_family="JetBrains Mono" size="15pt">{body}</span>')
        mvg = os.path.join(tmp, 'blocks.mvg')
        open(mvg, 'w', encoding='utf-8').write('\n'.join(blocks(rows)) + '\n')
        canvas = f'{width}x{len(rows) * CELL_H}'
        cmd = ['magick', '-size', canvas, f'xc:{BG}',
               '(', '-background', 'none', f'pango:@{text}', ')', '-gravity', 'northwest', '-composite',
               '+antialias', '-draw', f'@{mvg}', '-bordercolor', BG, '-border', '16']
        if a.size: cmd += ['-background', BG, '-gravity', 'northwest', '-extent', a.size]
        subprocess.run(cmd + [a.dst], check=True)


main()
