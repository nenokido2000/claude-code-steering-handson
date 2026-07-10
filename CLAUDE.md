# Claude Code 主要5指示配信メソッド ハンズオン

## 目的
Claude Codeの主要な5つの指示配信方法を学ぶハンズオン

参考: https://claude.com/ja/blog/steering-claude-code-skills-hooks-rules-subagents-and-more

## ハンズオン進捗

- [x] Step 1: サンプルアプリ作成 + CLAUDE.md
- [x] Step 2: Rules の設定
- [x] Step 3: Hooks の設定
- [ ] Step 4: Skills の作成
- [ ] Step 5: Subagents の作成

## サンプルアプリ構成（Todo API）

```
src/
├── api/
│   ├── routes.ts
│   └── handlers.ts
├── db/
│   └── repository.ts
├── utils/
│   └── logger.ts
└── index.ts
tests/
└── api.test.ts
```

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
