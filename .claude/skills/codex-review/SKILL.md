---
name: codex-review
description: OpenAI Codex CLIに、未コミットの変更を実装者(Claude)とは別モデルの視点で批判的にレビューさせる。通常のレビューはtodo-api-reviewerサブエージェントを使い、このスキルは「Codexでレビューして」「最終確認して」「批判的にレビューして」「別モデルの目で見て」等、ユーザーが明示的に求めた場合のみ使用する。結果はStopフックのレビューゲートでもtodo-api-reviewerと同等に扱われる。
---

# Codexによる批判的レビュー

## 手順

1. 次のコマンドをBashで実行する。Codexのレビューは数分かかるため `timeout: 600000` を指定し、`run_in_background` は使わない(結果がその場のトランスクリプトに残らないとStopフックが判定できないため)。

   ```bash
   .claude/codex-review.sh
   ```

   ユーザーが特に重視する観点を挙げた場合は、第1引数に渡す(例: `.claude/codex-review.sh "categoryId/tagIdの参照整合性"`)。

2. 出力をユーザーに要約して報告する。Critical / Important / Minor ごとに整理し、Codexの指摘のうち妥当でないと判断したものはその理由も添える(別モデルの指摘を鵜呑みにしない)。

3. `REVIEW_VERDICT: FAIL` の場合は、Critical指摘を修正したうえで再度このスキルを実行する。修正方針に迷う指摘はユーザーに確認する。

4. スクリプトが失敗した場合は `.claude/codex-review.log` を確認し、未ログインなら `codex login` をユーザーに依頼する。
