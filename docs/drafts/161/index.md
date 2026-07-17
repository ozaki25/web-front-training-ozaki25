# FormData と multipart — 画像アップロードの中身

## 今日のゴール

- 文字だけの送信とファイルの送信で、リクエストの形が変わると知る
- multipart/form-data がファイルを運ぶ形式だと知る
- FormData を使うと形式が自動で組み立てられると知る

## 文字の送信とファイルの送信は違う

名前やメッセージのような文字だけのフォームは、`key=value&key=value` という短い文字列で送れます。この形式を `application/x-www-form-urlencoded` と呼びます。

でも画像や PDF のようなファイルは、この形式では送れません。中身がテキストではなく、区切り文字ともぶつかるからです。

## multipart/form-data — 荷物を仕切って詰める

ファイルを含む送信には **multipart/form-data** を使います。1 つのリクエストの中をいくつかの区画に仕切り、テキスト欄もファイルも一緒に詰めて送る形式です。

区画の境目には、中身と絶対にかぶらない **boundary** という区切り線を使います。

```
Content-Type: multipart/form-data; boundary=----abc123

------abc123
Content-Disposition: form-data; name="title"

猫の写真
------abc123
Content-Disposition: form-data; name="file"; filename="cat.png"
Content-Type: image/png

（画像のバイナリデータ）
------abc123--
```

区画ごとに「これは title という欄」「これは cat.png というファイル」と名札が付き、最後の `--abc123--` で終わりを示します。

## コードではどう書くか

ブラウザの `FormData` を使えば、この形式は自動で組み立てられます。

```js
const form = new FormData();
form.append("title", "猫の写真");
form.append("file", fileInput.files[0]);

await fetch("/upload", { method: "POST", body: form });
```

`Content-Type` を自分で指定しないのがコツです。FormData を渡すと、ブラウザが boundary 付きの正しいヘッダーを自動で付けます。

手で `Content-Type` を書くと boundary の指定がずれて、受け取り側で壊れます。

## まとめ

- 文字だけのフォームは urlencoded、ファイルを含むと multipart/form-data
- multipart はリクエストを区画に仕切り、boundary で境目を示す
- FormData を使えば形式は自動で組み立てられ、Content-Type は手で付けない
