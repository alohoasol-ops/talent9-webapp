"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="font-display">9タレントマップ</h1>
        <p className="sub">会社アカウントまたは本部アカウントでログインしてください</p>
        <form action={formAction}>
          <div className="name-field">
            <label htmlFor="email">ログインID</label>
            <input id="email" name="email" type="text" autoComplete="username" required />
          </div>
          <div className="name-field">
            <label htmlFor="password">パスワード</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state?.error && <p className="field-error">{state.error}</p>}
          <div className="btn-row">
            <button type="submit" className="primary" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
              {pending ? "ログイン中…" : "ログイン"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
