"use client";

import { useState, useTransition } from "react";
import { generateApproachTextAction } from "../actions";
import type { ApproachTexts } from "@/lib/salesAi/types";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="name-field">
      <p className="field-group-title" style={{ marginBottom: 6 }}>
        {label}
        <button
          type="button"
          style={{ marginLeft: 8, padding: "2px 8px", fontSize: 11.5 }}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // クリップボード権限がない環境では無視する
            }
          }}
        >
          {copied ? "コピーしました" : "コピー"}
        </button>
      </p>
      <textarea readOnly value={value} rows={label === "メール件名" ? 1 : 5} onFocus={(e) => e.target.select()} />
    </div>
  );
}

export default function ApproachPanel({ leadId, approach }: { leadId: string; approach: ApproachTexts | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="panel">
      <h2>AIアプローチ文</h2>
      <p className="panel-sub">メール・問い合わせフォーム・電話・初回商談トークの文章案をAIが作成します。内容を確認のうえご利用ください。</p>

      <div className="btn-row" style={{ marginTop: 0, marginBottom: 16 }}>
        <button
          type="button"
          className="accent"
          disabled={pending}
          onClick={() => startTransition(() => generateApproachTextAction(leadId))}
        >
          {pending ? "生成中…" : approach ? "アプローチ文を作り直す" : "アプローチ文を生成"}
        </button>
      </div>

      {approach ? (
        <>
          <CopyField label="メール件名" value={approach.emailSubject} />
          <CopyField label="メール本文" value={approach.emailBody} />
          <CopyField label="問い合わせフォーム用文章" value={approach.formMessage} />
          <CopyField label="電話トーク" value={approach.phoneScript} />
          <CopyField label="初回商談トーク" value={approach.firstMeetingScript} />
        </>
      ) : (
        <div className="empty-state">まだアプローチ文がありません。「アプローチ文を生成」を押してください。</div>
      )}
    </div>
  );
}
