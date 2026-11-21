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

### 発展: 別モデル（Codex）によるレビュー（Agentic Engineering レベル7の一部）

実装したClaudeとは別のモデル（OpenAI Codex）にレビューさせる仕組みも用意しています。
同じモデルが自分の実装を評価すると問題を見逃しやすいため、重要な場面では別の視点を入れます。

---

## コードレビューの3つの役割（他プロジェクトへの持ち込み）

このリポジトリはテンプレートとして、規模の異なる他プロジェクトにも持ち込む前提です。
レビューは「どれか1つを選ぶ」のではなく、**役割ごとに使い分けます**。

| 役割 | 担当 | いつ使うか | 必要なもの |
|---|---|---|---|
| **毎回のゲート**（マージしてよいか） | プロジェクト専用サブエージェント（ここでは `todo-api-reviewer`） | 毎回。`Stop` フックが自動で要求する | 追加導入なし |
| **別モデルによる確認**（ルール準拠＋ルール外の重大なバグ） | 自作の `codex-review` スキル | 「Codexで最終確認して」等と依頼したとき。結果はゲートでも有効 | **Codex CLI** |
| **設計・前提を疑うレビュー**（大きな変更時） | 公式プラグインの `/codex:adversarial-review` | 認証の追加、永続化の変更、並行処理・状態遷移を含む変更など、設計の妥当性を疑ってほしいとき。手動で実行する | **Codex CLI ＋ プラグイン** |

使い分けの目安:

- **自作の `codex-review`** は `.claude/rules/*.md` を毎回プロンプトに埋め込むため、どのプロジェクトでもそのプロジェクトのルールに沿って判定します。最後に `REVIEW_VERDICT: PASS/FAIL` を出力し、`Stop` フックのゲートとつながっています。リポジトリ内に置かれているので、テンプレートとして持ち運べます
- **プラグインの `adversarial-review`** は「この変更を出荷させない理由を探す」姿勢で、冪等性・処理順序・部分的な失敗・スキーマの食い違い・データ消失などを重点的に狙います。プロジェクトのルールは知らないため、ルール準拠の判定には使いません。**規模が大きく、状態や並行処理を持つシステムほど効果が大きくなります**（小規模なCRUD APIでは指摘が少なくなります）

### 前提: Codex CLI のセットアップ（自作 `codex-review` とプラグインの両方で必要）

Codex CLI がなくても、毎回のゲート（`todo-api-reviewer`）はそのまま動きます。Codexを使うレビューを利用する場合のみ必要です。

1. インストール（どちらか）

   ```bash
   npm install -g @openai/codex
   # または
   brew install --cask codex
   ```

2. ログイン（ChatGPT の有料・無料プラン、または OpenAI API キー。ChatGPT プランの場合は Codex の利用枠を消費します）

   ```bash
   codex login          # ブラウザで「Sign in with ChatGPT」
   codex login status   # 「Logged in using ChatGPT」と出ればOK
   ```

   Claude Code のプロンプトから実行する場合は先頭に `!` を付けます（例: `! codex login`）。

3. 動作確認

   ```bash
   codex exec --sandbox read-only "このリポジトリの概要を3行で"
   ```

自作 `codex-review` は追加のセットアップ不要で、上記が済めば `.claude/codex-review.sh` がそのまま使えます
（`.claude/settings.json` で実行を許可済み）。

### 任意: 公式プラグイン（openai/codex-plugin-cc）のセットアップ

`adversarial-review` を使う場合のみ必要です。**プラグインはリポジトリではなく Claude Code 全体（ユーザー単位）に
インストールされる**ため、テンプレートをコピーしただけでは入りません。マシンごとに一度セットアップしてください。
前提として Codex CLI のセットアップ（上記）と Node.js 18.18 以上が必要です。

Claude Code のプロンプトで以下を順に実行します。

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

- `/codex:setup` は Codex CLI の導入とログイン状態を確認します（`ready: true` になればOK）
- **`--enable-review-gate` は付けないでください。** プラグイン独自の `Stop` フックのレビューゲートが有効になり、
  自作のゲートと二重にブロックするうえ、ループ回数の上限がなく利用枠を急速に消費しうると README で警告されています
- 使い方: `/codex:adversarial-review 重点的に見てほしい観点`（観点は省略可）。読み取り専用で、コードは修正しません
- プラグインのスクリプトはバージョン番号入りのパスに置かれ更新で変わるため、フックから直接呼ぶ設計にはしないでください
- 外す場合: `/plugin uninstall codex@openai-codex`

### 他プロジェクトに持ち込むときに書き換える箇所

| ファイル | 書き換える内容 |
|---|---|
| `.claude/agents/todo-api-reviewer.md` | プロジェクト専用のレビュアーとして作り直す（名前・チェック項目） |
| `.claude/review-verdict.jq` | レビュアーのサブエージェント名（`todo-api-reviewer`）と、編集を検出するパス（`/src/.*\.ts$`） |
| `.claude/hook-stop-test.sh` / `.claude/hook-src-fingerprint.sh` | テストコマンド（`npm test`）とレビュー対象のパス（`src/*.ts`） |
| `.claude/codex-review.sh` | プロンプト冒頭のプロジェクト説明（「Todo API(Node.js/TypeScript/Express、オンメモリ保存)」） |

---

## リポジトリ構成

```
.
├── CLAUDE.md                     # Claudeへの指示書（プロジェクト方針・フック挙動の解説）
├── .claude/
│   ├── settings.json             # Hooks 設定（SessionStart / PostToolUse / PreToolUse / SubagentStop / Stop）
│   ├── hook-session-baseline.sh  # セッション開始時の src/ 差分の指紋を記録
│   ├── hook-src-fingerprint.sh   # src/ 差分の指紋を計算（上記とStopフックで共用）
│   ├── hook-tsc.sh               # Edit/Write時に型チェックを自動実行
│   ├── hook-stop-test.sh         # 応答完了時に npm test + レビュー結果を検証するゲート
│   ├── hook-subagent-notify.sh   # サブエージェント完了時に通知音を鳴らす
│   ├── review-verdict.jq         # 会話ログを解析しレビュー実施済みかを判定
│   ├── codex-review.sh           # Codex CLI に批判的レビューを依頼（要 Codex CLI）
│   ├── rules/                    # Rules（規約をトピック別に分割）
│   │   ├── code-style.md
│   │   ├── api-design.md
│   │   ├── testing.md
│   │   └── error-handling.md
│   ├── skills/                   # Skills（定型作業の手順書）
│   │   ├── add-endpoint/         #   新規CRUDリソースを一括生成
│   │   ├── add-field/            #   既存リソースにフィールドを追加
│   │   └── codex-review/         #   Codex による別モデルのレビュー（要 Codex CLI）
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
- **Codexレビュー**（要 Codex CLI）: 変更後に「Codexで最終確認して」と依頼すると、`todo-api-reviewer` が通した変更にも
  別モデルの視点で指摘が入ることがあります。プラグインを導入済みなら `/codex:adversarial-review` と結果を比べてみてください。
