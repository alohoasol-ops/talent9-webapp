import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import SalesAiNav from "@/components/SalesAiNav";
import LeadCreateForm from "./LeadCreateForm";
import LeadsTable from "./LeadsTable";
import { leadFromRow, type DbLeadRow } from "@/lib/salesAi/types";

export default async function SalesAiLeadsPage() {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", profile.companyId)
    .single();

  const { data: leadRows } = await supabase
    .from("leads")
    .select(
      "id, company_id, name, url, industry, area, employee_count, estimated_revenue, contact_name, contact_title, email, phone, sns_url, hiring_status, pain_points, ai_score, score_reason, status, deal_amount, last_contact_date, next_action, created_at, updated_at"
    )
    .eq("company_id", profile.companyId)
    .order("ai_score", { ascending: false, nullsFirst: false });

  const leads = ((leadRows as DbLeadRow[] | null) || []).map(leadFromRow);

  return (
    <>
      <Topbar
        roleLabel="会社アカウント"
        contextLabel={company?.name}
        email={profile.email ? emailToLoginId(profile.email) : profile.email}
      />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">見込み企業(リード)管理</h1>
          <p>ターゲット企業を登録すると、AIが見込み度をスコアリングします。リード数ではなく有望商談数を増やすことが目的です。</p>
        </header>

        <SalesAiNav active="/dashboard/sales-ai/leads" />

        <div className="panel">
          <h2>見込み企業を登録</h2>
          <LeadCreateForm />
        </div>

        <div className="panel">
          <h2>リード一覧 <span className="n">({leads.length})</span></h2>
          <LeadsTable leads={leads} />
        </div>
      </div>
    </>
  );
}
