#!/bin/bash
INPUT=$(cat)
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // "unknown"')
if [ -z "$AGENT_TYPE" ] || [ "$AGENT_TYPE" = "unknown" ]; then
  exit 0
fi
command -v afplay >/dev/null 2>&1 && afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
exit 0
