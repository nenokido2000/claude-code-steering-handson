# Claude Code 主要5指示配信メソッド ハンズオン

Claude Code に「どう振る舞ってほしいか」を伝える主要な **5つの指示配信メソッド** ——
**CLAUDE.md / Rules / Hooks / Skills / Subagents** —— を、実際に動く小さな **Todo API** を題材に、
一つずつ手を動かして学ぶハンズオン用リポジトリです。

さらに発展として、**Hooks × Subagents を組み合わせたコードレビューの自動フィードバックループ**まで踏み込んでいます。

参考記事:

- [Steering Claude Code: skills, hooks, rules, subagents, and more (Anthropic)](https://claude.com/ja/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
- [Levels of Agentic Engineering (Bassim Eledath)](https://www.bassimeledath.com/blog/levels-of-agentic-engineering)

> **README と CLAUDE.md の違い**
> この README は **人間の読者**に向けて「このリポジトリは何で、何が学べて、どう動かすか」を説明します。
> 一方 [`CLAUDE.md`](./CLAUDE.md) は **Claude（AIエージェント）への指示書**で、開発時の作業ルールや
> フックの内部挙動などが書かれています。動かしながら中身を読み比べると、両者の役割の違いが体感できます。

---

## このリポジトリで学べること

| メソッド | 何をするものか | このリポジトリでの実装場所 |
|---|---|---|
| **CLAUDE.md** | プロジェクト全体の文脈・方針を常時Claudeに渡す | [`CLAUDE.md`](./CLAUDE.md) |
| **Rules** | コーディング規約など細かいルールをトピック別に分割して渡す | [`.claude/rules/`](./.claude/rules/) |
| **Hooks** | ツール実行や応答完了などのタイミングでスクリプトを自動実行する | [`.claude/settings.json`](./.claude/settings.json)、`.claude/hook-*.sh` |
| **Skills** | 定型作業の手順書をコマンドとして呼び出せるようにする | [`.claude/skills/`](./.claude/skills/) |
| **Subagents** | 特定タスク専用のサブエージェントに仕事を委譲する | [`.claude/agents/`](./.claude/agents/) |

### 発展: 自動フィードバックループ（Agentic Engineering レベル6）

`Stop` フック（応答完了時）に、`npm test` のゲートに加えて **`todo-api-reviewer` によるコードレビュー**を
組み込んでいます。テスト・型チェックだけでなく、**コードレビューまで自動化されたバックプレッシャー**として働き、
ルール違反が残っている限りClaudeに自律修正を促します。仕組みの詳細は [`CLAUDE.md`](./CLAUDE.md) の
「レビューゲートの実際の流れ」を参照してください。

---

## リポジトリ構成

```
.
├── CLAUDE.md                     # Claudeへの指示書（プロジェクト方針・フック挙動の解説）
├── .claude/
│   ├── settings.json             # Hooks 設定（PostToolUse / PreToolUse / SubagentStop / Stop）
│   ├── hook-tsc.sh               # Edit/Write時に型チェックを自動実行
│   ├── hook-stop-test.sh         # 応答完了時に npm test + レビュー結果を検証するゲート
│   ├── hook-subagent-notify.sh   # サブエージェント完了時に通知音を鳴らす
│   ├── review-verdict.jq         # 会話ログを解析しレビュー実施済みかを判定
│   ├── rules/                    # Rules（規約をトピック別に分割）
│   │   ├── code-style.md
│   │   ├── api-design.md
│   │   ├── testing.md
│   │   └── error-handling.md
│   ├── skills/                   # Skills（定型作業の手順書）
│   │   ├── add-endpoint/         #   新規CRUDリソースを一括生成
│   │   └── add-field/            #   既存リソースにフィールドを追加
│   └── agents/                   # Subagents
│       ├── todo-api-reviewer.md  #   ルール準拠をチェックするレビューアー
│       └── todo-api-tester.md    #   devサーバーにcurlで疎通確認するテスター
├── src/                          # 題材アプリ（Todo API）本体
│   ├── api/                      #   ルーティングとハンドラ（<resource>-handlers.ts）
│   ├── db/                       #   インメモリのリポジトリ層（<resource>-repository.ts）
│   ├── utils/logger.ts
│   └── index.ts
└── tests/                        # リソースごとのテスト（<resource>.test.ts）
```

リソースは `add-endpoint` スキルで随時追加される想定で、**リソースを1つ足すごとに
`<resource>-repository.ts` / `<resource>-handlers.ts` / `tests/<resource>.test.ts` が増えます**。
現在どのリソースが存在するかは [`src/api/routes.ts`](./src/api/routes.ts) を見るのが確実です。

---

## 題材アプリ: Todo API

Node.js / TypeScript / Express 製のシンプルな REST API です。データはインメモリで保持します（DBなし・再起動で消えます）。
リソースは複数あり、いずれも同じ CRUD パターンに従います（新しいリソースも同じ形で追加されます）。

### セットアップ

```bash
npm install
```

### 起動

```bash
npm run dev   # http://localhost:3000 で起動（tsx watch でホットリロード）
```

### テスト

```bash
npm test           # Jest でユニットテスト
npx tsc --noEmit   # 型チェックのみ
```

### エンドポイントの形

各リソースは以下の共通パターンで公開されます（`<resource>` は複数形のリソース名）。
リソースの増減があってもこの表は変わりません。

| メソッド | パス | 説明 | 成功時ステータス |
|---|---|---|---|
| GET | `/api/<resource>` | 一覧取得 | 200 |
| GET | `/api/<resource>/:id` | 単体取得 | 200 |
| POST | `/api/<resource>` | 作成 | 201 |
| PATCH | `/api/<resource>/:id` | 更新 | 200 |
| DELETE | `/api/<resource>/:id` | 削除 | 204 |
| GET | `/health` | ヘルスチェック | 200 |

実際に有効なリソース名は [`src/api/routes.ts`](./src/api/routes.ts) で確認してください。

### curl での動作確認例

以下は `todos` リソースを例にした操作です（他のリソースも `<resource>` を置き換えれば同様に動きます）。

```bash
# 一覧取得
curl http://localhost:3000/api/todos

# 作成
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "買い物をする"}'

# 完了状態を更新
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 削除
curl -X DELETE http://localhost:3000/api/todos/1

# エラー系: title なしで 400
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" -d '{}'

# エラー系: 存在しないIDで 404
curl http://localhost:3000/api/todos/999
```

---

## 各メソッドを実際に試す

Claude Code をこのリポジトリで開いた状態で、以下を試すと各メソッドの挙動を体感できます。

- **Rules / CLAUDE.md**: 「〜フィールドを追加して」等と依頼すると、`.claude/rules/` の規約
  （`any` 禁止・`console.log` 禁止・エラーは `{ error: string }` 形式 など）に沿ったコードが生成されます。
- **Skills**: `add-endpoint`（新規リソース一括生成）や `add-field`（既存リソースへのフィールド追加）を呼び出すと、
  命名規則・テスト・ルーティングまで一貫して生成されます。
- **Subagents**: `todo-api-reviewer` にルール準拠のレビューを、`todo-api-tester` に実サーバーへの疎通確認を委譲できます。
- **Hooks**: コードを編集して応答が完了すると、`Stop` フックが `npm test` とレビュー結果を自動でチェックし、
  問題があればClaudeに修正を促します。
