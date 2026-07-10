---
name: add-todo-field
description: 既存のTodoリソースに新しいフィールドを型定義・repository・handlers・testsに一貫して追加する。「Todoにpriorityフィールドを追加して」等で使用。
---

# Todoへの新規フィールド追加

既存の `Todo` リソースに新しいフィールドを一貫した形で追加するための手順。フィールドが関わる箇所（型定義・repository・handlers・tests）を漏れなく更新する。

## 手順

1. フィールド名・型・必須かどうか・バリデーションルールをユーザーに確認する。

2. `src/db/repository.ts` の `Todo` interface にフィールドを追加する。

3. `repository.create` / `repository.update` を更新する:
   - `any` は使わない
   - `update` の引数は既存の `Partial<Pick<Todo, 'title' | 'completed'>>` のパターンに新フィールドを加える形にする

4. `src/api/handlers.ts` の `createTodo` / `updateTodo` を更新する:
   - リクエストボディからフィールドを取り出す際は具体的な型を指定する（`any` 禁止）
   - バリデーションが必要な場合はエラー時に400を返す（`{ error: string }` 形式）
   - try-catchは使わない

5. `tests/api.test.ts` に正常系・異常系（バリデーションが必要なら400のケース）のテストケースを追加する。

6. 生成後、`npx tsc --noEmit` と `npm test` を実行して型エラー・テスト失敗がないことを確認する。
