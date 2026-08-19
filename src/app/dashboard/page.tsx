import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fromDbRow, type DbTeamMemberRow } from "@/lib/types";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", profile.companyId)
    .single();

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("id, company_id, name, measured_date, raw_scores, talent_scores, goal_sheet, previous_talent_scores, previous_measured_date, created_at")
    .eq("company_id", profile.companyId)
    .order("created_at", { ascending: true });

  const members = ((memberRows as DbTeamMemberRow[] | null) || []).map(fromDbRow);

  return (
    <>
      <Topbar roleLabel="会社アカウント" contextLabel={company?.name} email={profile.email ? emailToLoginId(profile.email) : profile.email} />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">{company?.name || "チーム"} の9タレントマップ</h1>
          <p>脳科学系アセスメントの結果PDFをメンバーごとに取り込み、チームの才能構成を可視化します。</p>
          <div className="badge-row">
            <span className="badge">PDF解析はブラウザ内で完結</span>
            <span className="badge">データはSupabaseに保存(自社データのみ閲覧可)</span>
            <span className="badge">独自換算ロジック</span>
          </div>
        </header>

        <DashboardClient companyId={profile.companyId!} initialMembers={members} />
      </div>
    </>
  );
}
