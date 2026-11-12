#!/usr/bin/env bash
# The CPU use of a Claude Code session running in tmux, over some seconds.
#
#   scripts/cpu.sh <tmux session> [seconds, default 30]
#
# Compare a session with Clawd against one without (`/clawd` hides it).
set -euo pipefail
pid=$(tmux list-panes -t "$1" -F '#{pane_pid}')
secs=${2:-30}
cpu() { awk '{print $14+$15+$16+$17}' "/proc/$pid/stat"; }
a=$(cpu); sleep "$secs"; b=$(cpu)
python3 -c "print(f'{($b-$a)*100/$(getconf CLK_TCK)/$secs:.2f}% CPU')"
