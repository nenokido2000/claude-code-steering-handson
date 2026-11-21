#!/bin/bash
cd "$(dirname "$0")/.."

OUT=$(mktemp)
trap 'rm -f "$OUT"' EXIT

RULES=$(cat .claude/rules/*.md)
FOCUS="${1:-}"

PROMPT="あなたはこのTodo API(Node.js/TypeScript/Express、オンメモリ保存)の批判的なシニアレビュアーです。
実装者とは別の視点で、見逃されがちな問題を厳しく指摘してください。ファイルは編集せず、読み取りのみ行ってください。

## レビュー対象
\`git diff HEAD\` と \`git status --porcelain\` で確認できる未コミットの変更(未追跡の新規ファイルを含む)。必要に応じて周辺コードも読むこと。

## 観点
1. 以下のプロジェクトルールへの違反
2. ルール外でも重大なもの: バグ、境界値・異常系の漏れ、型の穴、データ整合性(他リソースへの参照など)、テストの抜け、設計上の問題

## プロジェクトルール
${RULES}
${FOCUS:+
## 特に重視する観点
${FOCUS}
}
## 出力形式
- 指摘ごとに: 重要度(Critical / Important / Minor)、ファイルパス:行番号、問題点、具体的な修正案
- Critical: マージすべきでない明確なバグやルール違反。Important: 対応すべき問題。Minor: 改善提案
- 確認や質問は不要です。具体的な提案まで自主的に出力してください。
- 最後に必ず単独の行で次のどちらかだけを出力し、その後に何も書かないこと:
REVIEW_VERDICT: PASS
REVIEW_VERDICT: FAIL
(Criticalが1件でもあればFAIL、なければPASS)"

codex exec --sandbox read-only --ephemeral --color never -o "$OUT" "$PROMPT" > /dev/null 2>.claude/codex-review.log
STATUS=$?

if [ $STATUS -ne 0 ] || [ ! -s "$OUT" ]; then
  echo "Codexレビューの実行に失敗しました(exit=$STATUS)。.claude/codex-review.log を確認してください。"
  exit 1
fi

cat "$OUT"
