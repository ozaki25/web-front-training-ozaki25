# Day 18: エラーハンドリングとデバッグ

## 今日のゴール

- JavaScript のエラーの種類と原因を知る
- `try/catch` でエラーを処理する方法を知る
- ブラウザの DevTools を使ったデバッグ手法を知る
- `console` メソッドの使い分けを知る

## エラーの種類

JavaScript のエラーにはいくつかの種類があります。エラーメッセージを読めるようになることが、デバッグの第一歩です。

### SyntaxError — 書き方の間違い

コードの文法が間違っているときに発生します。プログラムの実行前に検出されます。

```javascript
// ❌ 括弧の閉じ忘れ
console.log("hello"

// ❌ カンマの位置が不正
const obj = { name: "山田", age: };
```

### ReferenceError — 存在しない変数

定義されていない変数にアクセスしようとしたときに発生します。

```javascript
console.log(userName);  // ❌ ReferenceError: userName is not defined
```

よくある原因: 変数名のタイプミス、スコープ外からのアクセス、`import` の書き忘れ。

### TypeError — 型の不一致

値の型に対して不正な操作をしたときに発生します。

```javascript
const name = "山田";
name.push("太郎");   // ❌ TypeError: name.push is not a function
// push は配列のメソッド。文字列には使えない

const user = null;
user.name;           // ❌ TypeError: Cannot read properties of null
// null にプロパティアクセスはできない
```

`Cannot read properties of null (or undefined)` は実務で最も頻繁に遭遇するエラーです。「この変数は値を持っているはず」という前提が間違っているときに起こります。

## try / catch — エラーを捕まえる

`try/catch` を使うと、エラーが発生してもプログラムを止めずに処理を続行できます。

```javascript
try {
  // エラーが起きる可能性のある処理
  const data = JSON.parse("不正なJSON");
} catch (error) {
  // エラーが起きたときの処理
  console.error("JSONの解析に失敗しました:", error.message);
}

// try/catch の後の処理は実行される
console.log("プログラムは続行しています");
```

### error オブジェクト

`catch` で受け取る `error` オブジェクトには以下のプロパティがあります。

```javascript
try {
  undefined.property;
} catch (error) {
  console.log(error.name);     // "TypeError"
  console.log(error.message);  // "Cannot read properties of undefined"
  console.log(error.stack);    // エラーのスタックトレース（発生場所の詳細）
}
```

`error.stack` はエラーが発生した場所をファイル名と行番号で教えてくれます。デバッグの強力な手がかりです。

### finally — 必ず実行する処理

```javascript
async function fetchData() {
  try {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("データ取得に失敗:", error.message);
  } finally {
    // 成功でも失敗でも必ず実行される
    console.log("処理完了");
  }
}
```

`finally` は「ローディング表示を必ず消す」など、成否に関わらず行いたい後処理に使います。

## エラーを投げる

自分でエラーを投げることもできます。

```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error("0で割ることはできません");
  }
  return a / b;
}

try {
  const result = divide(10, 0);
} catch (error) {
  console.error(error.message);  // "0で割ることはできません"
}
```

`throw` は関数の中で「この入力は受け付けられない」という状況を表現するのに使います。

## 非同期処理のエラーハンドリング

Day 15 で学んだ `fetch` のような非同期処理でも `try/catch` が使えます。

```javascript
async function loadUserData(userId) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);

    if (!response.ok) {
      throw new Error(`ユーザーの取得に失敗しました（${response.status}）`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    if (error instanceof TypeError) {
      // ネットワークエラー（fetch 自体が失敗）
      console.error("ネットワーク接続を確認してください");
    } else {
      console.error(error.message);
    }
    return null;
  }
}
```

`instanceof` で Error の種類を判別して、エラーに応じた処理を分けています。

## DevTools — ブラウザのデバッグツール

ブラウザの DevTools はフロントエンド開発者の最重要ツールです。F12 キーまたは右クリック →「検証」で開きます。

### Console タブ

JavaScript のログやエラーが表示されます。直接 JavaScript を実行することもできます。

### Elements タブ

DOM の構造をリアルタイムで確認・編集できます。要素を右クリックして「検証」を選ぶと、その要素の位置に直接ジャンプします。Styles パネルでは適用されている CSS ルールと優先順位（取り消し線で上書きされたルールがわかる）を確認できます。

### Network タブ

Day 16 で触れた HTTP リクエストとレスポンスの詳細を確認できます。リクエストが時系列で一覧表示され、各リクエストのヘッダー、レスポンスボディ、タイミングが確認できます。ステータスコードでの絞り込みや、ページ遷移後もログを保持する「Preserve log」機能もあります。

### Sources タブ — ブレークポイント

コードの実行を途中で止めて、変数の値を確認できます。

Sources タブを開くと、左側にファイル一覧が表示されます。デバッグしたいファイルを選び、行番号をクリックすると**ブレークポイント**（停止点）が設定されます。ブレークポイントが設定された状態でページを更新すると、その行でコードの実行が一時停止します。

一時停止中は、右側のパネルでその時点の変数の値を確認できます。「Step Over」で次の行へ進む、「Step Into」で関数の中に入る、といった操作で 1 行ずつコードを追いかけられます。

`console.log` をたくさん入れるより、ブレークポイントの方が効率的にデバッグできる場面が多いです。

## console メソッドの使い分け

`console.log` 以外にも便利なメソッドがあります。

```javascript
// 基本的なログ
console.log("情報の表示");

// 警告（黄色い背景で表示される）
console.warn("注意: この機能は非推奨です");

// エラー（赤い背景で表示される）
console.error("エラーが発生しました");

// オブジェクトを表形式で表示
const users = [
  { name: "山田", age: 25 },
  { name: "佐藤", age: 30 },
];
console.table(users);

// グループ化
console.group("ユーザー情報");
console.log("名前: 山田");
console.log("年齢: 25");
console.groupEnd();

// 処理時間の計測
console.time("データ取得");
// ...なんらかの処理...
console.timeEnd("データ取得");  // "データ取得: 123.45ms"
```

### 実用的な使い方

```javascript
async function loadData() {
  console.group("データ読み込み");
  console.time("fetch");

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    console.log("ステータス:", response.status);

    const data = await response.json();
    console.log("取得件数:", data.length);
    console.table(data.map((u) => ({ name: u.name, email: u.email })));

    return data;
  } catch (error) {
    console.error("データ取得失敗:", error);
    return [];
  } finally {
    console.timeEnd("fetch");
    console.groupEnd();
  }
}

loadData();
```

## デバッグのコツ

1. **エラーメッセージを読む**: エラーの種類、メッセージ、発生場所（ファイル名と行番号）を確認する
2. **再現手順を特定する**: どの操作でエラーが起きるのかを明確にする
3. **原因を絞り込む**: `console.log` やブレークポイントで、どの時点で値がおかしくなっているかを特定する
4. **仮説を立てて検証する**: 「この変数が null なのではないか」→ 確認 → 対処、のサイクルを回す

> **本番コードに `console.log` を残さない**: デバッグ用の `console.log` は開発中だけ使い、本番環境にデプロイするコードには残さないのが基本です。ESLint などのツール（後の Day で学びます）を使うと、`console.log` の消し忘れを自動で検出できます。

## まとめ

- JavaScript のエラーには SyntaxError、ReferenceError、TypeError などの種類がある
- `Cannot read properties of null/undefined` は最も頻繁に遭遇するエラー
- `try/catch` でエラーを捕まえ、プログラムを止めずに適切に処理する
- `finally` は成否に関わらず必ず実行される。後処理に使う
- DevTools の Console、Elements、Network、Sources タブを使いこなすことがデバッグの基本
- ブレークポイントは `console.log` より効率的なデバッグ手法
- `console.table`、`console.group`、`console.time` など、目的に応じた console メソッドを使い分ける
