---
name: add-endpoint
description: 新しいCRUDリソース(repository/handlers/routes/tests)をこのTodo APIのルールに沿って一括生成する。「新しいエンドポイントを追加して」「〜リソースのAPIを作って」等で使用。
---

# 新規CRUDエンドポイントの追加

このTodo APIに新しいリソースを追加するための手順。既存の `src/db/repository.ts`, `src/api/handlers.ts`, `src/api/routes.ts`, `tests/api.test.ts` をテンプレートとして参照し、同じパターンを踏襲すること。

## 手順

1. リソース名（単数形・複数形）と保持するフィールドをユーザーに確認する。

2. `src/db/<resource>-repository.ts` を作成する。`src/db/repository.ts` と同じ構造にする:
   - エンティティの `interface`（`id`, `createdAt` を含む）
   - `findAll` / `findById` / `create` / `update` / `delete` / `clear` を持つオブジェクトをexport
   - `any` は使わず具体的な型か `unknown` を使う

3. `src/api/<resource>-handlers.ts` を作成する。`src/api/handlers.ts` と同じ構造にする:
   - Expressの `Request` / `Response` を使う純粋な関数群
   - 存在しないリソースへのアクセスは404、バリデーションエラーは400を返す（`{ error: string }` 形式）
   - try-catchは使わない（想定外エラーはExpressのデフォルトハンドラに任せる）
   - ログ出力は `console.log` ではなく `src/utils/logger.ts` の `logger` を使う

4. `src/api/routes.ts` にルーティングを追記する:
   - パスは `/api/` prefix、リソース名は複数形
   - ステータスコードは GET=200, POST=201, DELETE=204

5. `tests/<resource>.test.ts` を作成する。`tests/api.test.ts` と同じ構成にする:
   - `beforeEach` で `repository.clear()` を呼び対応するリソースのrepositoryをクリアしてテスト間の状態を分離する
   - 正常系と異常系（404, 400）を両方カバーする

6. 生成後、`npx tsc --noEmit` と `npm test` を実行して型エラー・テスト失敗がないことを確認する。
