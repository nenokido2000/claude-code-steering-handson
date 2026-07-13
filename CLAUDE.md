# Claude Code 主要5指示配信メソッド ハンズオン

## 目的
Claude Codeの主要な5つの指示配信方法を学ぶハンズオン

参考: https://claude.com/ja/blog/steering-claude-code-skills-hooks-rules-subagents-and-more

## ハンズオン進捗

- [x] Step 1: サンプルアプリ作成 + CLAUDE.md
- [x] Step 2: Rules の設定
- [x] Step 3: Hooks の設定
- [x] Step 4: Skills の作成
- [x] Step 5: Subagents の作成

## Hooks（`.claude/settings.json`）

- `PostToolUse`（Edit|Write時）: `hook-tsc.sh` で型チェックを自動実行
- `PreToolUse`（Bash時）: `rm -rf` を含むコマンドをブロック
- `SubagentStop`（todo-api-tester|todo-api-reviewer完了時）: `hook-subagent-notify.sh` で通知音を鳴らす
- `Stop`（応答完了時）: `hook-stop-test.sh` で以下2つをチェックし、失敗時は1回だけブロックしてClaudeに自律修正を促す（`stop_hook_active` で無限ループを防止。修正後も直っていなければ `systemMessage` でユーザーに警告する）
  - `npm test` を自動実行
  - `src/**/*.ts` に変更がある場合、`.claude/review-verdict.jq` で会話トランスクリプトを解析し、最新の変更に対して `todo-api-reviewer` が実行済みか、その結果(`REVIEW_VERDICT: PASS/FAIL`)にCritical指摘が残っていないかを検証する（レベル6: コードレビューもテストと同様の自動フィードバックループにする）

### レビューゲートの実際の流れ（誤解しやすいポイント）

`.claude/review-verdict.jq` は**過去の会話トランスクリプトを読むだけの受動的な処理**であり、`todo-api-reviewer` を起動する力はない(hookはシェルスクリプトなのでSubagentを直接呼び出せない)。実際に`todo-api-reviewer`を起動するのは常にClaude自身であり、レビューゲートは最低でも2ターンにまたがる。

1. Claudeがコードを編集し、応答を終えようとする → `Stop`発火 → `hook-stop-test.sh`実行
2. この時点では`todo-api-reviewer`はまだ呼ばれていないため、jqは「レビュー未実施」と判定 → `decision: block`（`reason`に「todo-api-reviewerを実行してください」等）
3. Claudeはblock理由を見て、**自分の判断で**`todo-api-reviewer`を`run_in_background: false`で起動する
4. `todo-api-reviewer`が`REVIEW_VERDICT: PASS/FAIL`を含む結果をトランスクリプトに残す。FAILならClaudeはCritical指摘を見て自律的にコード修正を試みる
5. Claudeが再度応答を終えようとする → `Stop`が再発火（`stop_hook_active: true`）→ `hook-stop-test.sh`が`REVIEW_VERDICT`を検出して最終判定

`npm test`のチェックと同じ`stop_hook_active`ガードを共有しているため、**強制できるのは実質1往復まで**。ステップ5で`FAIL`のままでも、`stop_hook_active: true`なら再ブロックはせず`systemMessage`で警告するだけに留まる（無限ループ防止）。「Critical指摘がある限り無限に自律修正し続ける」わけではない。

## Subagents（`.claude/agents/`）

- `todo-api-reviewer`: `.claude/rules/` のルールとリソース命名規則への準拠をチェックするコードレビューアー。出力の最後に必ず `REVIEW_VERDICT: PASS`/`FAIL` を1行出力し、Stopフックのレビューゲートが機械的に判定できるようにしている。**Stopフックのゲート用に呼ぶ場合は `run_in_background: false` を指定し、結果が返るまで待つこと**(バックグラウンド実行だと結果がその場のトランスクリプトに残らず、Stopフックが「レビュー未実施」として扱うため)
- `todo-api-tester`: devサーバーを起動しcurlでエンドポイントの動作を実地確認するエージェント

## サンプルアプリ構成（Todo API）

```
src/
├── api/
│   ├── routes.ts
│   ├── todo-handlers.ts
│   └── category-handlers.ts
├── db/
│   ├── todo-repository.ts
│   └── category-repository.ts
├── utils/
│   └── logger.ts
└── index.ts
tests/
├── todos.test.ts
└── categories.test.ts
```

新しいリソースは `<resource>-repository.ts` / `<resource>-handlers.ts` / `tests/<resource>.test.ts` の命名規則に従う。

Node.js/TypeScript製のシンプルなREST API

## 動作確認方法

サーバー起動:

```bash
npm run dev  # ポート3000で起動
```

curlによる確認:

```bash
# 一覧取得
curl http://localhost:3000/api/todos

# 作成
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "買い物をする"}'

# 単体取得
curl http://localhost:3000/api/todos/1

# 完了状態を更新
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 削除
curl -X DELETE http://localhost:3000/api/todos/1

# ヘルスチェック
curl http://localhost:3000/health
```

エラー系:

```bash
# 400: titleなしでPOST
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{}'

# 404: 存在しないIDを取得
curl http://localhost:3000/api/todos/999
```

テストのみ確認する場合:

```bash
npm test
```
