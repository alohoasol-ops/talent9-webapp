"use client";

import { useActionState } from "react";
import { createLeadAction, type CreateLeadState } from "./actions";

export default function LeadCreateForm() {
  const [state, formAction, pending] = useActionState<CreateLeadState | null, FormData>(createLeadAction, null);

  return (
    <form action={formAction}>
      <div className="name-row">
        <div className="name-field">
          <label htmlFor="name">会社名</label>
          <input id="name" name="name" type="text" required placeholder="例：株式会社サンプル建設" />
        </div>
        <div className="name-field">
          <label htmlFor="url">URL</label>
          <input id="url" name="url" type="text" placeholder="https://" />
        </div>
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="industry">業種</label>
          <input id="industry" name="industry" type="text" />
        </div>
        <div className="name-field">
          <label htmlFor="area">所在地</label>
          <input id="area" name="area" type="text" />
        </div>
        <div className="name-field">
          <label htmlFor="employeeCount">従業員数</label>
          <input id="employeeCount" name="employeeCount" type="text" />
        </div>
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="estimatedRevenue">推定売上</label>
          <input id="estimatedRevenue" name="estimatedRevenue" type="text" />
        </div>
        <div className="name-field">
          <label htmlFor="hiringStatus">採用状況</label>
          <input id="hiringStatus" name="hiringStatus" type="text" placeholder="例：求人サイトで募集中" />
        </div>
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="contactName">担当者</label>
          <input id="contactName" name="contactName" type="text" />
        </div>
        <div className="name-field">
          <label htmlFor="contactTitle">役職</label>
          <input id="contactTitle" name="contactTitle" type="text" />
        </div>
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="email">メール</label>
          <input id="email" name="email" type="email" />
        </div>
        <div className="name-field">
          <label htmlFor="phone">電話</label>
          <input id="phone" name="phone" type="text" />
        </div>
        <div className="name-field">
          <label htmlFor="snsUrl">SNS</label>
          <input id="snsUrl" name="snsUrl" type="text" />
        </div>
      </div>

      <div className="name-field">
        <label htmlFor="painPoints">課題(分かる範囲で)</label>
        <textarea id="painPoints" name="painPoints" rows={2} placeholder="例：採用がうまくいっていない様子" />
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}

      <div className="btn-row">
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "登録中…" : "リードを登録してAIスコアリング"}
        </button>
      </div>
    </form>
  );
}
