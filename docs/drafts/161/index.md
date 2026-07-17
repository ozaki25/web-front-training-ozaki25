# FormData と multipart — 画像アップロードの中身

## 今日のゴール

- 文字だけの送信とファイルの送信でリクエストの形が変わると知る
- multipart は中身を符号化せず区画に分けて運ぶと知る
- FormData に任せると boundary 付きの形式が自動で組み立つと知る

## 文字の送信とファイルの送信の違い

名前やメッセージのような文字だけのフォームは、`key=value&key=value` という短い文字列にまとめて送れます。この形式を `application/x-www-form-urlencoded` と呼びます。

この形式は `&` や `=` を区切りに使うので、値の中に同じ記号が現れると、そのままでは区切りと区別できません。だから区切りとぶつかる文字や記号は、`%26` のような符号に置き換えます。

この置き換えをパーセントエンコーディングと呼びます。

文字なら置き換えはたまにしか起きませんが、画像や PDF のバイナリはほとんどのバイトが対象になります。1 バイトが `%XX` の 3 文字に膨らむので、1 MB の画像が約 3 MB になり、無駄が大きすぎます。

## multipart の仕組み — boundary で区画を仕切る

ファイルを含む送信には **multipart/form-data** を使います。1 つのリクエストの中をいくつかの区画に仕切り、テキスト欄もファイルも符号化せずそのまま詰める形式です。

区画の境目には **boundary** という区切り線を置きます。中身と絶対にかぶらないランダムな文字列を選び、それを最初にヘッダーで宣言しておきます。

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

受け取ったサーバーは、まずヘッダーの boundary の値を読み取ります。あとはその区切り線が現れるたびに次の区画が始まると判断するので、中身がテキストでもバイナリでも境目を見失いません。

各区画には `Content-Disposition` という名札が付き、どのフォーム欄か、ファイルなら元のファイル名までわかります。最後の `------abc123--` で全体の終わりを示します。

もし中身にたまたま boundary と同じ並びが混じると境目を誤認しますが、ブラウザは推測されにくい長いランダム文字列を選ぶので、実際にはまず衝突しません。

## FormData による自動組み立て

ブラウザの `FormData` を使えば、この区画分けは自動で組み立てられます。

```js
const form = new FormData();
form.append("title", "猫の写真");
form.append("file", fileInput.files[0]);

await fetch("/upload", { method: "POST", body: form });
```

`Content-Type` を自分で指定しないのがコツです。FormData を渡すと、ブラウザが boundary 付きの正しいヘッダーを自動で付けます。

手で `Content-Type` を書くと boundary の指定が抜けて、受け取り側が区画を読み分けられなくなります。

大きなファイルでも、ブラウザはディスクから少しずつ読みながら送るので、そのまま渡して問題ありません。ただし「何 % 送れたか」という進捗の表示は fetch だけでは扱いにくく、`XMLHttpRequest` の進捗イベントを使うのが定番です。

## まとめ

- 文字だけは urlencoded、ファイルを含むと multipart/form-data
- urlencoded はバイナリを符号化で約 3 倍に膨らませてしまう
- multipart は boundary で区画を仕切り、中身をそのまま運ぶ
- FormData に任せると boundary 付きヘッダーが自動で付く
