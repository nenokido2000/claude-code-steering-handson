---
name: add-field
description: 既存のリソース（Todo, Category など）に新しいフィールドを型定義・repository・handlers・testsに一貫して追加する。「Todoにpriorityフィールドを追加して」「Categoryにdescriptionフィールドを追加して」等、既存リソースへのフィールド追加で使用。新しいリソース自体を追加する場合は add-endpoint を使う。
---

# 既存リソースへの新規フィールド追加

既存のリソースに新しいフィールドを一貫した形で追加するための手順。フィールドが関わる箇所（型定義・repository・handlers・tests）を漏れなく更新する。

## 手順

1. 対象リソース名と、追加するフィールド名・型・必須かどうか・バリデーションルールをユーザーに確認する（既存リソースは `src/db/*-repository.ts` から判別できる）。

2. リソース名からファイルパスを特定する:
   - Repository: `src/db/<resource>-repository.ts`（小文字単数形、例: todo → `todo-repository.ts`）
   - Handlers: `src/api/<resource>-handlers.ts`
   - Tests: ファイル名を直接組み立てず、`tests/` 配下で `<resource>Repository` を import しているファイルを検索して特定する（複数形化は不規則な場合がある）
   - 該当ファイルが見つからない場合、リソース名の誤りか対象がまだ `add-endpoint` で作られていない可能性があるため、ユーザーに確認する

3. `<resource>-repository.ts` の `<Resource>` interface（PascalCase単数、例: `Todo`, `Category`）にフィールドを追加する。

4. 同ファイルの `create` / `update` を更新する:
   - `any` は使わない
   - `update` の引数は既存の `Partial<Pick<<Resource>, ...>>` のパターンに新フィールドを加える形にする

5. `<resource>-handlers.ts` の `create<Resource>` / `update<Resource>` を更新する:
   - リクエストボディからフィールドを取り出す際は具体的な型を指定する（`any` 禁止）
   - バリデーションが必要な場合はエラー時に400を返す（`{ error: string }` 形式）
   - try-catchは使わない

6. 手順2で特定したテストファイルに正常系・異常系（バリデーションが必要なら400のケース）のテストケースを追加する。

7. 生成後、`npx tsc --noEmit` と `npm test` を実行して型エラー・テスト失敗がないことを確認する。
