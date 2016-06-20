# 計算機

http://calc-1347.appspot.com/

ブラウザ上で計算式を評価し計算結果を返す計算機アプリケーションです。
変数の定義や関数の定義も行うことができます。

使い方は、以下を参照してください。

https://github.com/blackruffy/calc/wiki/%E4%BD%BF%E3%81%84%E6%96%B9

## 開発環境

- 開発言語: TypeScript
- パッケージ管理: npm
- タスクランナー: gulp
- ビルドツール: tsc
- 型定義管理ツール: typings
- 単体テスト: mocha
- ブラウザ化ツール: browserify
- ドキュメント化: typedoc

※上記以外の外部ライブラリは使用していません。

## ディレクトリ構成

```
+-+- src/: ソースコードのディレクトリ
  |
  +- test/: 単体テストのソースコードのディレクトリ
  |
  +- webapp/: index.htmlを置く場所
  |
  +- package.json: npmの設定ファイル
  |
  +- gulpfile.js: gulpの設定ファイル
  |
  +- typings.json: typingsの設定ファイル
  |
  +- tsconfig.json: tscの設定ファイル
```

## ビルド

※ビルドするにはnodejs, npmが必要です。

コマンドラインで以下のコマンドを実行します。

### 依存パッケージのインストール
    
```
npm install
```

以下のパッケージがインストールされます。

- typescript: TypeScriptのコンパイラです。
- browserify: CommonJSスタイルのコードをブラウザ化します。
- gulp: タスクランナーです。
- mocha: 単体テストです。
- gulp-mocha: mochaをgulpで使用できるようにします。
- typings: TypeScriptの型定義管理ツールです。
- vinyl-source-stream: browserifyをgulpで使用するために必要です。
- typedoc: API ドキュメントを生成します。

### 型定義ファイルのインストール

```
`npm bin`/typings install
```

以下の型定義ファイルがインストールされます。

- mocha
- node

### コンパイル

```
npm run tsc
```

TypeScriptで記述されたソースコードがJavaScriptに変換されます。

### 単体テスト

```
npm run test
```

### ブラウザ化

```
npm run browserify
```

srcディレクトリ内のソースコードをまとめて、webapp/js/main.jsに出力します。

## モジュール構成

以下は主なモジュールです。

- main.ts: エントリーポイントです。index.htmlから呼ばれます。
- ParserCombinator.ts: パーサコンビネータの実装です。
- ParserStream.ts: パーサへの入力データを表現する。
- ParserResult.ts: パース結果を表現する。
- CalcParser.ts: 計算式のパーサの実装です。
- CalcProcessor.ts: 構文木を評価します。
- CalcStructure.ts: 構文の構造を表現します。

## API ドキュメント

http://calc-1347.appspot.com/