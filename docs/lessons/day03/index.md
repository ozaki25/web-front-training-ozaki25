# Day 3: フォームとテーブル

## 今日のゴール

- フォーム要素（input、select、textarea）の使い方を知る
- `<label>` と入力欄の紐付けが重要な理由を知る
- テーブルの正しいマークアップ方法を知る
- フォームとテーブルにおけるアクセシビリティの考え方を知る

## フォーム — ユーザーからデータを受け取る

Web アプリケーションではログイン、検索、お問い合わせなど、ユーザーにデータを入力してもらう場面がたくさんあります。そのための仕組みがフォームです。

### フォームの基本構造

```html
<form action="/submit" method="post">
  <!-- 入力欄をここに書く -->
  <button type="submit">送信</button>
</form>
```

| 属性 | 役割 |
|------|------|
| `action` | データの送信先 URL |
| `method` | 送信方法。`get`（URL に付けて送信）または `post`（本文に含めて送信） |

> 今回はフォームの見た目と構造に集中します。実際にデータを送信する処理は、JavaScript や Next.js で学びます。

## input — さまざまな入力欄

`<input>` は `type` 属性によって全く異なる入力欄になります。

```html
<form action="/register" method="post">
  <div>
    <label for="username">ユーザー名</label>
    <input type="text" id="username" name="username" />
  </div>

  <div>
    <label for="email">メールアドレス</label>
    <input type="email" id="email" name="email" />
  </div>

  <div>
    <label for="password">パスワード</label>
    <input type="password" id="password" name="password" />
  </div>

  <div>
    <label for="age">年齢</label>
    <input type="number" id="age" name="age" min="0" max="150" />
  </div>

  <div>
    <label for="birthday">生年月日</label>
    <input type="date" id="birthday" name="birthday" />
  </div>

  <button type="submit">登録</button>
</form>
```

このコードをブラウザで開くと、`type` によって入力欄の見た目や動作が変わることがわかります。`email` はメールアドレスの形式チェックが自動で入り、`number` は数値しか入力できません。

### よく使う input の type

| type | 用途 |
|------|------|
| `text` | 一般的なテキスト入力 |
| `email` | メールアドレス（形式の自動バリデーション付き） |
| `password` | パスワード（入力文字が隠れる） |
| `number` | 数値 |
| `date` | 日付（カレンダーUI が出る） |
| `checkbox` | チェックボックス |
| `radio` | ラジオボタン（複数から 1 つ選択） |
| `search` | 検索（クリアボタンが付くことがある） |
| `tel` | 電話番号（スマホで数字キーボードが出る） |

適切な `type` を選ぶことで、ブラウザが自動的にバリデーション（入力チェック）を行ってくれたり、スマートフォンで最適なキーボードが表示されたりします。

## label — 入力欄に名前を付ける

`<label>` は入力欄の「ラベル（名前）」を表すタグです。

### label と input の紐付け方

**方法 1: `for` 属性と `id` を一致させる（推奨）**

```html
<label for="username">ユーザー名</label>
<input type="text" id="username" name="username" />
```

**方法 2: label で input を囲む**

```html
<label>
  ユーザー名
  <input type="text" name="username" />
</label>
```

### なぜ label の紐付けが重要なのか

1. **クリック範囲の拡大**: ラベルをクリックすると対応する入力欄にフォーカスが移ります。チェックボックスなど小さな要素で特に便利です
2. **アクセシビリティ**: スクリーンリーダーは入力欄にフォーカスしたとき、紐付けられた label のテキストを読み上げます。label がなければ「テキスト入力」としか読み上げられず、何を入力すればいいのかわかりません
3. **スマートフォンでの操作性**: タッチ領域が広くなり、押し間違いが減ります

**label なしの input は、名前のない入力欄です。** 見た目ではわかっていても、スクリーンリーダーには伝わりません。

## select と textarea

### ドロップダウン選択

```html
<label for="prefecture">都道府県</label>
<select id="prefecture" name="prefecture">
  <option value="">選択してください</option>
  <option value="tokyo">東京都</option>
  <option value="osaka">大阪府</option>
  <option value="fukuoka">福岡県</option>
</select>
```

最初の `<option>` に空の `value` を設定してプレースホルダーにするのが一般的です。

### 複数行テキスト

```html
<label for="message">お問い合わせ内容</label>
<textarea id="message" name="message" rows="5" cols="40"></textarea>
```

`<textarea>` は `<input>` と違い、閉じタグがあります。`rows` と `cols` で初期サイズを指定できます。

## チェックボックスとラジオボタン

```html
<fieldset>
  <legend>利用規約</legend>
  <label>
    <input type="checkbox" name="agree" value="yes" />
    利用規約に同意します
  </label>
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
  <label>
    <input type="radio" name="payment" value="convenience" />
    コンビニ払い
  </label>
</fieldset>
```

- **`<fieldset>`** は関連するフォーム要素をグループ化するタグです
- **`<legend>`** はそのグループのタイトルです
- ラジオボタンは同じ `name` 属性を持つもの同士で「どれか 1 つだけ選択」になります
- スクリーンリーダーは fieldset に入ったとき legend の内容を読み上げるので、「お支払い方法、クレジットカード」のように文脈がわかります

## テーブル — 表形式のデータ

テーブルは「行と列で構成される表形式のデータ」を表示するためのタグです。レイアウト（ページの配置）のために使ってはいけません。

```html
<table>
  <thead>
    <tr>
      <th>商品名</th>
      <th>価格</th>
      <th>在庫</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>りんご</td>
      <td>150円</td>
      <td>あり</td>
    </tr>
    <tr>
      <td>みかん</td>
      <td>100円</td>
      <td>あり</td>
    </tr>
    <tr>
      <td>ぶどう</td>
      <td>300円</td>
      <td>なし</td>
    </tr>
  </tbody>
</table>
```

| タグ | 役割 |
|------|------|
| `<table>` | テーブル全体 |
| `<thead>` | ヘッダー行のグループ |
| `<tbody>` | データ行のグループ |
| `<tr>` | 1 行（table row） |
| `<th>` | ヘッダーセル（table header）。自動的に太字・中央揃えになる |
| `<td>` | データセル（table data） |

### テーブルのアクセシビリティ

`<th>` と `<td>` の区別は重要です。スクリーンリーダーは `<th>` を「見出しセル」として認識し、データセルを読み上げるときに対応するヘッダーも一緒に読み上げます。たとえば「価格、150円」のように読み上げてくれます。

テーブルの内容がわかりやすいように `<caption>` を付けることもできます。

```html
<table>
  <caption>果物の価格一覧</caption>
  <thead>
    <!-- ... -->
  </thead>
  <tbody>
    <!-- ... -->
  </tbody>
</table>
```

## 完成形のコード

ここまでの要素を組み合わせると、以下のようなお問い合わせフォームのページになります。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>お問い合わせ</title>
  </head>
  <body>
    <header>
      <h1>お問い合わせ</h1>
      <nav>
        <ul>
          <li><a href="index.html">トップに戻る</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <form action="/contact" method="post">
        <div>
          <label for="name">お名前</label>
          <input type="text" id="name" name="name" required />
        </div>

        <div>
          <label for="email">メールアドレス</label>
          <input type="email" id="email" name="email" required />
        </div>

        <fieldset>
          <legend>お問い合わせ種別</legend>
          <label>
            <input type="radio" name="category" value="question" checked />
            質問
          </label>
          <label>
            <input type="radio" name="category" value="request" />
            要望
          </label>
          <label>
            <input type="radio" name="category" value="bug" />
            不具合報告
          </label>
        </fieldset>

        <div>
          <label for="message">お問い合わせ内容</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>

        <button type="submit">送信する</button>
      </form>
    </main>

    <footer>
      <p>© 2026 サンプルサイト</p>
    </footer>
  </body>
</html>
```

`required` 属性を付けた入力欄は、空のまま送信しようとするとブラウザが警告を出します。JavaScript を書かなくても基本的なバリデーションが効くのは、適切な HTML 属性を使うメリットです。

## まとめ

- `<form>` でフォーム全体を囲み、`<input>`、`<select>`、`<textarea>` で入力欄を作る
- `<input>` の `type` を適切に選ぶと、ブラウザが自動で入力補助やバリデーションを行う
- `<label>` と入力欄の紐付けはアクセシビリティの基本。必ずセットで使う
- `<fieldset>` と `<legend>` で関連する入力欄をグループ化する
- テーブルは表形式のデータ用。`<th>` と `<td>` を正しく使い分ける
- `required` や `type="email"` など、HTML の機能だけでも基本的なバリデーションができる

**次のレッスン**: [Day 4: CSS の基本と適用方法](/lessons/day04/)
