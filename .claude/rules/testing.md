# テスト

- 新しいエンドポイントを追加したら、そのリソース専用の `tests/<resource>.test.ts`（例: `tests/todos.test.ts`, `tests/categories.test.ts`）にテストを追加する。単一の `tests/api.test.ts` に追記するものではない
- 正常系と異常系（404, 400）を両方テストする
- 各リソースの `<resource>Repository.clear()` を `beforeEach` で呼び出してテスト間の状態を分離する。他リソースのフィールド（外部キーなど）をfixtureとして生成するテストがある場合は、そのリソースのrepositoryも合わせてclearする
