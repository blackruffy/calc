# 計算機

PCブラウザ上で計算式を評価し計算結果を出力する計算機アプリケーションです。
変数の定義や関数の定義も行うことができます。

技術的な都響は以下です。

- モナドベースのParser combinatorの独自実装
- 上記のParser combinatorを用いた独自言語の実装
- 上記の言語のインタープリターの実装

http://calc-1347.appspot.com/

使い方は、以下を参照してください。

https://github.com/blackruffy/calc/wiki/%E4%BD%BF%E3%81%84%E6%96%B9

## 開発環境

- 開発言語: TypeScript
- パッケージ管理: npm
- タスクランナー: gulp
- コンパイラ: tsc
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

- ビルドするにはnodejs, npmが必要です。
- Linuxでは次の環境でビルドを確認しています。

    - ubuntu: 16.04 LTS
    - node.js: v5.1.0
    - npm: v3.3.12

- Windowsでは次の環境でビルドを確認しています。

    - Windows 10
    - node.js: v4.4.5
    - npm: v2.15.5

- Macでは次の環境でビルドを確認しています。

    - OS X Elcapitan
    - node.js: v5.7.0
    - npm: v3.6.0

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

http://calc-1347.appspot.com/doc/index.html

## Node.jsのライブラリとして使う

Node.jsのライブラリとしても使えます。

以下は、計算式を表現した文字列を評価して結果を返す関数`evaluate`を使用した例です。

```
import { evaluate } from "./CalcProcessor"

// 式を評価する
const r = evaluate("(1 + E*sin(PI/2))^2")

// 結果を出力する
console.log( r.getLeftOrElse( x => x.toString() ) )
```