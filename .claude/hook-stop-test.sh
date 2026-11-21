#!/bin/bash
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

cd "$(dirname "$0")/.."

FAILURES=()

npm test > .claude/stop-test.log 2>&1
if [ $? -ne 0 ]; then
  FAILURES+=("npm testが失敗しています。.claude/stop-test.logを確認し、修正してください。")
fi

SRC_CHANGED=$( (git diff --name-only HEAD -- 'src/*.ts'; git ls-files --others --exclude-standard -- 'src/*.ts') 2>/dev/null)

BASELINE=".claude/session-baseline/$SESSION_ID"
if [ -n "$SESSION_ID" ] && [ -f "$BASELINE" ] && [ "$(cat "$BASELINE")" = "$(.claude/hook-src-fingerprint.sh)" ]; then
  SRC_CHANGED=""
fi

if [ -n "$SRC_CHANGED" ] && [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
  VERDICT_JSON=$(jq -c -n -f .claude/review-verdict.jq "$TRANSCRIPT" 2>/dev/null)
  LAST_EDIT=$(echo "$VERDICT_JSON" | jq -r '.lastEdit // -1')
  REVIEW_LINE=$(echo "$VERDICT_JSON" | jq -r '.reviewLine // -1')
  VERDICT=$(echo "$VERDICT_JSON" | jq -r '.verdict // empty')
  REVIEWER=$(echo "$VERDICT_JSON" | jq -r '.reviewer // empty')
  PENDING=$(echo "$VERDICT_JSON" | jq -r '.pending // false')

  if [ -z "$REVIEWER" ] || [ "$REVIEW_LINE" -lt "$LAST_EDIT" ]; then
    FAILURES+=("src/配下のコードが変更されていますが、最新の変更に対してレビューが実行されていません。todo-api-reviewerを実行してください(ユーザーがCodexでのレビューを求めている場合はcodex-reviewスキルを使用)。")
  elif [ "$PENDING" = "true" ]; then
    :
  elif [ "$VERDICT" = "FAIL" ]; then
    FAILURES+=("${REVIEWER}のレビューがCritical指摘を報告しています。指摘内容を確認・修正のうえ、同じレビュアーで再度レビューしてください。ただし、ユーザーがレビューのみを依頼している場合(「最終確認して」等)は修正せず、指摘を報告して修正するかどうかをユーザーに確認して終えてください。")
  elif [ "$VERDICT" != "PASS" ]; then
    FAILURES+=("${REVIEWER}のレビュー結果(REVIEW_VERDICT)を確認できませんでした。出力の最後にREVIEW_VERDICT行が出るよう、再度レビューしてください。")
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
