#!/bin/bash
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')

cd "$(dirname "$0")/.."

FAILURES=()

npm test > .claude/stop-test.log 2>&1
if [ $? -ne 0 ]; then
  FAILURES+=("npm testが失敗しています。.claude/stop-test.logを確認し、修正してください。")
fi

SRC_CHANGED=$(git diff --name-only HEAD -- 'src/**/*.ts' 2>/dev/null)
if [ -n "$SRC_CHANGED" ] && [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
  VERDICT_JSON=$(jq -c -n -f .claude/review-verdict.jq "$TRANSCRIPT" 2>/dev/null)
  LAST_EDIT=$(echo "$VERDICT_JSON" | jq -r '.lastEdit // -1')
  REVIEW_LINE=$(echo "$VERDICT_JSON" | jq -r '.reviewLine // -1')
  VERDICT=$(echo "$VERDICT_JSON" | jq -r '.verdict // empty')

  if [ "$REVIEW_LINE" -lt "$LAST_EDIT" ]; then
    FAILURES+=("src/配下のコードが変更されていますが、最新の変更に対してtodo-api-reviewerのレビューが実行されていません。todo-api-reviewerを実行してください。")
  elif [ "$VERDICT" = "FAIL" ]; then
    FAILURES+=("todo-api-reviewerがCritical指摘を報告しています。指摘内容を確認・修正のうえ再度レビューしてください。")
  elif [ "$VERDICT" != "PASS" ]; then
    FAILURES+=("todo-api-reviewerの実行結果(REVIEW_VERDICT)を確認できませんでした。同期呼び出し(run_in_background:false)でtodo-api-reviewerを実行し、完了を待ってください。")
  fi
fi

if [ ${#FAILURES[@]} -eq 0 ]; then
  exit 0
fi

REASON=$(printf '%s\n' "${FAILURES[@]}")

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  jq -n --arg msg "修正後もチェックに失敗しています:
$REASON" '{systemMessage: $msg}'
  exit 0
fi

jq -n --arg reason "$REASON" '{decision: "block", reason: $reason}'
exit 2
