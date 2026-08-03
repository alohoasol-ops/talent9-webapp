# 9才能 人的資本ポートフォリオ(Webアプリ版)

会社ごとにID/パスワードでログインし、本部アカウントは全社を横断して閲覧できる、9才能分析の人的資本管理ツールです。

- **会社アカウント**：自社のメンバーを池川ブレインアセスメントの結果PDFから登録し、チームの才能ポートフォリオ・適材適所シミュレーターを利用できます(自社データのみ閲覧・編集可)
- **本部アカウント**：全社の会社一覧・全社横断ポートフォリオ・各社の詳細(閲覧専用)を確認できます。会社アカウントの新規発行もここから行います

技術構成：Next.js(フロントエンド) + Supabase(認証・データベース) + Vercel(ホスティング)。いずれも無料枠から始められます。

---

## 1. Supabaseプロジェクトを作成する

1. https://supabase.com にアクセスし、アカウントを作成(またはログイン)
2. 「New project」から新規プロジェクトを作成(リージョンは Tokyo (ap-northeast-1) がおすすめ)
3. プロジェクト作成後、左メニューの **SQL Editor** を開き、このリポジトリの `supabase/schema.sql` の中身を全て貼り付けて実行(Run)する
   - `companies` / `profiles` / `team_members` の3テーブルと、必要な権限(Row Level Security)が作成されます
4. 左メニューの **Project Settings > API** を開き、以下の3つを控えておく
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`(**絶対に公開しないこと**。会社アカウント発行など管理者操作にのみサーバー側で使用します)

## 2. 最初の本部管理者アカウントを作成する

1. Supabaseダッシュボードの **Authentication > Users** を開き、「Add user」から本部管理者用のメールアドレス・パスワードでユーザーを作成する
   - 「Auto Confirm User」を有効にしてください(メール確認をスキップできます)
2. 作成したユーザーの UUID をコピーする(ユーザー一覧のIDカラム)
3. 再度 **SQL Editor** で以下を実行し、そのユーザーを本部管理者(`hq_admin`)として登録する

   ```sql
   insert into public.profiles (id, role, display_name)
   values ('コピーしたUUID', 'hq_admin', '本部管理者');
   ```

## 3. ローカルで動かして確認する(任意)

```bash
npm install
cp .env.local.example .env.local
# .env.local を開いて手順1で控えた3つの値を貼り付ける
npm run dev
```

http://localhost:3000 にアクセスし、手順2で作成したメールアドレス・パスワードでログインできれば成功です。

## 4. Vercelにデプロイする

1. このプロジェクトを GitHub リポジトリにpushする
2. https://vercel.com でアカウントを作成し、「Add New Project」からそのリポジトリをインポートする
3. 「Environment Variables」に以下の3つを設定する(Production / Preview / Development すべてに設定)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 「Deploy」を実行する。完了すると `https://xxxxx.vercel.app` のようなURLが発行されます

これで本番URLが1つ発行されます。**会社ごとに別々のURLを用意する必要はありません** — 同じURLに、それぞれの会社の担当者が自分のID/パスワードでログインする形になります(ログイン後は自社のデータしか見えません)。社名を強く印象づけたい場合は、Vercelでカスタムドメイン(例：`portfolio.jinji-honbu.jp`)を設定することもできます。

## 5. 会社アカウントを発行する

1. 本部管理者としてログインし、`/hq` の「＋ 会社アカウントを新規作成」から会社名・担当者メールアドレスを入力する
2. 作成すると、その場に一度だけ **初回パスワード** が表示されます。ログインURL・メールアドレス・初回パスワードを、安全な方法(社内チャットの個別メッセージなど)でその会社の担当者に共有してください
3. 会社担当者はそのID/パスワードで `/login` からログインすると、自社の `/dashboard` に入り、PDF取り込み・メンバー管理・ポートフォリオ閲覧ができます

## 使い方の流れ(会社アカウント)

1. `/dashboard` の「メンバーを追加」で、池川ブレインアセスメント(一般成人用)の結果PDFをドラッグ&ドロップ
2. 自動で数値が読み取られるので、内容を確認して「＋ チームに追加」
3. 「チームメンバー一覧」「チーム才能ポートフォリオ」「適材適所シミュレーター」で分析
4. 「人的資本ポートフォリオ サマリー出力」から社内検討資料としてPDF印刷可能

## セキュリティ・データについて

- 認証・パスワード管理は Supabase Auth が行い、パスワードは平文で保存されません
- 各社のデータには Row Level Security(行レベルセキュリティ)がかかっており、会社アカウントは自社のデータしか読み書きできません。本部アカウントは全社を閲覧できますが、書き込みはできません(各社の運用データを本部が変更しない設計)
- PDFの解析はブラウザ内(クライアントサイド)で行われ、PDFファイル自体はサーバーに送信されません。読み取った数値のみがデータベースに保存されます
- `SUPABASE_SERVICE_ROLE_KEY` は Row Level Security を無視できる強い権限を持つため、サーバー側(Vercelの環境変数)にのみ設定し、コードやブラウザに一切露出させないでください
- 本ツールは独自ロジックによる才能分析の参考ツールであり、法定の人的資本開示書類そのものではありません。医学的診断・心理検査・採用選考の合否を保証するものでもありません

## 主要ファイル

```
supabase/schema.sql            DBスキーマ・RLSポリシー(Supabase SQL Editorで実行)
src/lib/talents.ts             9才能の定義・換算ロジック・適材適所ロジック(共通)
src/lib/pdfExtract.ts          PDFから測定値を読み取る処理(ブラウザ内で実行)
src/lib/auth.ts                ログイン中ユーザーのロール判定
src/proxy.ts                   認証セッション管理・未ログイン時のリダイレクト
src/app/login/                 ログイン画面
src/app/dashboard/             会社アカウント用ダッシュボード
src/app/hq/                    本部アカウント用ダッシュボード・会社アカウント発行
src/components/                UIコンポーネント(レーダーチャート・一覧・ヒートマップ等)
```
