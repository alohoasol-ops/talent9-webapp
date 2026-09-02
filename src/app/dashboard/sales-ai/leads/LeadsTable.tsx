"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusSelect from "./StatusSelect";
import { LEAD_STATUSES, scoreBand, type Lead } from "@/lib/salesAi/types";

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return leads;
    return leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  if (leads.length === 0) {
    return <div className="empty-state">まだリードが登録されていません。上のフォームから最初のリードを登録してください。</div>;
  }

  return (
    <div>
      <div className="field-row" style={{ marginBottom: 10 }}>
        <label htmlFor="statusFilter" style={{ flex: "none", marginRight: 8 }}>
          ステータス絞り込み
        </label>
        <select
          id="statusFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface-alt)",
            color: "var(--ink)",
            fontSize: 13,
          }}
        >
          <option value="all">すべて({leads.length})</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}({leads.filter((l) => l.status === s).length})
            </option>
          ))}
        </select>
      </div>

      <div className="scroll-x">
        <table className="data">
          <thead>
            <tr>
              <th>会社名</th>
              <th>業種</th>
              <th>スコア</th>
              <th>ステータス</th>
              <th>次回アクション</th>
              <th>最終接触日</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td className="name-cell">
                  <Link href={`/dashboard/sales-ai/leads/${lead.id}`}>{lead.name}</Link>
                </td>
                <td>{lead.industry || "-"}</td>
                <td>
                  {lead.aiScore ?? "-"}
                  {lead.aiScore !== null && <span className="chip" style={{ marginLeft: 6 }}>{scoreBand(lead.aiScore)}</span>}
                </td>
                <td>
                  <StatusSelect leadId={lead.id} status={lead.status} />
                </td>
                <td>{lead.nextAction || "-"}</td>
                <td>{lead.lastContactDate || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
