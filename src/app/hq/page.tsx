import Link from "next/link";
import { requireHqAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fromDbRow, type DbTeamMemberRow } from "@/lib/types";
import { rankedOf } from "@/lib/talents";
import Topbar from "@/components/Topbar";
import PortfolioPanel from "@/components/PortfolioPanel";
import SummaryPanel from "@/components/SummaryPanel";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { deleteCompanyAction } from "./actions";

export default async function HqPage() {
  const profile = await requireHqAdmin();
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: true });

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("id, company_id, name, measured_date, raw_scores, talent_scores, created_at");

  const allMembers = ((memberRows as DbTeamMemberRow[] | null) || []).map(fromDbRow);

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
    return { company: c, count: members.length, topTalent: top?.t.name };
  });

  return (
    <>
      <Topbar roleLabel="本部アカウント" email={profile.email} />
      <div className="shell">
        <header className="top">
          <h1 className="font-display">本部　人的資本ポートフォリオ</h1>
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
            companyStats.map(({ company, count, topTalent }) => (
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
              </div>
            ))
          )}
        </div>

        <PortfolioPanel
          members={allMembers}
          step="02"
          title="全社横断ポートフォリオ"
          subtitle="全社
