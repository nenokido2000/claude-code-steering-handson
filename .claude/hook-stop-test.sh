#!/bin/bash
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

cd "$(dirname "$0")/.." && npm test > .claude/stop-test.log 2>&1
if [ $? -eq 0 ]; then
  exit 0
fi

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  echo '{"systemMessage":"npm testが修正後も失敗しています。.claude/stop-test.logを確認してください。"}'
  exit 0
fi

echo '{"decision":"block","reason":"npm testが失敗しています。.claude/stop-test.logを確認し、修正してください。"}'
exit 2
