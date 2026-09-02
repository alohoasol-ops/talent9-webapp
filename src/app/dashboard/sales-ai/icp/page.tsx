import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import SalesAiNav from "@/components/SalesAiNav";
import { generateIcpAction } from "./actions";
import { icpFromRow, type DbIcpRow } from "@/lib/salesAi/types";

export default async function SalesAiIcpPage() {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", profile.companyId)
    .single();

  const { data: hasProfile } = await supabase
    .from("sales_profiles")
    .select("company_id")
    .eq("company_id", profile.companyId)
    .maybeSingle();

  const { data: icpRows } = await supabase
    .from("icps")
    .select(
      "id, company_id, industry, employee_range, area, revenue_range, pain_points, features, decision_maker, buying_trigger, reasoning, created_at"
    )
    .eq("company_id", profile.companyId)
    .order("created_at", { ascending: false })
    .limit(1);

  const icp = icpRows && icpRows[0] ? icpFromRow(icpRows[0] as DbIcpRow) : null;

  return (
    <>
      <Topbar
        roleLabel="会社アカウント"
        contextLabel={company?.name}
        email={profile.email ? emailToLoginId(profile.email) : profile.email}
      />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">理想顧客(ICP)</h1>
          <p>「最も売れやすい顧客像」をAIが作成します。まず企業情報を登録してください。</p>
        </header>

        <SalesAiNav active="/dashboard/sales-ai/icp" />

        {!hasProfile ? (
          <div className="panel">
            <div className="empty-state">
              先に<a href="/dashboard/sales-ai/profile">企業情報・診断</a>から企業情報を登録してください。
            </div>
          </div>
        ) : (
          <div className="panel">
            <h2>理想顧客像</h2>
            <p className="panel-sub">企業情報をもとに、最も売れやすい顧客像とその理由をAIが生成します。</p>

            <form action={generateIcpAction}>
              <div className="btn-row" style={{ marginTop: 0, marginBottom: 16 }}>
                <button type="submit" className="accent">
                  {icp ? "ICPを作り直す" : "ICPを生成"}
                </button>
              </div>
            </form>

            {icp ? (
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-l">業種</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{icp.industry}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-l">従業員数</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{icp.employeeRange}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-l">地域</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{icp.area}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-l">売上規模</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{icp.revenueRange}</div>
                </div>
                <div className="stat-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="stat-l">課題</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{icp.painPoints}</div>
                </div>
                <div className="stat-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="stat-l">特徴</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{icp.features}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-l">意思決定者</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{icp.decisionMaker}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-l">購入タイミング</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{icp.buyingTrigger}</div>
                </div>
              </div>
            ) : (
              <div className="empty-state">まだICPがありません。「ICPを生成」を押してください。</div>
            )}

            {icp && (
              <div className="info-box" style={{ marginTop: 16 }}>
                <strong>なぜこの企業が見込み客なのか：</strong>
                <br />
                {icp.reasoning}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
