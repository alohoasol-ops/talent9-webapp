import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import StatusSelect from "../StatusSelect";
import LeadDetailForm from "./LeadDetailForm";
import ApproachPanel from "./ApproachPanel";
import { deleteLeadAction } from "../actions";
import {
  approachTextsFromRow,
  leadFromRow,
  scoreBand,
  type DbApproachTextRow,
  type DbLeadRow,
} from "@/lib/salesAi/types";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", profile.companyId)
    .single();

  const { data: leadRow } = await supabase
    .from("leads")
    .select(
      "id, company_id, name, url, industry, area, employee_count, estimated_revenue, contact_name, contact_title, email, phone, sns_url, hiring_status, pain_points, ai_score, score_reason, status, deal_amount, last_contact_date, next_action, created_at, updated_at"
    )
    .eq("id", id)
    .eq("company_id", profile.companyId)
    .maybeSingle();

  if (!leadRow) notFound();
  const lead = leadFromRow(leadRow as DbLeadRow);

  const { data: approachRows } = await supabase
    .from("approach_texts")
    .select("id, lead_id, company_id, email_subject, email_body, form_message, phone_script, first_meeting_script, created_at")
    .eq("lead_id", lead.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const approach = approachRows && approachRows[0] ? approachTextsFromRow(approachRows[0] as DbApproachTextRow) : null;

  return (
    <>
      <Topbar
        roleLabel="会社アカウント"
        contextLabel={company?.name}
        email={profile.email ? emailToLoginId(profile.email) : profile.email}
      />
      <div className="shell">
        <header className="top">
          <p className="no-print">
            <Link href="/dashboard/sales-ai/leads">← リード一覧に戻る</Link>
          </p>
          <h1 className="font-display">{lead.name}</h1>
          <div className="badge-row">
            <span className="badge">
              AI見込み度：{lead.aiScore ?? "-"}点({scoreBand(lead.aiScore)})
            </span>
            {lead.industry && <span className="badge">{lead.industry}</span>}
            {lead.area && <span className="badge">{lead.area}</span>}
          </div>
        </header>

        <div className="two-col">
          <div>
            <div className="panel">
              <h2>ステータス</h2>
              <StatusSelect leadId={lead.id} status={lead.status} />
            </div>

            <div className="panel">
              <h2>企業情報</h2>
              <table className="data">
                <tbody>
                  <tr>
                    <td className="name-cell">URL</td>
                    <td>{lead.url || "-"}</td>
                  </tr>
                  <tr>
                    <td className="name-cell">従業員数</td>
                    <td>{lead.employeeCount || "-"}</td>
                  </tr>
                  <tr>
                    <td className="name-cell">推定売上</td>
                    <td>{lead.estimatedRevenue || "-"}</td>
                  </tr>
                  <tr>
                    <td className="name-cell">SNS</td>
                    <td>{lead.snsUrl || "-"}</td>
                  </tr>
                  <tr>
                    <td className="name-cell">採用状況</td>
                    <td>{lead.hiringStatus || "-"}</td>
                  </tr>
                  <tr>
                    <td className="name-cell">課題</td>
                    <td>{lead.painPoints || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="panel">
              <h2>AI見込み度スコアの根拠</h2>
              <div className="info-box" style={{ whiteSpace: "pre-wrap" }}>
                {lead.scoreReason || "まだ根拠がありません。"}
              </div>
            </div>
          </div>

          <div>
            <div className="panel">
              <h2>リード情報の編集</h2>
              <LeadDetailForm lead={lead} />
            </div>

            <ApproachPanel leadId={lead.id} approach={approach} />

            <div className="panel">
              <h2>削除</h2>
              <p className="panel-sub">このリードを削除します。元に戻せません。</p>
              <form action={deleteLeadAction.bind(null, lead.id)}>
                <ConfirmSubmitButton confirmText="このリードを削除します。よろしいですか？" className="danger">
                  リードを削除
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
