# Branded Types — 見た目は同じだが意味が異なる型を区別する

## 今日のゴール

- 構造的型付けで「同じ型」と判定される問題を知る
- `unique symbol` を使って、見た目は同じだが意味が異なる型を区別する方法を知る
- バリデーション済みのデータと未検証のデータを型レベルで分ける

## 同じ型に見えるのに意味が違う問題

TypeScript の構造的型付けでは、フィールドが同じなら同じ型と見なされます。

```typescript
type UserId = string;
type Email = string;

const userId: UserId = "user-123";
const email: Email = userId;  // ✓ 型エラーなし

// 実はこれは問題です
function sendEmail(email: Email) {
  console.log(`メール送信: ${email}`);
}

sendEmail(userId);  // user-123 が Email として渡ってしまう
```

`UserId` も `Email` も見た目は `string` なので、TypeScript は「同じ型」と判定します。しかし意味的には全く異なります。

ユーザー ID とメールアドレスを混ぜるべきではありません。

これは Day 70（構造的型付け）で学んだ課題です。型エイリアス（`type Email = string`）では、実行時に区別されず、型チェッカーも同じと見なします。

## unique symbol でマーキングする

**Branded Types** は、型に「ブランド」と呼ばれる目印を付けて、同じ構造でも区別する技法です。`unique symbol` を使います。

```typescript
// 「Email」というブランドを持つ文字列型
type Email = string & { readonly __brand: unique symbol };

const createEmail = (value: string): Email => {
  // この関数の中では、値がメールアドレスであることを確認したと仮定
  // 実際にはここでバリデーションを行う
  return value as Email;
};

const email: Email = createEmail("user@example.com");

// 型チェッカーは、Email と UserId を区別
function sendEmail(email: Email) {
  console.log(`メール送信: ${email}`);
}

sendEmail(email);      // ✓ OK
sendEmail("user-123"); // ✗ エラー: string は Email ではない
```

ポイントは `{ readonly __brand: unique symbol }` の部分です。これは実行時には存在しない型だけの目印です。

- `unique symbol` は、**その型の定義に一度だけ現れる特別なシンボル**。他のどの `unique symbol` とも同じにならない。
- `__brand` という名前は慣例。実際には `__email`, `__userId` など、ブランドの種類を名前で示すことが多い。

## パターン：Helper 関数でバリデーション

実務では、型を強制するだけでなく、バリデーション関数を一緒に提供します。

```typescript
type UserId = string & { readonly __brand: unique symbol };
type Email = string & { readonly __brand: unique symbol };

// バリデーション関数
const createUserId = (value: string): UserId | null => {
  if (value.length === 0 || value.length > 100) {
    return null;  // バリデーション失敗
  }
  return value as UserId;
};

const createEmail = (value: string): Email | null => {
  if (!value.includes("@")) {
    return null;
  }
  return value as Email;
};

// 使い方
const userId = createUserId("user-123");
const email = createEmail("user@example.com");

if (userId && email) {
  sendEmailToUser(email, userId);  // ✓ 型が安全
}
```

重要なのは、`as UserId` / `as Email` でキャストする前に、バリデーションロジックが済んでいることです。この関数を経由してのみ型を作ることで、「UserId なら確実にバリデーション済み」という保証になります。

## より実用的なヘルパー関数の書き方

毎回 `type X = string & { readonly __brand: unique symbol }` と書くのは冗長です。ジェネリクスを使って簡潔にできます。

```typescript
// ブランド型を作る汎用ヘルパー
type Brand<T, B> = T & { readonly __brand: B };

// 具体的な型を定義
type UserId = Brand<string, "UserId">;
type Email = Brand<string, "Email">;
type Url = Brand<string, "Url">;

// バリデーション関数
const createUserId = (value: string): UserId | null => {
  if (value.length === 0 || value.length > 100) {
    return null;
  }
  return value as UserId;
};

const createEmail = (value: string): Email | null => {
  if (!value.includes("@") || !value.includes(".")) {
    return null;
  }
  return value as Email;
};

const createUrl = (value: string): Url | null => {
  try {
    new URL(value);  // URL として解析できるか試す
    return value as Url;
  } catch {
    return null;
  }
};
```

こうすれば、新しいブランド型を追加するたびに同じ定義を繰り返す必要がありません。

## 何を区別すべきか

すべてのデータに Branded Types が必要なわけではありません。どんなときに使うか。

| 場面 | 必要性 | 理由 |
|-----|-------|------|
| **認証済みユーザーID** | 高 | ID の取違え・未検証データの混在は重大なバグ |
| **バリデーション済みメールアドレス** | 高 | 無効なメール送信は実害が大きい |
| **データベースから取得した値** | 中 | 既に存在が保証されているが、リスク低減 |
| **フォーム入力値** | 低 | 単一の関数スコープ内なら、単純な型チェックで足りることが多い |
| **単純な数値や真偽値** | 低 | 混同のリスクが低い |

重要なのは「**バリデーションと型を一致させること**」です。型があるなら、その型を手に入れるための確実な経路（バリデーション関数）が存在すべき。

逆に、単なる型エイリアスなら、実装で注意するだけで足りることが多い。

## まとめ

- 構造的型付けでは、同じフィールドを持つ型は区別されない
- Branded Types は `unique symbol` でマーキングして、見た目は同じだが意味が異なる型を区別
- バリデーション関数を経由してのみ型を作ることで、型が「確認済み」の保証になる
- すべてのデータに必要なわけではなく、混同のリスクが高い場面に限定
