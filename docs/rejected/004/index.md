# フォーム — HTML だけで送信できる仕組み

## 今日のゴール

- HTML だけでフォーム送信ができることを知る
- form、name、button の type が送信の仕組みをどう支えているかを知る
- label や fieldset がフォームの操作性とアクセシビリティを支えていることを知る

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

JavaScript で同じことを書こうとすると、データの収集、サーバーへの送信、エラー処理などを自分で実装することになります。HTML はこれらをすべて、タグと属性だけで提供しています。

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
| `button` | フォーム送信は行わず、クリック時の処理を JavaScript で自由に書きたいときに使う |
| `reset` | フォームの入力値をリセットする |

`type="button"` は、たとえば「フィルターを開く」「モーダルを表示する」のように、送信ではない独自のクリック処理を JavaScript で実装したいときに使います。

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
- `<fieldset>` と `<legend>` で関連する入力欄をグループ化できる
