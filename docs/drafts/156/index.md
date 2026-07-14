# Open Redirect — リダイレクト先の検証をせずに送ると起こること

## 今日のゴール

- Open Redirect 脆弱性が何かと、攻撃者がそれを使う目的を知る
- URL パラメータでリダイレクト先を指定するとき、何が危険か理解する
- ホワイトリスト方式と相対 URL でリスクを減らす方法を知る

## ユーザーが許可した操作が危険になる理由

ログイン画面を例に考えてみます。

```typescript
// ログイン後に「どこに戻るか」をクエリパラメータで受け取る
// https://example.com/login?next=/dashboard
app.post('/login', (req, res) => {
  // ユーザーがパスワードを入力して認証
  const isValid = authenticate(req.body);
  
  if (isValid) {
    // パラメータで指定されたページへリダイレクト
    const nextUrl = req.query.next;
    res.redirect(nextUrl);  // ⚠️ 危険
  }
});
```

このコードは、一見すると正当です。「ログイン前のページに戻す」機能はユーザーにとって便利です。

ところが、攻撃者が次のような URL を作ると危険になります。

```
https://example.com/login?next=https://attacker.com/phishing
```

ユーザーが example.com でログインしたのに、成功後に詐欺サイト attacker.com へ飛ばされます。

ユーザーは「example.com は信頼できるサイトだから、このリダイレクト先も安全」と思い込み、attacker.com で再度パスワードを入力してしまいます。これが **Open Redirect** による **フィッシング** です。

## 攻撃者の手口

1. 攻撃者は信頼されたサイトの Open Redirect の URL を作る
2. メールや SNS で「アカウントが不正アクセスされました。ここをクリックして確認してください」と送信
3. ユーザーがクリックすると、信頼されたサイトを経由して詐欺サイトへ飛ばされる
4. ユーザーは「さっきのサイトから飛ばされたのだから安全」と思い込み、詐欺サイトで認証情報を入力

信頼できるサイトを仲介役にされるため、ユーザーの警戒心が下がります。

## サーバーサイドでの検証

サーバーでリダイレクト先を検証する責任があります。

### ❌ 危険な実装

```typescript
app.post('/login', (req, res) => {
  if (authenticate(req.body)) {
    // クエリパラメータをそのまま使う
    res.redirect(req.query.next);
  }
});
```

### ✓ ホワイトリスト方式

許可するリダイレクト先を事前に限定します。

```typescript
const ALLOWED_REDIRECTS = ['/dashboard', '/profile', '/settings'];

app.post('/login', (req, res) => {
  if (authenticate(req.body)) {
    const nextUrl = req.query.next || '/dashboard';
    
    // ホワイトリストに含まれているか確認
    if (ALLOWED_REDIRECTS.includes(nextUrl)) {
      res.redirect(nextUrl);
    } else {
      // ホワイトリストにない場合はデフォルト URL へ
      res.redirect('/dashboard');
    }
  }
});
```

### ✓ 相対 URL のみ許可

```typescript
app.post('/login', (req, res) => {
  if (authenticate(req.body)) {
    const nextUrl = req.query.next || '/dashboard';
    
    // 相対 URL か、同一オリジンのみ許可
    if (nextUrl.startsWith('/')) {
      res.redirect(nextUrl);
    } else {
      res.redirect('/dashboard');
    }
  }
});
```

相対 URL（`/dashboard` など）なら、自動的に同一オリジンへのリダイレクトになるので、外部サイトへの飛び先が防げます。

### ✓ URL クラスで同一オリジンを確認

より厳密には、JavaScript の `URL` クラスで検証します。

```typescript
app.post('/login', (req, res) => {
  if (authenticate(req.body)) {
    const nextUrl = req.query.next || '/dashboard';
    
    try {
      const url = new URL(nextUrl, req.headers.host);
      
      // リダイレクト先のオリジンが、現在のオリジンと同じか確認
      if (url.origin === `https://${req.headers.host}`) {
        res.redirect(nextUrl);
      } else {
        res.redirect('/dashboard');
      }
    } catch {
      // URL が不正な形式なら、デフォルト先へ
      res.redirect('/dashboard');
    }
  }
});
```

## クライアントサイドでも検証は必要か

`location.href` でリダイレクトするコードも同じです。

```typescript
// ❌ 危険
const next = new URLSearchParams(location.search).get('next');
location.href = next;

// ✓ ホワイトリスト方式
const ALLOWED_PATHS = ['/dashboard', '/profile'];
const next = new URLSearchParams(location.search).get('next');
if (ALLOWED_PATHS.includes(next)) {
  location.href = next;
}
```

しかし、クライアント側の検証だけでは不足です。攻撃者は JavaScript を読み、許可ルールを逆算して悪用します。

サーバーでの検証こそが唯一の信頼できる防御です。

## 他のリダイレクト場面

- OAuth/OIDC の `redirect_uri` — コールバック URL の指定
- 決済ページの成功後リダイレクト — ユーザーを戻す先
- パスワードリセットメール内のリンク — リセット画面への遷移

すべて同じ原則です。**リダイレクト先が外部入力に依存する場合は、サーバーで同一オリジンか ホワイトリストか確認する**。

## まとめ

- Open Redirect は、ユーザーを意図しない別のサイトへ飛ばす脆弱性
- クエリパラメータやフォーム入力でリダイレクト先を受け取るときは、サーバーで検証が必須
- ホワイトリスト方式か相対 URL のみ許可で、外部サイトへの飛び先を防ぐ
- サーバーサイドの検証が唯一の信頼できる防御
