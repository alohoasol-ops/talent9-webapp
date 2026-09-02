"use client";

import { useActionState } from "react";
import { saveSalesProfileAction, type SaveProfileState } from "./actions";

export default function ProfileForm({
  companyName,
  initial,
}: {
  companyName: string;
  initial: {
    industry: string;
    area: string;
    employeeCount: string;
    website: string;
    productService: string;
    priceRange: string;
    currentMarketing: string;
    currentSalesMethod: string;
    monthlyInquiries: number | null;
    monthlyDeals: number | null;
    monthlyOrders: number | null;
  };
}) {
  const [state, formAction, pending] = useActionState<SaveProfileState | null, FormData>(
    saveSalesProfileAction,
    null
  );

  return (
    <form action={formAction}>
      <div className="name-field">
        <label htmlFor="companyName">会社名</label>
        <input id="companyName" name="companyName" type="text" required defaultValue={companyName} />
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="industry">業種</label>
          <input id="industry" name="industry" type="text" placeholder="例：建設業" defaultValue={initial.industry} />
        </div>
        <div className="name-field">
          <label htmlFor="area">所在地</label>
          <input id="area" name="area" type="text" placeholder="例：大阪府" defaultValue={initial.area} />
        </div>
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="employeeCount">従業員数</label>
          <input id="employeeCount" name="employeeCount" type="text" placeholder="例：20名" defaultValue={initial.employeeCount} />
        </div>
        <div className="name-field">
          <label htmlFor="website">Webサイト</label>
          <input id="website" name="website" type="text" placeholder="https://" defaultValue={initial.website} />
        </div>
      </div>

      <div className="name-field">
        <label htmlFor="productService">主力商品・サービス</label>
        <input id="productService" name="productService" type="text" defaultValue={initial.productService} />
      </div>

      <div className="name-field">
        <label htmlFor="priceRange">商品価格</label>
        <input id="priceRange" name="priceRange" type="text" placeholder="例：月額30万円" defaultValue={initial.priceRange} />
      </div>

      <div className="name-field">
        <label htmlFor="currentMarketing">現在の集客方法</label>
        <textarea
          id="currentMarketing"
          name="currentMarketing"
          rows={3}
          placeholder="例：SEO対策、SNS(Instagram)発信、紹介中心 など、取り組んでいることを具体的に"
          defaultValue={initial.currentMarketing}
        />
      </div>

      <div className="name-field">
        <label htmlFor="currentSalesMethod">現在の営業方法</label>
        <textarea
          id="currentSalesMethod"
          name="currentSalesMethod"
          rows={3}
          placeholder="例：紹介営業が中心、リストはExcelで管理、フォローは手薄 など"
          defaultValue={initial.currentSalesMethod}
        />
      </div>

      <div className="name-row">
        <div className="name-field">
          <label htmlFor="monthlyInquiries">月間問い合わせ数</label>
          <input
            id="monthlyInquiries"
            name="monthlyInquiries"
            type="number"
            min={0}
            defaultValue={initial.monthlyInquiries ?? ""}
          />
        </div>
        <div className="name-field">
          <label htmlFor="monthlyDeals">月間商談数</label>
          <input id="monthlyDeals" name="monthlyDeals" type="number" min={0} defaultValue={initial.monthlyDeals ?? ""} />
        </div>
        <div className="name-field">
          <label htmlFor="monthlyOrders">月間受注数</label>
          <input id="monthlyOrders" name="monthlyOrders" type="number" min={0} defaultValue={initial.monthlyOrders ?? ""} />
        </div>
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}
      {state?.saved && <p className="status-box ok">保存しました。</p>}

      <div className="btn-row">
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "保存中…" : "企業情報を保存"}
        </button>
      </div>
    </form>
  );
}
