# AGENTS.md

## 言語ルール

- コミットメッセージの説明、PR / Issue のタイトルと本文、コードコメント、ドキュメントは日本語で書く。日本語と英数字の間には半角スペースを入れる。
- 例外: 技術的な識別子 (パッケージ名、groupId / artifactId、ファイル名など)、引用、`package.json` (常に英語)。
- ワークフロー内のコミットメッセージ (`feat: Updated README.md [skip ci]` など) は実行時に使われる文字列なので変更しない。

## 概要

このリポジトリ自体が Tomacheese の Maven リポジトリで、<https://repo.tomacheese.com> として公開されている (`CNAME` によるカスタムドメイン、GitHub Pages)。公開される Maven アーティファクトはルート直下の `com/` と `dev/` にあり、手書きではなく CI の `mvn deploy` で配置される。`README.md` は全アーティファクトとバージョンの一覧で、自動生成される。

手書きのソースコードは `.github/generate-readme/` の README ジェネレーター (TypeScript、Node.js 上で pnpm 実行、バージョンは `.node-version`) だけである。

## ディレクトリ構成

- `com/`, `dev/`: 公開済みの Maven アーティファクト (`maven-metadata.xml`、jar、pom など)。デプロイワークフローが生成するため手で編集しない。
- `README.md`: すべての `maven-metadata.xml` から生成される。手で編集せず、`.github/generate-readme/template.md` やジェネレーターを編集する。
- `CNAME`: カスタムドメイン (`repo.tomacheese.com`)。削除しない。
- `.github/generate-readme/`: README ジェネレーター。
- `.github/workflows/`: CI とデプロイの自動化。

## 開発コマンド

すべて `.github/generate-readme/` の中で実行する。`preinstall` の `only-allow pnpm` により pnpm のみ使用できる (npm / yarn は使わない)。

- `pnpm install --frozen-lockfile`: 依存関係のインストール。
- `pnpm start --target ../../ --output ../../README.md`: リポジトリ直下の `maven-metadata.xml` を走査して `README.md` を再生成する (`generate-readme` ワークフローと同じ処理)。
- `pnpm run lint`: Prettier チェック、ESLint、`tsc` を実行する。
- `pnpm run fix`: Prettier と ESLint の自動修正。
- `pnpm run dev`: tsx のウォッチモード。

`.github/workflows/ci.yml` は `main` / `master` への push と PR で `pnpm run lint` と `npx depcheck` を実行する。

## ジェネレーターの仕様 (`src/main.ts`)

エントリポイントは 1 つだけである。`--target` 以下の `maven-metadata.xml` を再帰的に探し、`fast-xml-parser` で解析する。最新バージョンは `versioning.latest`、`versioning.release`、`version` の順で採用し、いずれもなければ警告を出してそのファイルをスキップする。`versioning.versions.version` は単一文字列にも配列にもなるため、両方を扱う。生成した一覧は `template.md` の `{{REPOSITORYS}}` に差し込み、`--output` に書き出す。

## コーディング規約

- TypeScript は strict (`strict`、`noUnusedLocals`、`noUnusedParameters`、`noImplicitReturns`)。未使用のシンボルを残さない。
- Prettier (`.prettierrc.yml`): セミコロンなし、シングルクォート、`printWidth` 80、末尾カンマ `es5`。コミット前に `pnpm run fix` を実行する。
- ESLint は共有設定 `@book000/eslint-config` を使う。

## アーティファクトの追加

`workflow_dispatch` のワークフロー (`create-repo-maven.yml`、`jsa2-deploy.yml`) が、このリポジトリへ `mvn deploy` して PR を作成する。`com/` や `dev/` に jar / pom を手でステージしない。

## 禁止事項・不変条件

- `README.md` と `com/`・`dev/` 配下を手で編集しない。次回のデプロイや生成で上書きされる。
- シークレットをコミットしない。`generate-readme` ワークフローは GitHub Actions のシークレット `PUSH_DEPLOY_KEY` で SSH プッシュする。
- `generate-readme` ワークフローの `known_hosts` 固定と `StrictHostKeyChecking yes` を弱めない。固定済みのアクションの SHA も固定したままにする。
- パッケージマネージャーを pnpm から変えない。
- ジェネレーターの挙動、コマンド、ワークフロー構成を変えたら、同じ変更でこのファイルと (出力形式が変わるなら) `template.md` も更新する。
