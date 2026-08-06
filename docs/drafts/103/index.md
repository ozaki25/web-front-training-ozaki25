# JSON — 言語をまたぐテキストのデータ形式

## 今日のゴール

- JSON がプログラミング言語をまたぐ「テキスト形式のデータ交換」だと知る
- JavaScript のオブジェクトとの「似て非なる」違いを知る
- `JSON.parse` / `JSON.stringify` の変換の仕組みと、消える値の存在を知る

## API のレスポンスは実は文字列

`fetch` で API を呼んで `.json()` で受け取ると、JavaScript のオブジェクトが手に入ります。

```ts
const res = await fetch("/api/users/42");
const user = await res.json();
console.log(user.name); // "田中"
```

しかし、サーバーからネットワーク越しに届くのは**テキスト**（文字列）です。`.json()` はそのテキストを JavaScript のオブジェクトに**変換**（パース）するメソッドです。

届いているテキストの実物はこんな形をしています。

```json
{"id":42,"name":"田中","active":true}
```

この形式が **JSON**（JavaScript Object Notation）です。名前の通り JavaScript のオブジェクト記法に由来しますが、**プログラミング言語をまたいで使えるテキスト形式**です。

サーバーが Python で書かれていても Go で書かれていても、JSON を返せばブラウザの JavaScript が読めます。だから API の共通語として使われています。

## JavaScript のオブジェクトとの違い

見た目がそっくりなので混同されがちですが、**JSON は JavaScript のオブジェクトではありません**。JSON はあくまで「テキスト」で、JavaScript のオブジェクトは「メモリ上のデータ構造」です。

| | JavaScript オブジェクト | JSON（テキスト） |
|---|---|---|
| 存在場所 | メモリ上 | 文字列（ネットワーク・ファイル） |
| キー | 引用符なしでも書ける（`{ name: "田中" }`） | **必ずダブルクォート**（`{"name":"田中"}`） |
| 値に使えるもの | 関数、undefined、Symbol なども含む | **文字列・数値・真偽値・null・配列・オブジェクト**のみ |
| コメント | // で書ける | 書けない |
| 末尾カンマ | 書ける | エラー |

だから JSON を扱うコードでは、テキストとオブジェクトの間の変換が必ず発生します。

## 変換の 2 つの API

| API | 方向 | 例 |
|-----|------|---|
| `JSON.parse(テキスト)` | テキスト **→** オブジェクト | レスポンスの読み取り |
| `JSON.stringify(オブジェクト)` | オブジェクト **→** テキスト | リクエストのボディ作成、ストレージへの保存 |

```ts
// オブジェクト → テキスト（送信用に変換）
const body = JSON.stringify({ name: "田中", age: 25 });
// body は文字列: '{"name":"田中","age":25}'

// テキスト → オブジェクト（受信後に変換）
const obj = JSON.parse('{"name":"田中","age":25}');
// obj は JavaScript のオブジェクト
```

`fetch` の `.json()` メソッドは、**レスポンスのテキストを読み取って `JSON.parse` する**ショートカットです。つまり裏で同じ変換が走っています。

## stringify で消える値

`JSON.stringify` には**黙って値を消す**挙動があります。JSON のテキスト形式で表現できない値は、エラーにならずに変換結果から抜け落ちます。

```ts
const data = {
  name: "田中",
  greet: () => "こんにちは",  // 関数
  score: undefined,            // undefined
  age: 25,
};

const json = JSON.stringify(data);
// '{"name":"田中","age":25}'
// greet（関数）と score（undefined）が消えている
```

| 値 | stringify での扱い |
|----|--------------------|
| `undefined`, 関数 | **消える**（配列の中では `null` に変わる） |
| `NaN`, `Infinity` | **`null` に変わる** |
| `Date` | 文字列に変わる（`parse` しても Date には戻らない） |
| `BigInt` | **エラーになる** |

特に `undefined` が消える挙動は、意図せずデータが欠落するバグの原因になります。フォームの値が空のまま送信されたとき、`undefined` が JSON では存在しなくなり、サーバー側で「そのフィールドは送られてこなかった」と解釈される、というパターンです。

::: tip localStorage にオブジェクトを保存するとき
localStorage は文字列しか保存できないため、`JSON.stringify` で変換して入れ、`JSON.parse` で取り出す、がセットの作法です。このとき上の「消える値」を知らないと、保存前と取り出し後でデータが変わる事故が起きます。
:::

## 壊れた JSON — パースエラー

`JSON.parse` に渡すテキストが JSON として不正だと、即座にエラーになります。

```ts
JSON.parse("{ name: '田中' }");
// SyntaxError: Expected property name or '}'
// キーにダブルクォートが無い、値がシングルクォート → 不正
```

「API からの応答を parse したらエラーになった」というときは、**返ってきたテキストが本当に JSON かどうか**を DevTools の Network タブで確認するのが第一歩です。HTML のエラーページ（404 の画面など）が返っていて、それを `.json()` しようとしているパターンが多いからです。

fetch は 404 などの HTTP エラーでも失敗扱いにしません。だから `.json()` を呼ぶ前に、レスポンスの `res.ok`（成功なら `true` になるプロパティ）を確かめると、このパターンを防げます。

## まとめ

- JSON は言語をまたぐテキスト形式のデータ交換フォーマットで、JS オブジェクトとは別物
- `JSON.parse`（テキスト → オブジェクト）と `JSON.stringify`（オブジェクト → テキスト）が変換の両輪
- `undefined` や関数は stringify で黙って消え、保存前後でデータが変わる事故の原因
- パースエラーの多くは、返ってきたテキストがそもそも JSON ではないことが原因
