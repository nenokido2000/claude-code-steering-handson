#!/bin/bash
SESSION_ID=$(jq -r '.session_id // empty')
cd "$(dirname "$0")/.."

[ -z "$SESSION_ID" ] && exit 0

mkdir -p .claude/session-baseline
BASELINE=".claude/session-baseline/$SESSION_ID"
[ -f "$BASELINE" ] || .claude/hook-src-fingerprint.sh > "$BASELINE"
exit 0
