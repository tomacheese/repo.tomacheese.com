# GitHub Copilot Instructions

## プロジェクト概要

- 目的: tomacheese.com の公開 Maven リポジトリ
- 主な機能: Maven アーティファクトの静的配信、README の自動生成
- 対象ユーザー: Maven/Gradle を使用する開発者

## 共通ルール

- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従い、説明は日本語とする。
- 日本語と英数字の間には半角スペースを挿入する。

## 技術スタック

- 言語: TypeScript (README 生成ツール)
- パッケージマネージャー: pnpm
- 実行環境: Node.js

## 開発コマンド

README 生成ツール (`.github/generate-readme`) のディレクトリで実行します。

```bash
# 依存関係のインストール
pnpm install

# README の生成 (tsx)
pnpm start

# README の生成 (ts-node)
pnpm build

# 型チェック
pnpm lint:tsc

# Lint 実行
pnpm lint

# フォーマット修正
pnpm fix
```

## コーディング規約

- TypeScript において `skipLibCheck` を有効にして回避することは禁止。
- 関数やインターフェースには docstring (JSDoc) を日本語で記載。
- エラーメッセージは英語で記載。

## セキュリティ / 機密情報

- 認証情報や API キーをコミットしない。
- ログに機密情報を出力しない。

## リポジトリ固有

- ルートディレクトリの `com/`, `dev/` などのディレクトリは Maven リポジトリの実体であるため、手動で変更する場合は注意が必要。
- README は `.github/generate-readme` によって生成されるため、直接 `README.md` を編集しても上書きされる可能性がある。 `.github/generate-readme/template.md` を編集すること。
