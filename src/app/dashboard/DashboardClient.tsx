"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeScores, type RawScores } from "@/lib/talents";
import type { TeamMember, DbTeamMemberRow } from "@/lib/types";
import { fromDbRow } from "@/lib/types";
import AddMemberPanel from "@/components/AddMemberPanel";
import RosterPanel from "@/components/RosterPanel";
import PortfolioPanel from "@/components/PortfolioPanel";
import FitSimulatorPanel from "@/components/FitSimulatorPanel";
import SummaryPanel from "@/components/SummaryPanel";

export default function DashboardClient({
  companyId,
  initialMembers,
}: {
  companyId: string;
  initialMembers: TeamMember[];
}) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printMemberId, setPrintMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!printMemberId) return;
    const timer = setTimeout(() => window.print(), 60);
    function handleAfterPrint() {
      setPrintMemberId(null);
    }
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printMemberId]);

  async function handleAdd(input: { name: string; date: string; raw: RawScores }) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const scores = computeScores(input.raw);

    const { data, error: insertError } = await supabase
      .from("team_members")
      .insert({
        company_id: companyId,
        name: input.name || "(氏名未設定)",
        measured_date: input.date || null,
        raw_scores: input.raw,
        talent_scores: scores,
      })
      .select("id, company_id, name, measured_date, raw_scores, talent_scores, created_at")
      .single();

    setPending(false);

    if (insertError || !data) {
      setError("メンバーの追加に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    setMembers((prev) => [...prev, fromDbRow(data as DbTeamMemberRow)]);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("team_members").delete().eq("id", id);
    if (deleteError) {
      alert("削除に失敗しました。時間をおいて再度お試しください。");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <div className="no-print">
        <AddMemberPanel onAdd={handleAdd} pending={pending} />
        {error && <p className="field-error">{error}</p>}
      </div>
      <div className={printMemberId ? "roster-print-single" : "no-print"}>
        <RosterPanel
          members={members}
          onDelete={handleDelete}
          onPrintMember={setPrintMemberId}
          printTargetId={printMemberId}
        />
      </div>
      <div className="no-print">
        <PortfolioPanel members={members} />
        <FitSimulatorPanel members={members} />
      </div>
      <div className={printMemberId ? "no-print" : undefined}>
        <SummaryPanel
          members={members}
          extraActions={
            <div className="btn-row no-print">
              <button type="button" className="primary" onClick={() => window.print()}>PDFとして保存(印刷)</button>
            </div>
          }
        />
      </div>
    </>
  );
}
