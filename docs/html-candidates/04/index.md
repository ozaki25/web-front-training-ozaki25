# Day 4: フォーム — HTML だけでここまでできる

## 今日のゴール

- `<input>` の `type` を変えるだけでブラウザの振る舞いが大きく変わることを知る
- `<label>` の紐付けがないとアクセシビリティも操作性も壊れることを知る
- HTML の属性だけでバリデーションやグループ化ができることを知る

## なぜフォームをもう一歩深く知るのか

Day 3 ではフォームの基本構造を学びました。今日はその続きとして、「正しい HTML を選ぶだけで、ブラウザが自動でやってくれること」に焦点を当てます。

後半で学ぶ React 19 には **form actions** という機能があります。フォームの送信をサーバーで処理する仕組みです。この機能は `<form>` タグの `action` 属性と `name` 属性を土台にしています。つまり、HTML のフォームの仕組みを知っていることが、React や Next.js を理解する前提条件になります。

## form タグの action と method

`<form>` タグには「どこに」「どうやって」データを送るかを指定します。

```html
<form action="/api/contact" method="post">
  <label for="message">メッセージ</label>
  <textarea id="message" name="message"></textarea>
  <button type="submit">送信</button>
</form>
```

| 属性 | 役割 |
|------|------|
| `action` | データの送信先 URL。省略すると現在のページに送信される |
| `method` | `get` は URL のクエリパラメータとして送信（検索フォーム向き）。`post` はリクエスト本文に含めて送信（データの変更向き） |

`get` と `post` の使い分けを具体的に見てみましょう。

```html
<!-- 検索フォーム: get を使う -->
<!-- 送信すると /search?q=入力内容 という URL になる -->
<form action="/search" method="get">
  <label for="q">検索</label>
  <input type="search" id="q" name="q" />
  <button type="submit">検索する</button>
</form>

<!-- お問い合わせフォーム: post を使う -->
<!-- データは URL に出ない（本文に含まれる） -->
<form action="/api/contact" method="post">
  <label for="email">メールアドレス</label>
  <input type="email" id="email" name="email" />
  <button type="submit">送信する</button>
</form>
```

`get` で送信すると URL に `?q=検索ワード` のようにデータが付くので、ブックマークや共有ができます。一方、パスワードや個人情報は URL に表示されるべきではないので `post` を使います。

> **React 19 との接点**: React 19 の form actions では、`<form>` の `action` 属性にサーバー関数を渡します。HTML のフォーム送信の仕組みがそのまま使われているので、ここでの知識がそのまま活きます。

## input の type — ブラウザの振る舞いを変えるスイッチ

Day 3 で `type` による違いを紹介しましたが、ここではもう少し掘り下げます。`type` を正しく選ぶだけで、ブラウザが**自動で**以下をやってくれます。

1. **スマートフォンのキーボードを最適化** する
2. **入力値のバリデーション（チェック）** を行う
3. **専用の入力 UI** を表示する

```html
<form action="/register" method="post">
  <!-- type="email": メールアドレス用キーボード（@ が打ちやすい） -->
  <div>
    <label for="email">メールアドレス</label>
    <input type="email" id="email" name="email" />
  </div>

  <!-- type="tel": 電話番号用の数字キーボード -->
  <div>
    <label for="phone">電話番号</label>
    <input type="tel" id="phone" name="phone" />
  </div>

  <!-- type="url": URL 用キーボード（/ や .com が打ちやすい） -->
  <div>
    <label for="website">Webサイト</label>
    <input type="url" id="website" name="website" />
  </div>

  <!-- type="date": カレンダー UI が表示される -->
  <div>
    <label for="birthday">生年月日</label>
    <input type="date" id="birthday" name="birthday" />
  </div>

  <!-- type="number": 数値専用。増減ボタンが付く -->
  <div>
    <label for="quantity">数量</label>
    <input type="number" id="quantity" name="quantity" min="1" max="99" />
  </div>

  <button type="submit">登録</button>
</form>
```

| type | キーボード | バリデーション | 専用 UI |
|------|-----------|---------------|---------|
| `email` | @ キーが表示される | メールアドレス形式をチェック | - |
| `tel` | 数字キーボード | なし（電話番号の形式は国によって違うため） | - |
| `url` | / や .com が表示される | URL 形式をチェック | - |
| `date` | - | 日付形式をチェック | カレンダー |
| `number` | 数字キーボード | 数値かどうかをチェック | 増減ボタン |

**ポイント**: `type="text"` のままでも JavaScript で同じことはできますが、HTML だけでこれだけの機能が手に入ります。JavaScript を書く量が減る上に、ブラウザがネイティブに提供する UI はユーザーにとっても馴染みがあります。

## label の紐付け — ないと何が壊れるか

Day 3 で `<label>` の紐付けを学びましたが、紐付けが**ない**とどうなるかを具体的に見てみましょう。

### 紐付けがない場合

```html
<!-- ❌ label と input が紐付いていない -->
<label>メールアドレス</label>
<input type="email" id="email" name="email" />
```

この場合、以下が壊れます。

1. **クリック範囲**: 「メールアドレス」というテキストをクリックしても入力欄にフォーカスが移らない。特にチェックボックスやラジオボタンでは、小さなボックス部分をピンポイントでクリックしなければならなくなる
2. **スクリーンリーダー**: 入力欄にフォーカスしたとき「テキスト入力」としか読み上げられない。何を入力すればいいのかわからない

### 正しい紐付け

```html
<!-- ✅ for と id で紐付ける -->
<label for="email">メールアドレス</label>
<input type="email" id="email" name="email" />
```

`<label>` の `for` 属性と `<input>` の `id` 属性を同じ値にします。これだけで、ラベルをクリックしたときに入力欄にフォーカスが移り、スクリーンリーダーも「メールアドレス、テキスト入力」と読み上げてくれます。

## ブラウザ組み込みバリデーション

JavaScript を1行も書かなくても、HTML の属性だけで入力チェックができます。

```html
<form action="/register" method="post">
  <!-- required: 必須入力 -->
  <div>
    <label for="username">ユーザー名（必須）</label>
    <input type="text" id="username" name="username" required />
  </div>

  <!-- minlength / maxlength: 文字数の範囲 -->
  <div>
    <label for="password">パスワード（8文字以上）</label>
    <input
      type="password"
      id="password"
      name="password"
      required
      minlength="8"
    />
  </div>

  <!-- min / max: 数値の範囲 -->
  <div>
    <label for="age">年齢（18〜120）</label>
    <input type="number" id="age" name="age" min="18" max="120" />
  </div>

  <!-- pattern: 正規表現で形式を指定 -->
  <div>
    <label for="zipcode">郵便番号（例: 123-4567）</label>
    <input
      type="text"
      id="zipcode"
      name="zipcode"
      pattern="\d{3}-\d{4}"
      title="半角数字3桁-半角数字4桁の形式で入力してください"
    />
  </div>

  <button type="submit">登録</button>
</form>
```

| 属性 | 効果 |
|------|------|
| `required` | 空のまま送信できない |
| `minlength` / `maxlength` | 文字数の最小・最大 |
| `min` / `max` | 数値の最小・最大 |
| `pattern` | 正規表現（特定の形式にマッチするかチェック）。`title` 属性でエラー時のヒントメッセージを指定できる |

このフォームで空欄のまま送信ボタンを押すと、ブラウザが自動で「このフィールドを入力してください」のようなメッセージを表示します。`pattern` に合わない入力をした場合は `title` の内容がヒントとして表示されます。

> **注意**: ブラウザのバリデーションだけでは十分ではありません。ユーザーが DevTools（開発者ツール）で `required` を削除することもできます。サーバー側でのチェックは別途必要です。ただし、HTML のバリデーションは「最初の防御線」として有効で、ユーザーに即座にフィードバックを返せる利点があります。

## fieldset と legend — 入力欄をグループ化する

関連する入力欄をまとめるのが `<fieldset>` と `<legend>` です。

```html
<form action="/order" method="post">
  <fieldset>
    <legend>お届け先</legend>
    <div>
      <label for="address-name">お名前</label>
      <input type="text" id="address-name" name="address_name" required />
    </div>
    <div>
      <label for="address-zip">郵便番号</label>
      <input
        type="text"
        id="address-zip"
        name="address_zip"
        pattern="\d{3}-\d{4}"
        title="半角数字3桁-半角数字4桁の形式で入力してください"
      />
    </div>
    <div>
      <label for="address-detail">住所</label>
      <input type="text" id="address-detail" name="address_detail" required />
    </div>
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

スクリーンリーダーは `<fieldset>` に入ったとき `<legend>` の内容を読み上げます。たとえば「お届け先」グループの中の「お名前」入力欄にフォーカスすると、「お届け先、お名前、テキスト入力」のように読み上げられます。視覚的にも枠線で囲まれるので、フォームの構造がわかりやすくなります。

## name 属性 — データ送信の鍵

`name` 属性は、フォームデータを送信するときの **キー名** になります。

```html
<form action="/api/contact" method="post">
  <label for="email">メールアドレス</label>
  <input type="email" id="email" name="email" value="user@example.com" />

  <label for="msg">メッセージ</label>
  <textarea id="msg" name="message">こんにちは</textarea>

  <button type="submit">送信</button>
</form>
```

このフォームを送信すると、ブラウザは以下のようなデータを送ります。

```
email=user%40example.com&message=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF
```

`name` 属性がない入力欄は、**送信データに含まれません**。見た目には入力できるのにデータが送られないので、気づきにくいバグの原因になります。

```html
<!-- ❌ name がない → データが送信されない -->
<input type="email" id="email" />

<!-- ✅ name がある → email=... として送信される -->
<input type="email" id="email" name="email" />
```

> **React 19 / Server Actions との接点**: React 19 の Server Actions では、フォームの送信データを `FormData` オブジェクトとして受け取ります。`FormData` は `name` 属性をキーにしてデータを取り出します。`name` がなければデータを取得できません。
>
> ```javascript
> // React 19 の Server Action（参考）
> async function submitForm(formData) {
>   const email = formData.get("email"); // name="email" の値を取得
>   const message = formData.get("message"); // name="message" の値を取得
> }
> ```
>
> 今はこのコードを理解する必要はありません。「`name` 属性は JavaScript からデータを取り出すときにも使われる」ということだけ覚えておいてください。

## まとめ

- `<form>` の `action` と `method` はデータの送信先と送信方法を決める。React 19 の form actions もこの仕組みの上に成り立っている
- `<input>` の `type` を正しく選ぶだけで、キーボード最適化・バリデーション・専用 UI がブラウザから無料で手に入る
- `<label>` の `for` と `<input>` の `id` を紐付けないと、クリック範囲もスクリーンリーダーも壊れる
- `required`、`min`/`max`、`pattern` など、HTML の属性だけで基本的な入力チェックができる
- `<fieldset>` と `<legend>` で関連する入力欄をグループ化すると、視覚的にもアクセシビリティ的にもわかりやすくなる
- `name` 属性がない入力欄はデータ送信に含まれない。`FormData` で取得するときのキーにもなる
