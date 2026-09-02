"use client";

import { useActionState, useTransition } from "react";
import { updateLeadDetailsAction, rescoreLeadAction, type UpdateLeadState } from "../actions";
import type { Lead } from "@/lib/salesAi/types";

export default function LeadDetailForm({ lead }: { lead: Lead }) {
  const [state, formAction, pending] = useActionState<UpdateLeadState | null, FormData>(updateLeadDetailsAction, null);
  const [rescoring, startRescore] = useTransition();

  return (
    <form action={formAction}>
      <input type="hidden" name="leadId" value={lead.id} />

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="contactName">担当者</label>
          <input id="contactName" name="contactName" type="text" defaultValue={lead.contactName} />
        </div>
        <div className="name-field">
          <label htmlFor="contactTitle">役職</label>
          <input id="contactTitle" name="contactTitle" type="text" defaultValue={lead.contactTitle} />
        </div>
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="email">メール</label>
          <input id="email" name="email" type="email" defaultValue={lead.email} />
        </div>
        <div className="name-field">
          <label htmlFor="phone">電話</label>
          <input id="phone" name="phone" type="text" defaultValue={lead.phone} />
        </div>
      </div>

      <div className="name-field">
        <label htmlFor="nextAction">次回アクション</label>
        <input id="nextAction" name="nextAction" type="text" placeholder="例：来週メールでフォロー" defaultValue={lead.nextAction} />
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="lastContactDate">最終接触日</label>
          <input id="lastContactDate" name="lastContactDate" type="date" defaultValue={lead.lastContactDate ?? ""} />
        </div>
        <div className="name-field">
          <label htmlFor="dealAmount">受注金額(円・受注時のみ)</label>
          <input id="dealAmount" name="dealAmount" type="number" min={0} defaultValue={lead.dealAmount ?? ""} />
        </div>
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}
      {state?.saved && <p className="status-box ok">保存しました。</p>}

      <div className="btn-row">
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "保存中…" : "リード情報を保存"}
        </button>
        <button
          type="button"
          disabled={rescoring}
          onClick={() => startRescore(() => rescoreLeadAction(lead.id))}
        >
          {rescoring ? "再計算中…" : "AIスコアを再計算"}
        </button>
      </div>
    </form>
  );
}
