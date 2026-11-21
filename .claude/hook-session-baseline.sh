#!/bin/bash
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
SOURCE=$(echo "$INPUT" | jq -r '.source // empty')
cd "$(dirname "$0")/.."

[ -z "$SESSION_ID" ] && exit 0
# resume/compactで初めて記録すると、そのセッション自身のレビュー前の差分を免除してしまう
case "$SOURCE" in startup|clear) ;; *) exit 0 ;; esac

mkdir -p .claude/session-baseline
BASELINE=".claude/session-baseline/$SESSION_ID"
[ -f "$BASELINE" ] && exit 0

FP=$(.claude/hook-src-fingerprint.sh) || exit 0
[ -n "$FP" ] && printf '%s\n' "$FP" > "$BASELINE"
exit 0
