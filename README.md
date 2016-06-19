# 計算機

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

※上記以外の外部ライブラリは使用していません。

## ディレクトリ構成

```
+-+- src: ソースコード
  |
  +- test: 単体テストのソースコード
  |
  +- webapp: index.htmlを置く場所
  
```

## ビルド

※ビルドするにはnodejs, npmが必要です。

コマンドラインで以下のコマンドを実行します。

### 依存パッケージのインストール

以下のパッケージがインストールされます。

- typescript: TypeScriptのコンパイラです。
- browserify: CommonJSスタイルのコードをブラウザ化します。
- gulp: タスクランナーです。
- mocha: 単体テストです。
- gulp-mocha: mochaをgulpで使用できるようにします。
- typings: TypeScriptの型定義管理ツールです。
- vinyl-source-stream: browserifyをgulpで使用するために必要です。
    
```
npm install
```

### 型定義ファイルのインストール

以下の型定義ファイルをインストールします。

- mocha
- node

```
`npm bin`/typings install
```

### コンパイル

TypeScriptで記述されたソースコードをJavaScriptに変換します。

```
npm run tsc
```

### 単体テスト

```
npm run test
```

### ブラウザ化

srcディレクトリ内のソースコードをまとめて、webapp/js/main.jsに出力します。

```
npm run browserify
```

## モジュール構成

以下は主なモジュールです。

- main.ts: エントリーポイント。index.htmlから呼ばれます。
- ParserCombinator.ts: パーサコンビネータの実装。
- CalcParser.ts: 計算式のパーサの実装。
- CalcProcessor.ts: 構文木を評価します。
