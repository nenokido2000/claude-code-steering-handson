#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path')
if echo "$FILE" | grep -qE '\.ts$'; then
  cd "$(dirname "$0")/.." && npx tsc --noEmit 2>&1
fi
