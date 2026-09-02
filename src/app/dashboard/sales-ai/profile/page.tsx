import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import SalesAiNav from "@/components/SalesAiNav";
import ScoreBars from "@/components/salesAi/ScoreBars";
import ProfileForm from "./ProfileForm";
import { runDiagnosisAction } from "./actions";
import {
  MARKETING_LABELS,
  SALES_LABELS,
  LEAD_HEALTH_LABELS,
  diagnosisFromRow,
  type DbSalesDiagnosisRow,
} from "@/lib/salesAi/types";

export default async function SalesAiProfilePage() {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", profile.companyId)
    .single();

  const { data: profileRow } = await supabase
    .from("sales_profiles")
    .select(
      "industry, area, employee_count, website, product_service, price_range, current_marketing, current_sales_method, monthly_inquiries, monthly_deals, monthly_orders"
    )
    .eq("company_id", profile.companyId)
    .maybeSingle();

  const { data: diagnosisRows } = await supabase
    .from("sales_diagnoses")
    .select(
      "id, company_id, marketing_scores, sales_scores, lead_scores, bottleneck_category, bottleneck_summary, created_at"
    )
    .eq("company_id", profile.companyId)
    .order("created_at", { ascending: false })
    .limit(1);

  const diagnosis = diagnosisRows && diagnosisRows[0] ? diagnosisFromRow(diagnosisRows[0] as DbSalesDiagnosisRow) : null;

  return (
    <>
      <Topbar
        roleLabel="会社アカウント"
        contextLabel={company?.name}
        email={profile.email ? emailToLoginId(profile.email) : profile.email}
      />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">企業情報・AI営業診断</h1>
          <p>自社の状況を登録すると、AIが集客・営業・リードの3領域を診断し、最大のボトルネックを教えてくれます。</p>
        </header>

        <SalesAiNav active="/dashboard/sales-ai/profile" />

        <div className="two-col">
          <div className="panel">
            <h2>企業登録</h2>
            <p className="panel-sub">診断・理想顧客(ICP)作成の元になる情報です。</p>
            <ProfileForm
              companyName={company?.name || ""}
              initial={{
                industry: profileRow?.industry ?? "",
                area: profileRow?.area ?? "",
                employeeCount: profileRow?.employee_count ?? "",
                website: profileRow?.website ?? "",
                productService: profileRow?.product_service ?? "",
                priceRange: profileRow?.price_range ?? "",
                currentMarketing: profileRow?.current_marketing ?? "",
                currentSalesMethod: profileRow?.current_sales_method ?? "",
                monthlyInquiries: profileRow?.monthly_inquiries ?? null,
                monthlyDeals: profileRow?.monthly_deals ?? null,
                monthlyOrders: profileRow?.monthly_orders ?? null,
              }}
            />
          </div>

          <div className="panel">
            <h2>AI営業・集客診断</h2>
            <p className="panel-sub">企業情報を保存したあと、診断を実行してください。</p>

            <form action={runDiagnosisAction}>
              <div className="btn-row" style={{ marginTop: 0, marginBottom: 16 }}>
                <button type="submit" className="accent">
                  {diagnosis ? "診断をやり直す" : "AI診断を実行"}
                </button>
              </div>
            </form>

            {diagnosis ? (
              <>
                <div className="info-box" style={{ marginBottom: 16 }}>
                  {diagnosis.bottleneckSummary}
                </div>

                <ScoreBars
                  title="集客"
                  scores={Object.entries(diagnosis.marketingScores).map(([k, v]) => ({
                    label: MARKETING_LABELS[k as keyof typeof MARKETING_LABELS],
                    value: v,
                  }))}
                />
                <ScoreBars
                  title="営業"
                  scores={Object.entries(diagnosis.salesScores).map(([k, v]) => ({
                    label: SALES_LABELS[k as keyof typeof SALES_LABELS],
                    value: v,
                  }))}
                />
                <ScoreBars
                  title="リード"
                  scores={Object.entries(diagnosis.leadScores).map(([k, v]) => ({
                    label: LEAD_HEALTH_LABELS[k as keyof typeof LEAD_HEALTH_LABELS],
                    value: v,
                  }))}
                />
              </>
            ) : (
              <div className="empty-state">まだ診断結果がありません。企業情報を保存してから「AI診断を実行」を押してください。</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
