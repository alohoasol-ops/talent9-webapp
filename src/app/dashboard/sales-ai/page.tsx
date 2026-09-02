import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import SalesAiNav from "@/components/SalesAiNav";
import { LEAD_STATUSES, leadFromRow, scoreBand, type DbLeadRow, type LeadStatus } from "@/lib/salesAi/types";

function isThisMonth(iso: string, monthStart: Date): boolean {
  return new Date(iso) >= monthStart;
}

// 失注を除いた、パイプラインの並び順(未接触 → … → 受注)。
// ステータス変更履歴を持たないMVPでは「現在そのステージに到達しているか」で疑似的なファネルを作る。
const FUNNEL_STAGES = LEAD_STATUSES.filter((s) => s !== "失注") as LeadStatus[];

export default async function SalesAiDashboardPage() {
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
    .eq("company_id", profile.companyId);

  const leads = ((leadRows as DbLeadRow[] | null) || []).map(leadFromRow);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const newLeadsThisMonth = leads.filter((l) => isThisMonth(l.createdAt, monthStart));
  const promisingThisMonth = newLeadsThisMonth.filter((l) => (l.aiScore ?? 0) >= 70);

  const activeThisMonthByStatus = (status: LeadStatus) =>
    leads.filter((l) => l.status === status && isThisMonth(l.updatedAt, monthStart)).length;

  const dealCandidateCount = activeThisMonthByStatus("商談候補");
  const dealCount = activeThisMonthByStatus("商談");
  const proposalCount = activeThisMonthByStatus("提案");
  const orderCount = activeThisMonthByStatus("受注");
  const orderAmount = leads
    .filter((l) => l.status === "受注" && isThisMonth(l.updatedAt, monthStart))
    .reduce((sum, l) => sum + (l.dealAmount ?? 0), 0);

  const funnelCounts = FUNNEL_STAGES.map(
    (stage, i) => leads.filter((l) => l.status !== "失注" && FUNNEL_STAGES.indexOf(l.status) >= i).length
  );

  let insight = "リードが登録されていません。まずは「リード管理」から見込み企業を登録しましょう。";
  if (leads.length > 0) {
    let weakestIdx = -1;
    let weakestRate = 1;
    for (let i = 0; i < funnelCounts.length - 1; i++) {
      if (funnelCounts[i] === 0) continue;
      const rate = funnelCounts[i + 1] / funnelCounts[i];
      if (rate < weakestRate) {
        weakestRate = rate;
        weakestIdx = i;
      }
    }

    if (weakestIdx === -1 || weakestRate >= 0.99) {
      insight = "各ステージの転換率は良好です。引き続き新規リードの獲得数を増やしていきましょう。";
    } else {
      const fromLabel = FUNNEL_STAGES[weakestIdx];
      const toLabel = FUNNEL_STAGES[weakestIdx + 1];
      const before = funnelCounts[weakestIdx + 1];
      const improvedRate = Math.min(1, weakestRate + 0.15);
      const after = Math.round(funnelCounts[weakestIdx] * improvedRate);
      insight = `今月の最重要課題は「リード数」ではなく「${fromLabel}→${toLabel}の転換率」です(現在${Math.round(
        weakestRate * 100
      )}%)。ここを改善すると、「${toLabel}」の件数が${before}件 → ${after}件になる可能性があります。`;
    }
  }

  return (
    <>
      <Topbar
        roleLabel="会社アカウント"
        contextLabel={company?.name}
        email={profile.email ? emailToLoginId(profile.email) : profile.email}
      />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">商談創出AI ダッシュボード</h1>
          <p>営業マンを増やす前に、商談を増やす。リードの数ではなく、有望商談数を追いかけます。</p>
          <div className="badge-row">
            <span className="badge">企業登録</span>
            <span className="badge">→ AI診断</span>
            <span className="badge">→ ICP設計</span>
            <span className="badge">→ リード発見・育成</span>
            <span className="badge">→ 商談化</span>
          </div>
        </header>

        <SalesAiNav active="/dashboard/sales-ai" />

        <div className="panel">
          <h2>今月のサマリー</h2>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-n">{newLeadsThisMonth.length}</div>
              <div className="stat-l">新規リード数</div>
            </div>
            <div className="stat-card">
              <div className="stat-n">{promisingThisMonth.length}</div>
              <div className="stat-l">有望リード数</div>
            </div>
            <div className="stat-card">
              <div className="stat-n">{dealCandidateCount}</div>
              <div className="stat-l">商談候補数</div>
            </div>
            <div className="stat-card">
              <div className="stat-n">{dealCount}</div>
              <div className="stat-l">商談数</div>
            </div>
            <div className="stat-card">
              <div className="stat-n">{proposalCount}</div>
              <div className="stat-l">提案数</div>
            </div>
            <div className="stat-card">
              <div className="stat-n">{orderCount}</div>
              <div className="stat-l">受注数</div>
            </div>
            <div className="stat-card">
              <div className="stat-n">¥{orderAmount.toLocaleString()}</div>
              <div className="stat-l">受注金額</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>AI分析：今月の最重要課題</h2>
          <div className="info-box">{insight}</div>
        </div>

        <div className="panel">
          <h2>見込み度別のリード数</h2>
          <div className="stat-grid">
            {(["最優先", "有望", "育成", "優先度低"] as const).map((band) => (
              <div className="stat-card" key={band}>
                <div className="stat-n">{leads.filter((l) => scoreBand(l.aiScore) === band).length}</div>
                <div className="stat-l">{band}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
