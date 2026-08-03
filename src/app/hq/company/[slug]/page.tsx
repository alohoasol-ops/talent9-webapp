import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHqAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fromDbRow, type DbTeamMemberRow } from "@/lib/types";
import Topbar from "@/components/Topbar";
import RosterPanel from "@/components/RosterPanel";
import PortfolioPanel from "@/components/PortfolioPanel";
import FitSimulatorPanel from "@/components/FitSimulatorPanel";
import SummaryPanel from "@/components/SummaryPanel";

export default async function HqCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: id } = await params;
  const profile = await requireHqAdmin();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("id", id)
    .single();

  if (!company) notFound();

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("id, company_id, name, measured_date, raw_scores, talent_scores, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: true });

  const members = ((memberRows as DbTeamMemberRow[] | null) || []).map(fromDbRow);

  return (
    <>
      <Topbar roleLabel="本部アカウント" contextLabel={`閲覧中：${company.name}`} email={profile.email} />
      <div className="shell">
        <header className="top">
          <Link href="/hq" style={{ fontSize: 13, color: "var(--ink-dim)" }}>← 本部トップに戻る</Link>
          <h1 className="font-display" style={{ marginTop: 8 }}>{company.name}</h1>
          <p>本部からの閲覧専用ビューです。メンバーの追加・削除は各社の会社アカウントから行います。</p>
        </header>

        <RosterPanel members={members} readOnly step="01" />
        <PortfolioPanel members={members} step="02" />
        <FitSimulatorPanel members={members} step="03" />
        <SummaryPanel members={members} step="04" title={`${company.name} サマリー`} />
      </div>
    </>
  );
}
