# Day 48: 認証の基礎

## 今日のゴール

- 認証と認可の違いを説明できる
- Cookie / Session / JWT の仕組みを理解する
- OAuth の概念を知る
- Next.js での認証フロー（Auth.js）の全体像を把握する

## 認証と認可

まず、よく混同される 2 つの概念を明確にしましょう。

- **認証（Authentication）** — 「あなたは誰ですか？」を確認すること。ログイン処理
- **認可（Authorization）** — 「あなたにはその操作の権限がありますか？」を確認すること。アクセス制御

```
例: 会社のオフィスビル
- 認証 = 社員証で入館ゲートを通る（本人確認）
- 認可 = 社員証のランクで入れるフロアが決まる（権限確認）
```

Web アプリケーションでは、まず認証（ログイン）でユーザーを識別し、次に認可でそのユーザーの権限に基づいてアクセスを制御します。

## HTTP はステートレス

Web の通信プロトコルである HTTP は**ステートレス**（stateless）です。つまり、サーバーは 1 つのリクエストが終わると、次のリクエストが同じユーザーかどうかわかりません。

```
リクエスト1: GET /dashboard → サーバー:「誰？」
リクエスト2: GET /settings  → サーバー:「誰？」（同じ人かわからない）
```

これでは、ページを移動するたびにログインが必要になってしまいます。この問題を解決するのが Cookie と Session です。

## Cookie

**Cookie** は、ブラウザに保存される小さなデータです。サーバーがレスポンスで「この情報を保存しておいて」とブラウザに指示し、ブラウザは次のリクエストからその情報を自動的に送ります。

```
1. ログインリクエスト
   ブラウザ → サーバー: 「メール: user@example.com、パスワード: ****」

2. サーバーがCookieを設定
   サーバー → ブラウザ: 「ログイン成功。このCookieを保存して」
   Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict

3. 以降のリクエスト
   ブラウザ → サーバー: 「GET /dashboard」（Cookie: session_id=abc123 が自動で付く）
   サーバー: 「abc123 は太郎さんだな」→ 太郎さんのダッシュボードを返す
```

### Cookie のセキュリティ属性

```
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

| 属性 | 意味 |
|------|------|
| `HttpOnly` | JavaScript からアクセスできない（XSS 対策） |
| `Secure` | HTTPS でのみ送信される |
| `SameSite=Strict` | 同一サイトからのリクエストでのみ送信される（CSRF 対策） |
| `Path=/` | Cookie が有効なパス |
| `Max-Age=86400` | 有効期限（秒）。86400 = 24 時間 |

## Session（セッション）

**Session** は、サーバー側でユーザーの状態を管理する仕組みです。

```
サーバーのセッションストア:
{
  "abc123": { userId: 1, name: "太郎", role: "admin" },
  "def456": { userId: 2, name: "花子", role: "user" }
}
```

ブラウザから送られる Cookie のセッション ID（`abc123`）をキーにして、サーバーがユーザー情報を参照します。ユーザー情報はサーバー側にあるため、ブラウザからは改ざんできません。

## JWT（JSON Web Token）

**JWT** はもう 1 つのアプローチで、ユーザー情報をトークン（署名された文字列）自体に含めます。

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiLlpKrpg44iLCJyb2xlIjoiYWRtaW4ifQ.xxxxx
```

この文字列は 3 つのパートから成り、ドット（`.`）で区切られています。

```
ヘッダー.ペイロード.署名

ヘッダー: 使用しているアルゴリズム
ペイロード: ユーザー情報（userId, name, role など）
署名: 改ざん検知用（サーバーの秘密鍵で生成）
```

> **重要**: JWT のペイロードは Base64Url エンコードされているだけで、誰でもデコードして内容を読めます。JWT は改ざんを検知するための「署名」であり、内容を隠すための「暗号化」ではありません。パスワードなどの機密情報は JWT に含めないでください。

### Session vs JWT

| 特徴 | Session | JWT |
|------|---------|-----|
| ユーザー情報の保存場所 | サーバー | トークン自体 |
| スケーラビリティ | サーバー間で共有が必要 | サーバー間共有不要 |
| 無効化 | 即座にログアウト可能 | 有効期限まで無効化が難しい |
| サイズ | Cookie は小さい（ID のみ） | トークンが大きくなりがち |

どちらが優れているかは状況次第です。Auth.js は Session ベースをデフォルトとしています。

## OAuth

**OAuth**（Open Authorization）は、外部サービス（Google、GitHub など）のアカウントでログインする仕組みです。「Google でログイン」ボタンが OAuth の典型的な例です。

### OAuth のフロー（簡略版）

```
1. ユーザーが「Google でログイン」をクリック
   ↓
2. Google のログインページにリダイレクト
   ↓
3. ユーザーが Google にログイン & アプリへの権限を許可
   ↓
4. Google がアプリにリダイレクト（認証コード付き）
   ↓
5. アプリが認証コードを使って Google からアクセストークンを取得
   ↓
6. アクセストークンでユーザー情報を取得
   ↓
7. ログイン完了（セッション作成）
```

OAuth の重要な点は、**ユーザーのパスワードがアプリに渡らない**ことです。パスワードは Google（認証プロバイダ）だけが知っています。

## Auth.js（NextAuth v5）による認証

**Auth.js**（旧 NextAuth.js、現在 v5）は、Next.js で認証を実装するためのライブラリです。OAuth プロバイダとの連携、Session 管理、JWT 処理などを簡単に行えます。

### セットアップ

```bash
npm install next-auth@beta
```

### 基本設定

```ts
// src/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
});
```

```
# .env.local
AUTH_SECRET=your-random-secret-key
AUTH_GITHUB_ID=your-github-oauth-app-id
AUTH_GITHUB_SECRET=your-github-oauth-app-secret
```

### Route Handler の設定

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

### ログイン/ログアウトボタン

```tsx
// src/components/auth-button.tsx
import { auth, signIn, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div>
        <p>{session.user.name} としてログイン中</p>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit">ログアウト</button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <button type="submit">GitHub でログイン</button>
    </form>
  );
}
```

### ページの保護

ログインしていないユーザーがアクセスできないページを作るには、`auth()` でセッションを確認します。

```tsx
// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{session.user?.name} さん</p>
    </main>
  );
}
```

Day 38 で学んだ `proxy.ts` を使えば、複数のページをまとめて保護することもできます。

## まとめ

- 認証は「誰か」を確認、認可は「権限があるか」を確認する仕組み
- Cookie と Session でステートレスな HTTP に状態を持たせる
- JWT はトークン自体にユーザー情報を含める方式
- OAuth は外部サービスのアカウントでログインする仕組み。パスワードがアプリに渡らない
- Auth.js（NextAuth v5）を使うと、Next.js で OAuth やセッション管理を簡単に実装できる

**次のレッスン**: [Day 49: Web セキュリティ](/lessons/day49/)
