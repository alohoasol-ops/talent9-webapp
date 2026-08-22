import Link from "next/link";
import { requireHqAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { fromDbRow, type DbTeamMemberRow } from "@/lib/types";
import { rankedOf } from "@/lib/talents";

const MEMBER_SELECT =
  "id, company_id, name, measured_date, raw_scores, talent_scores, goal_sheet, previous_talent_scores, previous_measured_date, self_perception, johari_open_note, peer_feedback(id, feedback_text, created_at), created_at";
import { emailToLoginId } from "@/lib/slug";
import Topbar from "@/components/Topbar";
import PortfolioPanel from "@/components/PortfolioPanel";
import SummaryPanel from "@/components/SummaryPanel";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ResetPasswordButton from "@/components/ResetPasswordButton";
import { deleteCompanyAction } from "./actions";

export default async function HqPage() {
  const profile = await requireHqAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: true });

  const { data: memberRows } = await supabase
    .from("team_members")
    .select(MEMBER_SELECT);

  const allMembers = ((memberRows as DbTeamMemberRow[] | null) || []).map(fromDbRow);

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("role", "company_admin");

  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailByUserId = new Map<string, string>();
  (usersData?.users || []).forEach((u) => {
    if (u.email) emailByUserId.set(u.id, u.email);
  });
  const emailByCompanyId = new Map<string, string>();
  (profileRows || []).forEach((p) => {
    if (p.company_id) {
      const email = emailByUserId.get(p.id);
      if (email) emailByCompanyId.set(p.company_id, email);
    }
  });

  const companyStats = (companies || []).map((c) => {
    const members = allMembers.filter((m) => m.companyId === c.id);
    const top = members.length
      ? rankedOf(
          members.reduce(
            (acc, m) => {
              Object.keys(m.scores).forEach((k) => {
                const key = k as keyof typeof m.scores;
                acc[key] = (acc[key] || 0) + m.scores[key] / members.length;
              });
              return acc;
            },
            {} as typeof members[0]["scores"]
          )
        )[0]
      : null;
    return { company: c, count: members.length, topTalent: top?.t.name, email: emailByCompanyId.get(c.id) };
  });

  return (
    <>
      <Topbar roleLabel="本部アカウント" email={profile.email} />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">本部　9タレントマップ</h1>
          <p>全社の9才能データを横断的に確認できます。各社のデータは会社アカウントが登録し、本部からは閲覧のみ行えます。</p>
          <div className="badge-row">
            <span className="badge">全{companies?.length ?? 0}社</span>
            <span className="badge">全{allMembers.length}名</span>
            <span className="badge">本部は閲覧専用</span>
          </div>
        </header>

        <div className="panel">
          <h2><span className="n">01</span>　会社一覧</h2>
          <div className="btn-row" style={{ marginTop: 0, marginBottom: 16 }}>
            <Link className="btn primary" href="/hq/companies/new">＋ 会社アカウントを新規作成</Link>
          </div>
          {companyStats.length === 0 ? (
            <div className="empty-state">まだ会社が登録されていません。「＋ 会社アカウントを新規作成」から追加してください。</div>
          ) : (
            companyStats.map(({ company, count, topTalent, email }) => (
              <div className="company-row" key={company.id}>
                <span className="c-name">
                  <Link href={`/hq/company/${company.id}`}>{company.name}</Link>
                </span>
                <span className="c-stat">{count}名</span>
                <span className="c-stat">{topTalent ? `強み：${topTalent}` : "データなし"}</span>
                <form action={deleteCompanyAction.bind(null, company.id)}>
                  <ConfirmSubmitButton
                    className="r-del"
                    confirmText={`「${company.name}」を削除します。登録されているメンバー(${count}名)とログインアカウントもすべて削除され、元に戻せません。よろしいですか？`}
                  >
                    削除
                  </ConfirmSubmitButton>
                </form>
                <div className="c-sub">
                  <span className="mono">ID：{email ? emailToLoginId(email) : "不明"}</span>
                  <ResetPasswordButton companyId={company.id} companyName={company.name} />
                </div>
              </div>
            ))
          )}
        </div>

        <PortfolioPanel
          members={allMembers}
          step="02"
          title="全社横断ポートフォリオ"
          subtitle="全社のメンバーを合算した才能構成です。"
        />
        <SummaryPanel members={allMembers} step="03" title="全社サマリー" />
      </div>
    </>
  );
}
