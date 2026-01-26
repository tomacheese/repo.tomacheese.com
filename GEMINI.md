# GEMINI.md

## 目的

Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル

- 言語: 日本語
- トーン: プロフェッショナルかつ簡潔
- 形式: Markdown

## 共通ルール

- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従い、説明は日本語とする。
- 日本語と英数字の間には半角スペースを挿入する。

## プロジェクト概要

- 目的: tomacheese.com の公開 Maven リポジトリ
- 主な機能: Maven アーティファクトの静的配信、README の自動生成

## コーディング規約

- フォーマットはプロジェクトの既存ルールに従う。
- コメントは日本語、エラーメッセージは英語。
- TypeScript の `skipLibCheck` は使用しない。

## 開発コマンド

`.github/generate-readme` ディレクトリで実行。

```bash
# 依存関係のインストール
pnpm install

# README の生成 (動作確認)
pnpm start

# Lint 実行
pnpm lint

# 自動修正
pnpm fix
```

## 注意事項

- 認証情報や API キーをコミットしない。
- 既存のプロジェクト方針やスタイルを優先する。
- README は生成ツールによって管理されていることを意識する。

## リポジトリ固有

- Maven リポジトリとしての構造 (`maven-metadata.xml` など) を破壊しないように注意する。
- 依存関係の管理には pnpm を使用する。
