# Day X: フォーム — HTML だけで送信もバリデーションもできる

## 今日のゴール

- HTML だけでフォーム送信ができることを知る
- name、label、type、required などの属性が、それぞれ何を担当しているかを知る
- フォームを「正しく」実装するために HTML が用意している仕組みを知る

## フォームは JavaScript なしで送信できる

React や Next.js でフォームを作るとき、`onSubmit` で関数を呼んで、入力値を集めて、`fetch` で送信する ── そんなコードを見たことがあるかもしれません。

実は **HTML だけでフォーム送信はできます。** JavaScript は1行もいりません。

```html
<form action="/api/contact" method="post">
  <label for="email">メールアドレス</label>
  <input type="email" id="email" name="email" />

  <label for="message">メッセージ</label>
  <textarea id="message" name="message"></textarea>

  <button type="submit">送信</button>
</form>
```

このフォームの送信ボタンを押すと、ブラウザが自動で:

1. 入力欄のデータを集める
2. `action` で指定された URL に
3. `method` で指定された方法で
4. データを送信する

JavaScript で同じことを書こうとすると、データの収集、エンコード、`fetch` の呼び出し、エラー処理などを自分で実装することになります。HTML はこれらをすべて、タグと属性だけで提供しています。

## 送信先と送信方法 — action と method

`<form>` タグには「どこに」「どうやって」データを送るかを指定します。

| 属性 | 役割 |
|------|------|
| `action` | データの送信先 URL |
| `method` | `get` は URL のクエリパラメータとして、`post` はリクエスト本文として送信 |

```html
<!-- 検索フォーム: get を使う -->
<!-- 送信すると /search?q=入力内容 という URL になる -->
<form action="/search" method="get">
  <label for="q">検索</label>
  <input type="search" id="q" name="q" />
  <button type="submit">検索する</button>
</form>

<!-- お問い合わせフォーム: post を使う -->
<form action="/api/contact" method="post">
  <label for="email">メールアドレス</label>
  <input type="email" id="email" name="email" />
  <button type="submit">送信</button>
</form>
```

使い分けの基準は **「サーバーの状態を変えるかどうか」** です。

- **`get`**: データの取得や検索など、サーバーの状態を変えない操作。結果は URL に残るのでブックマークや共有ができ、ブラウザのキャッシュも効く
- **`post`**: 登録・更新・送信など、サーバーの状態を変える操作。リロードや戻る操作で気軽に再送信されたくないもの

「URL にデータが見えるかどうか」はあくまで副次的な違いです。通信の中身を守りたいなら HTTPS を使う話で、メソッドの選択とは別の問題です。

## name 属性 — 送信データのキー

`name` 属性は、フォームデータを送信するときの **キー名** になります。

```html
<form action="/api/contact" method="post">
  <input type="email" name="email" value="user@example.com" />
  <textarea name="message">こんにちは</textarea>
  <button type="submit">送信</button>
</form>
```

このフォームを送信すると、ブラウザは以下のようなデータを送ります。

```
email=user@example.com&message=こんにちは
```

`name` 属性がない入力欄は、**送信データに含まれません。** 見た目には入力できるのにデータが送られないので、気づきにくいバグの原因になります。

```html
<!-- ❌ name がない → データが送信されない -->
<input type="email" id="email" />

<!-- ✅ name がある → email=... として送信される -->
<input type="email" id="email" name="email" />
```

## button の type — フォームを送信するのは「submit ボタン」

ここまで「送信ボタンを押すとフォームが送信される」と書いてきましたが、もう少し正確に言うと、フォームを送信するのは `<button>` の中でも **`type="submit"` のボタン** です。

`<button>` タグには `type` 属性があり、押したときの動作を3種類から選べます。

| type | 動作 |
|------|------|
| `submit` | フォームを送信する |
| `button` | 何もしない（JavaScript で動作を付ける） |
| `reset` | フォームの入力値をリセットする |

そして注意点として、**`type` を省略すると `submit` になります。** つまり何も指定しないボタンは「フォーム送信ボタン」として扱われます。

```html
<form action="/search" method="get">
  <label for="keyword">検索</label>
  <input type="text" id="keyword" name="q" />

  <!-- ❌ type を省略している → 押すとフォームが送信されてしまう -->
  <button onclick="toggleFilter()">フィルターを表示</button>

  <button type="submit">検索する</button>
</form>
```

「フィルターを表示」のつもりが、ボタンを押した瞬間にフォームが送信されてしまいます。

```html
<!-- ✅ type="button" を明示する → 送信されない -->
<button type="button" onclick="toggleFilter()">フィルターを表示</button>
```

**フォーム送信が目的でない button には、必ず `type="button"` を付ける。** これは習慣にしておくとバグを防げます。

## label の紐付け — ないと何が壊れるか

`<label>` を `<input>` に紐付けないと、以下が壊れます。

```html
<!-- ❌ 紐付けがない -->
<label>メールアドレス</label>
<input type="email" id="email" name="email" />
```

1. **クリック範囲**: 「メールアドレス」というテキストをクリックしても入力欄にフォーカスが移らない。特にチェックボックスやラジオボタンでは、小さなボックス部分をピンポイントでクリックする必要がある
2. **スクリーンリーダー**: 入力欄にフォーカスしたとき「テキスト入力」としか読み上げられない。何を入力すればいいかわからない

```html
<!-- ✅ for と id で紐付ける -->
<label for="email">メールアドレス</label>
<input type="email" id="email" name="email" />
```

`<label>` の `for` 属性と `<input>` の `id` 属性を同じ値にするだけで、ラベルクリックで入力欄にフォーカスが移り、スクリーンリーダーも「メールアドレス、テキスト入力」と読み上げてくれます。

## input の type — ブラウザの振る舞いを変えるスイッチ

`<input>` の `type` を正しく選ぶだけで、ブラウザが **自動で** 以下をやってくれます。

1. **スマートフォンのキーボードを最適化** する
2. **入力値のバリデーション（チェック）** を行う
3. **専用の入力 UI** を表示する

```html
<!-- type="email": メールアドレス用キーボード（@ が打ちやすい）+ 形式チェック -->
<input type="email" name="email" />

<!-- type="tel": 電話番号用の数字キーボード -->
<input type="tel" name="phone" />

<!-- type="url": URL 用キーボード（/ や .com が打ちやすい）+ 形式チェック -->
<input type="url" name="website" />

<!-- type="date": カレンダー UI が表示される -->
<input type="date" name="birthday" />

<!-- type="number": 数値専用。増減ボタンが付く -->
<input type="number" name="quantity" min="1" max="99" />
```

| type | キーボード | バリデーション | 専用 UI |
|------|-----------|---------------|---------|
| `email` | @ キーが表示される | メールアドレス形式をチェック | - |
| `tel` | 数字キーボード | なし（電話番号の形式は国によって違うため） | - |
| `url` | / や .com が表示される | URL 形式をチェック | - |
| `date` | - | 日付形式をチェック | カレンダー |
| `number` | 数字キーボード | 数値かどうかをチェック | 増減ボタン |

`type="text"` のままでも JavaScript で同じことはできますが、HTML だけでこれだけの機能が手に入ります。

## ブラウザ組み込みバリデーション

JavaScript を1行も書かなくても、HTML の属性だけで入力チェックができます。

```html
<form action="/register" method="post">
  <!-- required: 必須入力 -->
  <label for="username">ユーザー名</label>
  <input type="text" id="username" name="username" required />

  <!-- minlength / maxlength: 文字数の範囲 -->
  <label for="password">パスワード（8文字以上）</label>
  <input
    type="password"
    id="password"
    name="password"
    required
    minlength="8"
  />

  <!-- min / max: 数値の範囲 -->
  <label for="age">年齢（18〜120）</label>
  <input type="number" id="age" name="age" min="18" max="120" />

  <!-- pattern: 正規表現で形式を指定 -->
  <label for="zipcode">郵便番号（例: 123-4567）</label>
  <input
    type="text"
    id="zipcode"
    name="zipcode"
    pattern="\d{3}-\d{4}"
    title="半角数字3桁-半角数字4桁の形式で入力してください"
  />

  <button type="submit">登録</button>
</form>
```

| 属性 | 効果 |
|------|------|
| `required` | 空のまま送信できない |
| `minlength` / `maxlength` | 文字数の最小・最大 |
| `min` / `max` | 数値の最小・最大 |
| `pattern` | 正規表現にマッチするかチェック。`title` 属性でエラー時のヒントを指定できる |

このフォームで空欄のまま送信ボタンを押すと、ブラウザが自動で「このフィールドを入力してください」のようなメッセージを表示してくれます。

> **注意**: ブラウザのバリデーションだけでは十分ではありません。ユーザーが DevTools で `required` を削除することもできます。サーバー側でのチェックは別途必要です。ただし HTML のバリデーションは「最初の防御線」として有効で、ユーザーに即座にフィードバックを返せます。

## fieldset と legend — 入力欄をグループ化する

関連する入力欄をまとめるのが `<fieldset>` と `<legend>` です。

```html
<form action="/order" method="post">
  <fieldset>
    <legend>お届け先</legend>
    <label for="address-name">お名前</label>
    <input type="text" id="address-name" name="address_name" required />
    <label for="address-zip">郵便番号</label>
    <input type="text" id="address-zip" name="address_zip" />
  </fieldset>

  <fieldset>
    <legend>お支払い方法</legend>
    <label>
      <input type="radio" name="payment" value="credit" />
      クレジットカード
    </label>
    <label>
      <input type="radio" name="payment" value="bank" />
      銀行振込
    </label>
  </fieldset>

  <button type="submit">注文を確定する</button>
</form>
```

スクリーンリーダーは `<fieldset>` に入ったとき `<legend>` の内容を読み上げます。「お届け先、お名前、テキスト入力」のように、グループ名と一緒に読まれるので、フォームの構造がわかりやすくなります。視覚的にも枠線で囲まれるので、関連する入力欄がひとまとまりだと一目でわかります。

## まとめ

- HTML だけでフォーム送信ができる。JavaScript は不要
- `<form>` の `action` と `method` で送信先と送信方法を指定する
- `name` 属性がない入力欄は送信データに含まれない
- `<button>` の `type` はデフォルトが `submit`。フォーム内で送信目的でない button には `type="button"` を付ける
- `<label>` の `for` と `<input>` の `id` を紐付けないと、操作性もアクセシビリティも壊れる
- `<input>` の `type` を正しく選ぶと、キーボード最適化・バリデーション・専用 UI が手に入る
- `required`、`min`/`max`、`pattern` で HTML の属性だけで入力チェックができる
- `<fieldset>` と `<legend>` で関連する入力欄をグループ化できる
