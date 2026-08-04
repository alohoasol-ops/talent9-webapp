"use client";

import { useState } from "react";
import { resetCompanyPasswordAction } from "@/app/hq/actions";

export default function ResetPasswordButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const [result, setResult] = useState<{ loginId: string; password: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        `「${companyName}」のログインパスワードを再発行します。現在のパスワードは使えなくなります。よろしいですか？`
      )
    )
      return;
    setPending(true);
    const res = await resetCompanyPasswordAction(companyId);
    setPending(false);
    if ("error" in res) {
      alert(res.error);
    } else {
      setResult(res);
    }
  }

  if (result) {
    return (
      <div className="status-box ok" style={{ marginTop: 10 }}>
        新しいパスワードを発行しました(この場に一度だけ表示されます。安全な方法で会社担当者に伝えてください)。
        <div className="field-group-title" style={{ marginTop: 8 }}>ログインID</div>
        <p className="mono">{result.loginId}</p>
        <div className="field-group-title">新しいパスワード</div>
        <p className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{result.password}</p>
      </div>
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending}>
      {pending ? "発行中…" : "パスワード再発行"}
    </button>
  );
}
