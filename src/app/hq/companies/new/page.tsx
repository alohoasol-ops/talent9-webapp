"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCompanyAction, type CreateCompanyState } from "./actions";

export default function NewCompanyPage() {
  const [state, formAction, pending] = useActionState<CreateCompanyState | null, FormData>(
    createCompanyAction,
    null
  );

  return (
    <div className="shell">
      <header className="top">
        <h1 className="font-display">会社アカウントを新規作成</h1>
        <p>会社名と管理者(その会社を運用する担当者)のメールアドレスを登録します。初回パスワードは自動発行され、この画面に一度だけ表示されます。</p>
      </header>

      <div className="panel" style={{ maxWidth: 480 }}>
        {state?.success ? (
          <div>
            <p className="status-box ok">
              「{state.success.companyName}」を作成しました。以下の情報を担当者に安全な方法で共有してください(このパスワードは再表示されません)。
            </p>
            <div className="field-group">
              <p className="field-group-title">ログインURL</p>
              <p className="mono">/login</p>
              <p className="field-group-title">メールアドレス(ID)</p>
              <p className="mono">{state.success.adminEmail}</p>
              <p className="field-group-title">初回パスワード</p>
              <p className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{state.success.adminPassword}</p>
            </div>
            <div className="btn-row">
              <Link className="btn primary" href="/hq">本部トップに戻る</Link>
              <Link className="btn" href="/hq/companies/new">続けてもう1社作成する</Link>
            </div>
          </div>
        ) : (
          <form action={formAction}>
            <div className="name-field">
              <label htmlFor="companyName">会社名</label>
              <input id="companyName" name="companyName" type="text" required placeholder="例：株式会社サンプル" />
            </div>
            <div className="name-field">
              <label htmlFor="adminName">担当者名(任意)</label>
              <input id="adminName" name="adminName" type="text" placeholder="例：人事部 田中" />
            </div>
            <div className="name-field">
              <label htmlFor="adminEmail">管理者メールアドレス(ログインID)</label>
              <input id="adminEmail" name="adminEmail" type="email" required placeholder="admin@example.com" />
            </div>
            {state?.error && <p className="field-error">{state.error}</p>}
            <div className="btn-row">
              <button type="submit" className="primary" disabled={pending}>
                {pending ? "作成中…" : "会社アカウントを作成"}
              </button>
              <Link className="btn" href="/hq">キャンセル</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
