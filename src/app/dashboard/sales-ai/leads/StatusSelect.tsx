"use client";

import { useState, useTransition } from "react";
import { updateLeadStatusAction } from "./actions";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/salesAi/types";

export default function StatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        setValue(next);
        startTransition(() => {
          updateLeadStatusAction(leadId, next);
        });
      }}
      style={{
        padding: "6px 8px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--surface-alt)",
        color: "var(--ink)",
        fontSize: 13,
      }}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
