"""Claude-chan's frames, drawn by hand at 1x in two sizes: layers of pixel art
stamped on a 26x32 or 20x24 canvas, outlined, and written to
hooks/chan-sprites.ts with contact sheets in docs/assets/claude-chan*.png.

  python -I scripts/chan.py [preview.png [16|12] [pose ...]]

Each layer is rows of palette characters; '.' leaves what is under it.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
W, H = 26, 32  # the size being drawn: see use()

# xterm-256 colors only (cube and greys), as palette.ts uses: tmux and other
# 256-color terminals show exactly these.
PAL = {
    'K': '#262626',  # outline
    'H': '#ff8700',  # hair
    'L': '#ffaf5f',  # hair light
    'I': '#ffd7af',  # hair highlight
    'h': '#d75f00',  # hair shade
    'd': '#af5f00',  # hair deep
    'S': '#ffffd7',  # skin
    's': '#ffd7af',  # skin shade
    'B': '#ffafaf',  # blush
    'E': '#5f0000',  # eye dark
    'e': '#d78700',  # eye amber
    'a': '#ffaf00',  # eye light amber
    'G': '#ffffff',  # catchlight
    'M': '#d75f5f',  # mouth
    'F': '#ff875f',  # petal
    'f': '#af0000',  # petal edge
    'C': '#ffd75f',  # flower heart
    'c': '#d78700',  # flower heart shade
    'R': '#121212',  # ribbon, bows
    'w': '#eeeeee',  # dress
    'g': '#d7d7af',  # dress shade
    'O': '#ff5f00',  # orange panel, embroidery
    'o': '#d75f00',  # orange panel shade
    'N': '#3a3a3a',  # black panel
    'Y': '#d7af5f',  # gold
    'T': '#875f5f',  # book
    't': '#5f0000',  # book dark
    'X': '#5f0000',  # boots
    'Q': '#afd7ff',  # glass, tear
    'P': '#ff5f87',  # heart
    'Z': '#87afff',  # z's
    'r': '#ff5f5f',  # !
    'v': '#87ff87',  # screen text, progress, ticks
    'k': '#8a8a8a',  # bezel, soot
    'y': '#d0d0d0',  # smoke, dim screen text
    'x': '#5fd7d7',  # crystal, signal
    'b': '#5fafaf',  # blueprint
    'u': '#008787',  # blueprint lines
    'q': '#5f87d7',  # globe sea
    'j': '#5faf5f',  # globe land
    'p': '#af87ff',  # confetti
}
# Marks drawn after the outline, so they float unoutlined.
FX = set('PZrv')


def canvas():
    return [['.'] * W for _ in range(H)]


def stamp(cv, art, x, y):
    for j, row in enumerate(art):
        for i, ch in enumerate(row):
            if ch != '.' and 0 <= y + j < H and 0 <= x + i < W:
                cv[y + j][x + i] = '.' if ch == '_' else ch


def outline(cv):
    out = [row[:] for row in cv]
    for y in range(H):
        for x in range(W):
            if cv[y][x] != '.':
                continue
            near = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if any(0 <= a < W and 0 <= b < H and cv[b][a] not in '.' and cv[b][a] not in FX for a, b in near):
                out[y][x] = 'K'
    return out


def shift(cv, dx=0, dy=0):
    out = canvas()
    for y in range(H):
        for x in range(W):
            if 0 <= y - dy < H and 0 <= x - dx < W:
                out[y][x] = cv[y - dy][x - dx]
    return out


# ---------------------------------------------------------------- sizes

# She comes in two sizes, each drawn by hand: 16 rows (26x32 px) and, for a
# band with less room, 12 rows (20x24 px). use() picks the one being drawn;
# Z(big, small) is the value for it.
SIZES = {16: (26, 32), 12: (20, 24)}
BIG = True


def use(rows):
    global W, H, BIG
    W, H = SIZES[rows]
    BIG = rows == 16


def Z(big, small):
    return big if BIG else small


# ---------------------------------------------------------------- hair behind

# Each row's reach on each side (left col, right col), narrow at the shoulders
# and flaring out in waves below.
REACH = {16: {y: (2, 23) for y in range(8, 16)}, 12: {y: (1, 18) for y in range(5, 12)}}
REACH[16].update({16: (3, 22), 17: (3, 22), 18: (3, 22), 19: (2, 23), 20: (2, 23), 21: (2, 23), 22: (1, 24),
                  23: (1, 24), 24: (1, 24), 25: (2, 23), 26: (1, 24), 27: (1, 24), 28: (1, 24)})
REACH[12].update({12: (2, 17), 13: (2, 17), 14: (2, 17), 15: (1, 18), 16: (1, 18), 17: (1, 18),
                  18: (2, 17), 19: (1, 18), 20: (1, 18), 21: (1, 18)})


def back_hair(cv, sway=0):
    """The long hair behind her, wavy strands down past the skirt."""
    reach = REACH[Z(16, 12)]
    low, tips, deep = Z((19, 27, 21), (14, 20, 16))
    strands, deeps, lights, lit = Z(((3, 6, 19, 22), (2, 5, 20, 23), (4, 21), (17, 23)),
                                    ((3, 5, 14, 16), (2, 15, 4, 17), (4, 15), (13, 17)))
    for y, (l, r) in reach.items():
        s = sway if y >= low else 0
        for x in range(l + s, r + 1 + s):
            if not 1 <= x <= W - 2:
                continue
            u = x - s
            wave = (0, 0, 1, 1, 1, 0, 0, 0)[y % 8]
            if y >= tips and (u + wave) % 3 == 0:  # the tips part into locks
                continue
            ch = 'H'
            if (u - wave) in strands:
                ch = 'h'
            if y >= deep and (u - wave) in deeps:
                ch = 'd'
            if (u - wave) in lights and lit[0] <= y <= lit[1]:
                ch = 'L'
            cv[y][x] = ch


# ---------------------------------------------------------------- head

HEAD = {16: [  # 22 wide, at x=2 y=1
    '........HHHHHH........',
    '.....HHHHHHHHHHHH.....',
    '...HHHHHHHHHHHHHHHH...',
    '..HHHLLHHHHHHHHLLHHH..',
    '.HHLIIHHHHhhHHHHIILHH.',
    'HHHHLLHHHhHHhHHHLLHHHH',
    'HHHhHHHHhHHHHhHHHHhHHH',
    'HHHHHhSHHHSSHHHSHhHHHH',
    'HHHHhSSShSSSShSSShHHHH',
    'HHLHhSSSSSSSSSSSShHLHH',
    'HLHHhSSSSSSSSSSSShHHLH',
    'HLHHhSSSSSSSSSSSShHHLH',
    'HHLHhSSSSSSSSSSSShHLHH',
    'HHLHhSSSSSSSSSSSShHLHH',
    'HLHHHhsSSSSSSSSshHHHLH',
    '.HLHh............hHLH.',
], 12: [  # 16 wide, at x=2 y=1
    '......HHHH......',
    '...HHHHHHHHHH...',
    '..HHHLLHHLLHHH..',
    '.HHLIIHhhHIILHH.',
    'HHHHHHhHHhHHHHHH',
    'HHHhHHHhhHHHhHHH',
    'HHHhSHHSSHHShHHH',
    'HHhSSSSSSSSSShHH',
    'HHhSSSSSSSSSShHH',
    'HLhSSSSSSSSSShLH',
    'HLHhsSSSSSSshHLH',
    '.LHh........hHL.',
]}

# Eyes: a pair, 3x4 at (8, 10) and (15, 10), or 2x3 at (6, 8) and (12, 8).
EYES = {16: {
    'open': ['KKK', 'EGE', 'eEe', 'aea'],
    'blink': ['...', '...', 'KKK', '...'],
    'happy': ['...', '.K.', 'K.K', '...'],
    'shut': ['...', '...', 'KKK', '...'],
    'down': ['...', 'KKK', 'EGE', 'aea'],
    'wide': ['.K.', 'KGK', 'KEK', '.K.'],
    'sad': ['...', 'KKK', 'EGE', 'aea'],
    'squeeze': (['K..', '.K.', 'K..', '...'], ['..K', '.K.', '..K', '...']),
    'annoyed': ['...', 'KKK', 'EEe', '...'],
    'dizzy': ['K.K', '.K.', 'K.K', '...'],
}, 12: {
    'open': ['KK', 'EG', 'ae'],
    'blink': ['..', '..', 'KK'],
    'happy': ['..', 'KK', 'K.'],
    'shut': ['..', '..', 'KK'],
    'down': ['..', 'KK', 'EG'],
    'wide': ['KK', 'GE', 'KK'],
    'sad': ['..', 'KK', 'Ge'],
    'squeeze': (['K.', '.K', 'K.'], ['.K', 'K.', '.K']),
    'annoyed': ['..', 'KK', 'Ee'],
    'dizzy': (['KK', '.K', 'KK'], ['KK', 'K.', 'KK']),
}}
MOUTH = {
    'smile': ['MM'],
    'open': ['MM', 'MM'],
    'o': ['M'],
    'flat': ['M'],
    'frown': ['.M', 'M.'],
}


def head(cv, eyes='open', mouth='smile', dx=0, dy=0, look=0):
    stamp(cv, HEAD[Z(16, 12)], 2 + dx, 1 + dy)
    e = EYES[Z(16, 12)][eyes]
    left, right = e if isinstance(e, tuple) else (e, e)
    (lx, ly), (rx, _) = Z(((8, 10), (15, 10)), ((6, 8), (12, 8)))
    stamp(cv, left, lx + dx + look, ly + dy)
    stamp(cv, right, rx + dx + look, ly + dy)
    if eyes not in ('wide', 'dizzy'):
        for x, y in Z(((8, 14), (17, 14)), ((5, 10), (14, 10))):
            stamp(cv, ['B'], x + dx, y + dy)
    mx, my = Z((12, 14), (9, 11))
    stamp(cv, MOUTH[mouth], mx + dx + (mouth in ('o', 'flat')), my + dy)
    flower(cv, Z(19, 14) + dx, 1 + dy)


def flower(cv, x, y):
    if BIG:
        stamp(cv, ['.fFFf.', 'fFFFFf', 'FFCcFF', 'FFccFF', 'fFFFFf', '.fFFf.'], x, y)
        # The ribbon's two tails and a tassel, down the hair beside her face.
        stamp(cv, ['RRR', '.wR', '.R.', '.w.', '.Y.', '.w.'], x + 1, y + 6)
    else:
        stamp(cv, ['.fFf.', 'fFCFf', 'FCcCF', 'fFCFf', '.fFf.'], x, y)
        stamp(cv, ['RR', '.w', '.R', '.Y'], x + 1, y + 5)


# ---------------------------------------------------------------- body

BODY = {16: [  # 20 wide, at x=3 y=16
    '........ssss........',
    '......wwwRRwww......',
    '....wwwwwwwwwwww....',
    '...wwwwwwwwwwwwww...',
    '..gwwwwwwwwwwwwwwg..',
    '.....NNNNOONNNN.....',
], 12: [  # 14 wide, at x=3 y=12
    '.....ssss.....',
    '....wwRRww....',
    '...wwwwwwww...',
    '..gwwwwwwwwg..',
    '...NNNOONNN...',
]}


def skirt(cv, dy=0):
    rows, hem, low, hips = Z(
        ({22: (7, 18), 23: (6, 19), 24: (6, 19), 25: (5, 20), 26: (5, 20), 27: (4, 21), 28: (4, 21)}, 28, 25,
         (['ROR', '.Y.'], (6, 22), (17, 22))),
        ({17: (6, 13), 18: (5, 14), 19: (4, 15), 20: (4, 15)}, 20, 19, (['R', 'Y'], (6, 17), (13, 17))))
    for y, (l, r) in rows.items():
        for x in range(l, r + 1):
            d = min(x - l, r - x)
            if y == hem:
                ch = 'w' if x % 2 else 'g'
            elif d == 0:
                ch = 'N'
            elif d == 1:
                ch = 'N' if y >= low else 'O'
            elif d == 2 and y >= low:
                ch = 'O'
            elif BIG and y == 27 and x % 3 == 0:
                ch = 'O'
            elif (x - 1) % 3 == 0:
                ch = 'g'
            else:
                ch = 'w'
            cv[y + dy][x] = ch
    art, a, b = hips
    stamp(cv, art, a[0], a[1] + dy)
    stamp(cv, art, b[0], b[1] + dy)


# What her arms hold over the body, at (8, 18) or (6, 13).
HOLD = {16: {
    'book': ['.tTTTt...', '.tTOTt...', 'StOYOtS..', 'StTOTt...', '.ttttt...'],
    'open': ['.........', 'TTTTtTTTT', 'TwggtggwT', 'SwwwtwwwS', 'TwggtggwT', 'tTTTtTTTt'],
    'none': ['.........', '.........', 'S.......S'],
}, 12: {
    'book': ['..tTTt..', '.StOOtS.', '..tTTt..', '..tttt..'],
    'open': ['TTTttTTT', 'TwgttgwT', 'SwwttwwS', 'tTTttTTt'],
    'none': ['........', '........', 'S......S'],
}}


def body(cv, hold='book', legs=0, dy=0):
    stamp(cv, BODY[Z(16, 12)], 3, Z(16, 12) + dy)
    skirt(cv, dy)
    bx, by = Z((10, 29), (7, 21))
    for y in (by, by + 1):
        stamp(cv, ['XX..XX'], bx, y + dy)
    if legs:  # a step: one boot up a row
        lift = bx if legs > 0 else bx + 4
        cv[by + 1][lift] = cv[by + 1][lift + 1] = '.'
    if hold:
        stamp(cv, HOLD[Z(16, 12)][hold], *Z((8, 18 + dy), (6, 13 + dy)))


# ---------------------------------------------------------------- poses

def base(eyes='open', mouth='smile', hold='book', sway=0, legs=0, look=0, head_dy=0):
    cv = canvas()
    back_hair(cv, sway)
    body(cv, hold, legs)
    head(cv, eyes, mouth, look=look, dy=head_dy)
    return cv


def finish(cv, fx=()):
    cv = outline(cv)
    for art, x, y in fx:
        stamp(cv, art, x, y)
    return cv


Z1 = ['ZZ', '.Z', 'ZZ']
HEART = ['P.P', 'PPP', '.P.']
SPARK = ['.Y.', 'YYY', '.Y.']
NOTE = ['.xx', '.x.', 'xx.']
PUFF = ['.yy.', 'yyyy', '.yk.']


def bang():
    return Z(['r', 'r', 'r', '.', 'r'], ['r', 'r', '.', 'r'])


def lens():
    return Z(['.YYY.', 'YQQQY', 'YQGQY', 'YQQQY', '.YYY.'], ['.YY.', 'YQQY', 'YGQY', '.YY.'])


def arm_up(cv, x, y):
    """A raised fist at (x, y), its sleeve running down to her shoulder."""
    stamp(cv, ['SS', 'ww', 'ww'], x, y)
    for yy in range(y + 3, Z(18, 13)):
        stamp(cv, ['ww'], x - (1 if x > W // 2 else -1) * ((yy - y - 3) // 2), yy)


def arm(cv, x0, y0, x1, y1):
    """A sleeve two pixels thick from her shoulder (x0, y0) to a hand at (x1, y1)."""
    n = max(abs(x1 - x0), abs(y1 - y0))
    for i in range(n):
        x = x0 + round((x1 - x0) * i / n)
        y = y0 + round((y1 - y0) * i / n)
        stamp(cv, ['ww', 'ww'], x, y)
    stamp(cv, ['SS', 'SS'], x1, y1)


def cloud(cv, puffs):
    """Smoke: round puffs (x, y, radius), shaded along its bottom rim."""
    inside = {(x, y) for cx, cy, r in puffs for y in range(H) for x in range(W)
              if (x - cx) ** 2 + (y - cy) ** 2 <= r * r}
    for x, y in inside:
        cv[y][x] = 'y' if (x, y + 2) in inside else 'k'


# The switch between Clawd and her, Clawd to Claude-chan; played backwards to
# go back. Each frame: Clawd's row offset where the engine draws Clawd
# himself (None: hidden), and whether the frame centers on him.
MORPH = [(0, True), (-1, True), (0, True), (None, True), (None, False), (None, False), (None, False)]


def morph():
    c = W / 2 - 0.5  # her middle column
    sparks = Z([[(6, 24), (19, 26)], [(5, 21), (20, 23), (12, 19)], [(4, 22), (21, 20)]],
               [[(4, 18), (14, 20)], [(3, 16), (15, 17), (9, 14)], [(3, 17), (16, 15)]])
    frames = []
    for i, spots in enumerate(sparks):
        cv = canvas()
        if i == 2:
            cloud(cv, Z([(c, 28, 4), (9, 29, 3), (16, 29, 3)], [(c, 21, 3), (7, 22, 2), (12, 22, 2)]))
        frames.append(finish(cv, [(SPARK if j == 0 else ['Y'], x, y) for j, (x, y) in enumerate(spots)]))
    cv = canvas()
    cloud(cv, Z([(c, 24, 6), (7, 27, 4), (18, 27, 4), (c, 19, 4)], [(c, 18, 5), (5, 20, 3), (14, 20, 3), (c, 14, 3)]))
    frames.append(finish(cv, Z([(SPARK, 2, 17), (['Y'], 22, 15)], [(SPARK, 0, 12), (['Y'], 17, 11)])))
    cv = canvas()
    cloud(cv, Z([(c, 17, 10), (6, 24, 6), (19, 24, 6), (8, 9, 6), (17, 9, 6), (c, 27, 5)],
                [(c, 13, 8), (4, 18, 5), (15, 18, 5), (6, 7, 5), (13, 7, 5), (c, 20, 4)]))
    frames.append(finish(cv, Z([(SPARK, 0, 2), (SPARK, 22, 4), (['Y'], 24, 20), (['Y'], 1, 22)],
                               [(SPARK, 0, 1), (SPARK, 17, 3), (['Y'], 18, 15), (['Y'], 1, 17)])))
    cv = base(eyes='happy', mouth='open')
    cloud(cv, Z([(2, 27, 3), (23, 27, 3), (1, 13, 2), (24, 10, 2), (c, 31, 3)],
                [(1, 20, 2), (18, 20, 2), (1, 10, 2), (18, 8, 2), (c, 23, 2)]))
    frames.append(finish(cv, Z([(SPARK, 0, 1), (SPARK, 22, 18)], [(SPARK, 0, 1), (SPARK, 17, 13)])))
    frames.append(finish(base(eyes='happy', mouth='open'),
                         Z([(['Y'], 1, 3), (SPARK, 21, 20), (['Y'], 2, 24)], [(['Y'], 1, 2), (SPARK, 16, 15), (['Y'], 2, 18)])))
    assert len(frames) == len(MORPH)
    return frames


def poses():
    p = {}

    # ---- what Claude is doing
    p['idle'] = [finish(base()), finish(base(eyes='blink'))]
    p['walk'] = [finish(base(sway=-1, legs=1, look=1)), finish(shift(base(sway=1, legs=-1, look=1), dy=-1))]

    def laptop(k):
        # A floating pad; the engine writes on its screen (SCREEN).
        cv = base(eyes='down', hold=None)
        if BIG:
            stamp(cv, ['kkkkkkkkkk', 'kNNNNNNNNk', 'kNNNNNNNNk', 'kNNNNNNNNk', 'kNNNNNNNNk', 'kkkkkkkkkk'], 8, 17)
            stamp(cv, ['yy.yyy'], 9, 18)
            cv[22 + k][8] = 'S'
            cv[23 - k][17] = 'S'
        else:
            stamp(cv, ['kkkkkkkk', 'kNNNNNNk', 'kNNNNNNk', 'kNNNNNNk', 'kkkkkkkk'], 6, 13)
            stamp(cv, ['yy.yy'], 7, 16)
            cv[17 + k][6] = 'S'
            cv[18 - k][13] = 'S'
        return finish(cv)
    p['laptop'] = [laptop(0), laptop(1)]

    def reading(k):
        cv = base(eyes='down', hold='open')
        if k:
            stamp(cv, ['.w', 'ww'], *Z((12, 17), (9, 12)))
        return finish(cv)
    p['read'] = [reading(0), reading(1)]

    def fetching(k):
        # A globe in her hands and a download bar filling under it.
        cv = base(eyes='down', hold=None)
        if BIG:
            stamp(cv, ['.qjjq.', 'qqjqqq', 'qjjjqq', 'qqjjqq', '.qqqj.'], 10, 17)
            stamp(cv, ['S', '.', 'S'], 9, 19)
            stamp(cv, ['S', '.', 'S'], 16, 19)
        else:
            stamp(cv, ['.qj.', 'qjjq', 'qqjq', '.qq.'], 8, 13)
            stamp(cv, ['S'], 7, 14)
            stamp(cv, ['S'], 12, 14)
        n = Z(10, 8)
        fill = Z((3, 5, 8, 10), (2, 4, 6, 8))[k]
        stamp(cv, ['K' + 'v' * fill + 'N' * (n - fill) + 'K'], *Z((7, 23), (5, 18)))
        return finish(cv)
    p['fetch'] = [fetching(k) for k in range(4)]

    def searching(k):
        cv = base(hold='book', look=1)
        stamp(cv, lens(), *Z((15 - k, 8 - k), (11 - k, 6 - k)))
        stamp(cv, Z(['T', '.T', '..T'], ['T', '.T']), *Z((19 - k, 13 - k), (14 - k, 10 - k)))
        return finish(cv)
    p['search'] = [searching(0), searching(1)]

    def writing(k):
        cv = base(eyes='down', hold='open')
        # A quill in her hand, its feather up over her hair; it wiggles as she writes.
        if BIG:
            stamp(cv, ['....ww', '...wwg', '..wwg.', '.wg...', 'wg....', 'T.....'], 16 + k, 13)
        else:
            stamp(cv, ['...w', '..wg', '.wg.', 'wg..', 'T...'], 12 + k, 9)
        return finish(cv, [(SPARK, *Z((21 - k, 9 + k), (16 - k, 6 + k)))])
    p['write'] = [writing(0), writing(1)]

    def skill(k):
        # Wand up, two sparkles circling her head.
        cv = base(mouth='open', hold='book')
        arm_up(cv, *Z((20, 12), (15, 8)))
        stamp(cv, ['..Y', '.T.', 'T..'], *Z((20, 9), (15, 5)))
        ring = Z([(0, 10), (3, 0), (14, 0), (23, 12)], [(0, 7), (2, 0), (9, 0), (17, 9)])
        a, b = ring[k], ring[(k + 2) % 4]
        return finish(cv, [(SPARK, a[0], a[1]), (['Y'], b[0] + 1, b[1] + 1), (SPARK, *Z((21, 7), (16, 3)))])
    p['skill'] = [skill(k) for k in range(4)]

    def mcp(k):
        # A crystal at her chest, its signal going out in rings.
        cv = base(hold=None)
        if BIG:
            stamp(cv, ['.xx.', 'xQQx', 'xQQx', '.xx.'], 11, 17)
            stamp(cv, ['S..S'], 11, 21)
            l, r = 9 - 2 * k, 16 + 2 * k
            arcs = [(['x', '.', '.', 'x'], l + 1, 17), (['x', 'x'], l, 18),
                    (['x', '.', '.', 'x'], r - 1, 17), (['x', 'x'], r, 18)]
        else:
            stamp(cv, ['.xx.', 'xQQx', '.xx.'], 8, 13)
            stamp(cv, ['S..S'], 8, 16)
            l, r = 6 - 2 * k, 13 + 2 * k
            arcs = [(['x', '.', 'x'], l + 1, 13), (['x'], l, 14), (['x', '.', 'x'], r - 1, 13), (['x'], r, 14)]
        return finish(cv, arcs)
    p['mcp'] = [mcp(k) for k in range(3)]

    def compact(k):
        # Stuffing everything into a little box, then sitting on the lid.
        cv = base(eyes='open' if k == 0 else 'squeeze', mouth='o' if k else 'smile', hold=None)
        if BIG:
            stamp(cv, ['TccccccccT', 'TccYYccccT', 'TccYYccccT', 'TTTTTTTTTT'], 8, 20)
            if k == 0:
                stamp(cv, ['.ww..Y..', '.wwgYYY.', 'cc.....c'], 9, 17)
                stamp(cv, ['S'], 8, 19)
                stamp(cv, ['S'], 17, 19)
                return finish(cv)
            stamp(cv, ['TTTTTTTTTT'], 8, 19)
            stamp(cv, ['SS'], 10, 18)
            stamp(cv, ['SS'], 14, 18)
            return finish(cv, [(['y', '.', 'y'], 6, 19), (['y', '.', 'y'], 19, 19)])
        stamp(cv, ['TccccccT', 'TcYYcccT', 'TTTTTTTT'], 6, 15)
        if k == 0:
            stamp(cv, ['.w..Y.', '.wgYYY'], 7, 13)
            stamp(cv, ['S'], 6, 14)
            stamp(cv, ['S'], 13, 14)
            return finish(cv)
        stamp(cv, ['TTTTTTTT'], 6, 14)
        stamp(cv, ['SS'], 7, 13)
        stamp(cv, ['SS'], 11, 13)
        return finish(cv, [(['y', '.', 'y'], 4, 14), (['y', '.', 'y'], 15, 14)])
    p['compact'] = [compact(0), compact(1)]

    def todo(k):
        # A clipboard, its boxes ticked one by one.
        cv = base(eyes='down', hold=None)
        if BIG:
            stamp(cv, ['TTTTTTTT'] + ['TwwwwwwT'] * 6 + ['TTTTTTTT'], 9, 17)
            stamp(cv, ['YY'], 12, 16)
            items, hands = [(10, 19), (10, 21), (10, 23)], [(8, 21), (17, 21)]
        else:
            stamp(cv, ['TTTTTT'] + ['TwwwwT'] * 5 + ['TTTTTT'], 7, 13)
            stamp(cv, ['YY'], 9, 12)
            items, hands = [(8, 14), (8, 16), (8, 18)], [(6, 16), (13, 16)]
        for i, (x, y) in enumerate(items):
            stamp(cv, [('v' if i < k else 'k') + Z('.ggg', '.gg')], x, y)
        for x, y in hands:
            stamp(cv, ['S'], x, y)
        return finish(cv)
    p['todo'] = [todo(k) for k in range(4)]

    def plan(k):
        # A blueprint held up, a route drawn across it.
        cv = base(eyes='down', hold=None)
        if BIG:
            stamp(cv, ['uuuuuuuuuuuu'] + ['ubububububuu', 'ubbbbbbbbbbu'] * 2 + ['ubububububuu', 'uuuuuuuuuuuu'], 7, 17)
            route = [(8, 22), (9, 21), (10, 21), (11, 20), (12, 20), (13, 19), (14, 20), (15, 19), (16, 18)]
            n = (3, 6, 9)[k]
            hands = [(6, 19), (19, 19)]
        else:
            stamp(cv, ['uuuuuuuuuu', 'ububububuu', 'ubbbbbbbbu', 'ububububuu', 'uuuuuuuuuu'], 5, 13)
            route = [(6, 16), (7, 15), (8, 15), (9, 16), (10, 15), (11, 14), (12, 14)]
            n = (3, 5, 7)[k]
            hands = [(4, 15), (15, 15)]
        for x, y in route[:n]:
            cv[y][x] = 'w'
        x, y = route[n - 1]
        cv[y][x] = 'r'
        for x, y in hands:
            stamp(cv, ['S'], x, y)
        return finish(cv)
    p['plan'] = [plan(k) for k in range(3)]

    # ---- between turns
    def sleeping(k):
        cv = base(eyes='shut', mouth='flat')
        return finish(cv, [(Z1, *Z((1, 4 - 2 * k), (1, 3 - k))), (['Z'], *Z((3, 1 + k), (2, 0 + k)))])
    p['sleep'] = [sleeping(0), sleeping(1)]

    # ---- reactions to the session
    def celebrate(k):
        cv = base(eyes='happy', mouth='open', hold='none')
        for x, y in Z(((4, 14), (20, 14)), ((3, 9), (15, 9))):
            stamp(cv, ['SS', 'ww', 'ww'], x, y)
        cv = shift(cv, dy=-(k % 2))
        bits = Z([(0, 0, 'P'), (2, 3, 'Y'), (4, 6, 'x'), (21, 2, 'v'), (23, 5, 'p'), (25, 1, 'Q')],
                 [(0, 0, 'P'), (1, 3, 'Y'), (3, 5, 'x'), (16, 2, 'v'), (18, 4, 'p'), (19, 1, 'Q')])
        fall = Z(10, 8)
        return finish(cv, [([c], x, (y + 3 * k) % fall) for x, y, c in bits])
    p['celebrate'] = [celebrate(k) for k in range(3)]

    def hello(k):
        # Waves, the book under her other arm.
        cv = base(eyes='happy', mouth='open' if k else 'smile')
        arm_up(cv, *Z((20 + k, 11 + k), (15 + k, 7 + k)))
        return finish(cv)
    p['hello'] = [hello(0), hello(1)]

    def wake(k):
        # Stretches, arms out wide, with a yawn.
        cv = base(eyes='shut', mouth='open', hold=None)
        if BIG:
            arm(cv, 6, 17, 1, 13 - 2 * k)
            arm(cv, 18, 17, 23, 13 - 2 * k)
        else:
            arm(cv, 4, 13, 0, 9 - 2 * k)
            arm(cv, 14, 13, 18, 9 - 2 * k)
        return finish(cv, [(['Q'], *Z((7, 13), (5, 9)))] if k else [])
    p['wake'] = [wake(0), wake(1)]

    def oops(k):
        cv = base(eyes='wide', mouth='o')
        cv = shift(cv, dy=-k)
        return finish(cv, [(bang(), 1, 1 + k)])
    p['oops'] = [oops(0), oops(1)]

    def shrug(k):
        # Palms up, eyes shut, a drop of sweat.
        cv = base(eyes='shut', mouth='flat', hold=None)
        if BIG:
            arm(cv, 6, 18, 2, 18 - k)
            arm(cv, 18, 18, 22, 18 - k)
        else:
            arm(cv, 4, 14, 1, 14 - k)
            arm(cv, 14, 14, 17, 14 - k)
        return finish(cv, [(['Q', 'Q'], *Z((5, 8 + k), (4, 6 + k)))])
    p['shrug'] = [shrug(0), shrug(1)]

    def sad(k):
        cv = base(eyes='sad', mouth='frown')
        x, y = Z((7, 14), (6, 11))
        return finish(cv, [(['Q'], x, y + k), (['Q'], x, y + 1 + k)])
    p['sad'] = [sad(0), sad(1)]

    # ---- reactions to a click
    def pet(k):
        # Your hand on her head; she leans into it.
        cv = base(eyes='happy', mouth='smile')
        if BIG:
            stamp(cv, ['.S.S.S.', 'SSSSSSS', 'SSSSSSS', '.SSSSS.'], 9, k)
        else:
            stamp(cv, ['.S.S.', 'SSSSS', '.SSS.'], 7, k)
        return finish(cv, [(HEART, *Z((1, 7 - k), (0, 5 - k)))])
    p['pet'] = [pet(0), pet(1)]

    def dizzy(k):
        cv = base(eyes='dizzy', mouth='o')
        stars = Z([(3, 4), (13, 0), (22, 9)] if k == 0 else [(7, 1), (18, 0), (1, 9)],
                  [(2, 3), (9, 0), (17, 7)] if k == 0 else [(5, 1), (13, 0), (1, 7)])
        return finish(cv, [(['Y'], x, y) for x, y in stars])
    p['dizzy'] = [dizzy(0), dizzy(1)]

    def puff(k):
        # Shooed: cheeks puffed, arms crossed, steaming.
        cv = base(eyes='annoyed', mouth='flat', hold=None)
        for x, y in Z(((7, 14), (18, 14)), ((5, 11), (14, 11))):
            stamp(cv, ['B'], x, y)
        if BIG:
            stamp(cv, ['SwwwwwwS', '.wwwwww.'], 9, 19)
        else:
            stamp(cv, ['SwwwwS', '.wwww.'], 7, 14)
        return finish(cv, Z([(PUFF, 1, 2 - k), (PUFF[:2], 4 + k, 0)], [(PUFF, 0, 2 - k), (PUFF[:2], 3 + k, 0)]))
    p['puff'] = [puff(0), puff(1)]

    def peek(k):
        # Peeks at you over the top of her book, as in the picture.
        cv = base(hold=None, look=k)
        if BIG:
            stamp(cv, ['tTTTTTTt', 'tTTOOTTt', 'tTOYYOTt', 'tTTOOTTt', 'tTTTTTTt', 'tttttttt'], 9, 14)
            stamp(cv, ['S', 'S'], 8, 16)
            stamp(cv, ['S', 'S'], 17, 16)
        else:
            stamp(cv, ['tTTTTt', 'tTOOTt', 'tOYYOt', 'tTOOTt', 'tttttt'], 7, 11)
            stamp(cv, ['S', 'S'], 6, 12)
            stamp(cv, ['S', 'S'], 13, 12)
        return finish(cv)
    p['peek'] = [peek(0), peek(1)]

    def bonk(k):
        # Bonks her own head with the book.
        cv = base(eyes='squeeze', mouth='o', hold=None)
        if BIG:
            stamp(cv, ['TTTTT', 'TTOTT', 'TOYOT', 'ttttt'], 3, 1 - 2 * k)
            arm(cv, 6, 17, 5, 5 - 2 * k)
        else:
            stamp(cv, ['TTTT', 'TOYT', 'tttt'], 2, 1 - 2 * k)
            arm(cv, 4, 13, 3, 4 - 2 * k)
        return finish(cv, [(SPARK, *Z((9, 0), (7, 0)))] if k == 0 else [])
    p['bonk'] = [bonk(0), bonk(1)]

    def highfive(k):
        cv = base(eyes='happy', mouth='open')
        if BIG:
            stamp(cv, ['S.S', 'SSS', 'SSS'], 21, 9)
            stamp(cv, ['ww'] * 5, 20, 12)
        else:
            stamp(cv, ['S.S', 'SSS'], 16, 6)
            stamp(cv, ['ww'] * 5, 15, 8)
        return finish(cv, [(SPARK, *Z((22, 5), (17, 2)))] if k else [])
    p['highfive'] = [highfive(0), highfive(1)]

    def found(k):
        # Found it! The glass held high, and a "!".
        cv = base(eyes='happy', mouth='open')
        if BIG:
            stamp(cv, lens(), 0, 6 - k)
            stamp(cv, ['T.', '.T', '.S'], 3, 11 - k)
            stamp(cv, ['w', 'w', 'w'], 5, 14)
        else:
            stamp(cv, lens(), 0, 4 - k)
            stamp(cv, ['T.', '.S'], 2, 8 - k)
            stamp(cv, ['w', 'w'], 3, 10)
        return finish(cv, [(bang(), *Z((2, 0), (1, 0)))])
    p['found'] = [found(0), found(1)]

    def poof(k):
        # The spell goes poof: smoke, and soot on her cheeks.
        cv = base(eyes='blink', mouth='flat')
        for x, y in Z(((9, 14), (16, 15)), ((7, 10), (12, 11))):
            stamp(cv, ['k'], x, y)
        spots = Z([(0, 3), (21, 0), (0, 17), (21, 17)] if k == 0 else [(1, 1), (20, 2), (1, 15), (20, 19)],
                  [(0, 2), (15, 0), (0, 13), (15, 13)] if k == 0 else [(1, 1), (14, 1), (1, 11), (14, 15)])
        return finish(cv, [(PUFF, x, y) for x, y in spots])
    p['poof'] = [poof(0), poof(1)]

    def zap(k):
        # Static: hair on end, sparks crackling.
        cv = base(eyes='wide', mouth='o')
        frizz = Z([(4, 2), (2, 5), (1, 9), (14, 0)] if k == 0 else [(6, 1), (1, 7), (2, 3), (10, 0)],
                  [(3, 2), (1, 4), (1, 7), (10, 0)] if k == 0 else [(5, 1), (1, 6), (2, 3), (8, 0)])
        for x, y in frizz:
            cv[y][x] = 'H'
        bolt = ['Y.', '.Y', 'Y.', '.Y']
        return finish(cv, Z([(bolt, 0, 12 + k), (bolt, 24, 13 - k)], [(bolt, 0, 9 + k), (bolt, 18, 10 - k)]))
    p['zap'] = [zap(0), zap(1)]

    p['morph'] = morph()

    # ---- idle fidgets
    p['hop'] = [finish(shift(base(eyes='happy'), dy=Z(-2, -1))), finish(base())]
    p['look'] = [finish(base(look=-1)), finish(base(look=1))]
    p['hum'] = [finish(base(eyes='happy', mouth='o', sway=-1), [(NOTE, *Z((1, 4), (0, 3)))]),
                finish(base(eyes='happy', mouth='o', sway=1), [(NOTE, *Z((2, 1), (1, 1)))])]
    p['sneeze'] = [finish(base(eyes='down', mouth='o')), finish(base(eyes='shut', mouth='o')),
                   finish(shift(base(eyes='squeeze', mouth='flat'), dy=-1), [(['.y', 'yy', '.y'], *Z((19, 13), (15, 9)))]),
                   finish(base(eyes='blink'))]
    p['heart'] = [finish(base(eyes='happy'), [(HEART, Z(1, 0), y)]) for y in Z((11, 7, 3), (8, 5, 2))]
    p['nod'] = [finish(base(eyes='shut', mouth='flat')), finish(base(eyes='shut', mouth='flat', head_dy=1)),
                finish(base(eyes='shut', mouth='flat')), finish(base(eyes='wide', mouth='o'), [(bang(), 1, 1)])]
    return p


# Where the laptop pose's screen is, for the engine to write on: cell row and column.
SCREEN = {16: (10, 9), 12: (7, 7)}


# ---------------------------------------------------------------- output

def write_ts(sets):
    keys = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    used = sorted({ch for p in sets.values() for frames in p.values() for f in frames for row in f for ch in row} - {'.'})
    code = {ch: keys[i] for i, ch in enumerate(used)}
    lines = [
        "// Claude-chan's frames, generated by scripts/chan.py: edit that, not this.",
        f"export const CHAN_KEY = '{keys}'",
        "// xterm-256 colors, each nudged so that Claude Code's rounding for a 256-color",
        "// terminal (tmux) lands on it exactly: see term() in scripts/chan.py.",
        'export const CHAN_PAL: readonly string[] = [' + ', '.join(f"'{term(PAL[ch])}'" for ch in used) + ']',
        "// The laptop's screen: text and screen colors.",
        f"export const CHAN_SCREEN_COLORS = ['{term(PAL['v'])}', '{term(PAL['N'])}'] as const",
        '// The morph pose, frame by frame: the row offset Clawd himself is drawn at (null:',
        '// hidden), and whether the frame centers on him.',
        'export const CHAN_MORPH: readonly (readonly [number | null, boolean])[] = [' + ', '.join(
            f"[{'null' if c is None else c}, {'true' if f else 'false'}]" for c, f in MORPH) + ']',
        "// Her sizes, biggest first: rows, width in columns, where the laptop's",
        '// screen is (cell row, column), and her poses at that size.',
        'export const CHAN_SIZES = [',
    ]
    for rows, p in sets.items():
        w, _ = SIZES[rows]
        r, c = SCREEN[rows]
        lines.append(f'  {{ rows: {rows}, w: {w}, screen: [{r}, {c}], poses: {{')
        for name, frames in p.items():
            lines.append(f'    {name}: [')
            for f in frames:
                lines.append('      [')
                lines += [f"        '{''.join(code.get(ch, '.') for ch in row)}'," for row in f]
                lines.append('      ],')
            lines.append('    ],')
        lines.append('  } },')
    lines.append('] as const')
    (ROOT / 'hooks' / 'chan-sprites.ts').write_text('\n'.join(lines) + '\n', encoding='utf-8', newline='\n')


def image(f, scale, bg):
    im = Image.new('RGB', (W * scale, H * scale), bg)
    d = ImageDraw.Draw(im)
    for y, row in enumerate(f):
        for x, ch in enumerate(row):
            if ch != '.':
                d.rectangle([x * scale, y * scale, (x + 1) * scale - 1, (y + 1) * scale - 1], fill=PAL[ch])
    return im


def sheet(cells, scale, cols, both=False):
    """Labeled frames in a grid, on a dark background (and a light one)."""
    cw, ch = W * scale + 8, H * scale + 22
    bgs = ['#1e1e1e', '#f5f5f5'] if both else ['#1e1e1e']
    rows = (len(cells) + cols - 1) // cols
    im = Image.new('RGB', (cols * cw * len(bgs), rows * ch), '#111111')
    d = ImageDraw.Draw(im)
    for i, (label, f) in enumerate(cells):
        for b, bg in enumerate(bgs):
            x = (i % cols) * cw * len(bgs) + b * cw
            y = (i // cols) * ch
            im.paste(image(f, scale, bg), (x + 4, y + 18))
            d.text((x + 4, y + 3), label, fill='#cccccc')
    return im


def is256(h):
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    cube = {0, 95, 135, 175, 215, 255}
    return {r, g, b} <= cube or (r == g == b and (r - 8) % 10 == 0 and r <= 238)


def ansi256(r, g, b):
    """The xterm-256 color a 256-color terminal (tmux) gets for an RGB color,
    rounded the way Claude Code rounds it (each channel to sixths)."""
    if r == g == b:
        k = 16 if r < 8 else 231 if r > 248 else round((r - 8) / 247 * 24) + 232
    else:
        k = 16 + 36 * round(r / 255 * 5) + 6 * round(g / 255 * 5) + round(b / 255 * 5)
    if k >= 232:
        return (8 + 10 * (k - 232),) * 3
    if k == 16:
        return (0, 0, 0)
    if k == 231:
        return (255, 255, 255)
    k -= 16
    return tuple((0, 95, 135, 175, 215, 255)[v] for v in (k // 36, k // 6 % 6, k % 6))


def term(h):
    """The color to hand the terminal for xterm color `h`: as close to it as
    rounds back to it, so tmux shows `h` and a truecolor terminal nearly `h`."""
    rgb = tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
    if rgb[0] == rgb[1] == rgb[2]:
        k = (rgb[0] - 8) // 10
        out = (round(8 + k * 247 / 24),) * 3 if 0 < k < 24 else rgb
    else:
        out = tuple({95: 76, 135: 127}.get(v, v) for v in rgb)
    assert ansi256(*out) == rgb, (h, out, ansi256(*out))
    return '#%02x%02x%02x' % out


def main():
    assert all(is256(h) for h in PAL.values()), [h for h in PAL.values() if not is256(h)]
    sets = {}
    for rows in SIZES:
        use(rows)
        p = sets[rows] = poses()
        for name, frames in p.items():
            assert len(frames) >= 2, name
            for f in frames:
                assert len(f) == H and all(len(r) == W for r in f), name
    big, small = sets.values()
    assert {n: len(f) for n, f in big.items()} == {n: len(f) for n, f in small.items()}
    write_ts(sets)
    # The README's: one frame of each pose, each size.
    for rows, name in ((16, 'claude-chan.png'), (12, 'claude-chan-small.png')):
        use(rows)
        sheet([(n, f[0]) for n, f in sets[rows].items()], Z(4, 5), 9).save(ROOT / 'docs' / 'assets' / name)
    # A closer look while drawing: every frame of the poses named, at the size named.
    #   python -I scripts/chan.py out.png [16|12] [pose ...]
    if len(sys.argv) > 1:
        args = sys.argv[2:]
        rows = int(args.pop(0)) if args and args[0].isdigit() else 16
        use(rows)
        names = args or list(sets[rows])
        cells = [(f'{n} {k}', f) for n in names for k, f in enumerate(sets[rows][n])]
        sheet(cells, 8, 4, both=True).save(sys.argv[1])


if __name__ == '__main__':
    main()
