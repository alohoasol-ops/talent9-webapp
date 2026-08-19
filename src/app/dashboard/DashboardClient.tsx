"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeScores, type RawScores, type ExtraRawScores } from "@/lib/talents";
import type { TeamMember, DbTeamMemberRow, GoalSheet } from "@/lib/types";
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
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

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
      .select("id, company_id, name, measured_date, raw_scores, talent_scores, goal_sheet, previous_talent_scores, previous_measured_date, created_at")
      .single();

    setPending(false);

    if (insertError || !data) {
      setError("メンバーの追加に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    setMembers((prev) => [...prev, fromDbRow(data as DbTeamMemberRow)]);
  }

  async function handleUpdate(id: string, input: { name: string; date: string; raw: RawScores & Partial<ExtraRawScores> }) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const scores = computeScores(input.raw);
    const existing = members.find((m) => m.id === id);

    const { data, error: updateError } = await supabase
      .from("team_members")
      .update({
        name: input.name || "(氏名未設定)",
        measured_date: input.date || null,
        raw_scores: input.raw,
        talent_scores: scores,
        previous_talent_scores: existing ? existing.scores : null,
        previous_measured_date: existing ? existing.measuredDate : null,
      })
      .eq("id", id)
      .select("id, company_id, name, measured_date, raw_scores, talent_scores, goal_sheet, previous_talent_scores, previous_measured_date, created_at")
      .single();

    setPending(false);

    if (updateError || !data) {
      setError("メンバーの更新に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    const updated = fromDbRow(data as DbTeamMemberRow);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    setEditingMemberId(null);
  }

  async function handleSaveGoalSheet(id: string, goalSheet: GoalSheet) {
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("team_members")
      .update({ goal_sheet: goalSheet })
      .eq("id", id)
      .select("id, company_id, name, measured_date, raw_scores, talent_scores, goal_sheet, previous_talent_scores, previous_measured_date, created_at")
      .single();

    if (updateError || !data) {
      alert("接続シートの保存に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    const updated = fromDbRow(data as DbTeamMemberRow);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
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
        <AddMemberPanel
          onAdd={handleAdd}
          pending={pending}
          editingMember={members.find((m) => m.id === editingMemberId) ?? null}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditingMemberId(null)}
        />
        {error && <p className="field-error">{error}</p>}
      </div>
      <div className={printMemberId ? "roster-print-single" : "no-print"}>
        <RosterPanel
          members={members}
          onDelete={handleDelete}
          onPrintMember={setPrintMemberId}
          onEditMember={setEditingMemberId}
          onSaveGoalSheet={handleSaveGoalSheet}
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
