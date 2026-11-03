# Copilot レビュー指針

プロジェクトの概要、コマンド、規約は [AGENTS.md](../AGENTS.md) を参照してください。レビューコメントは日本語で書いてください。

## レビュー対象

- `.github/generate-readme/` (TypeScript) と `.github/workflows/` (GitHub Actions) の変更をレビューする。
- 機械生成されたファイルは指摘しない。`README.md` と `com/`、`dev/` 配下 (`maven-metadata.xml`、jar、pom) が該当する。
- Prettier と ESLint が強制するスタイル (セミコロンなし、シングルクォートなど) は指摘しない。

## 重点的に見る点

- **ジェネレーターの正しさ** (`src/main.ts`): `fast-xml-parser` が返すバージョンノードは単一文字列にも配列にもなる。両方の形が扱われ続けていること。`versioning.latest` / `release` / `version` の null / undefined は、クラッシュさせずにエントリをスキップする設計であること。
- **ファイルシステムの走査**: `maven-metadata.xml` の再帰走査が想定外のエントリで例外を投げないこと。保護されていない `fs` 呼び出しに注意する。
- **ワークフローのセキュリティ**: `generate-readme` は `secrets.PUSH_DEPLOY_KEY` の SSH デプロイキーでプッシュする (`known_hosts` 固定、`StrictHostKeyChecking yes`)。Maven デプロイ系 (`create-repo-maven.yml`、`jsa2-deploy.yml`) は `secrets.GITHUB_TOKEN` で `hub` により PR を作る。シークレットの出力、`StrictHostKeyChecking` の弱体化、認証情報の直書きは指摘する。固定済みのアクション SHA は固定のままにする。
- **パッケージマネージャー**: pnpm のみ許可 (`only-allow pnpm`)。npm / yarn のロックファイルの追加や、スクリプト・ワークフローでの `npm` / `yarn` 実行は指摘する。
- generate-readme の自動コミットにある `[skip ci]` は意図的なものなので、削除を提案しない。

コメントは具体的で実行可能なものにし、差分の言い換えや一般的な称賛は避けてください。
