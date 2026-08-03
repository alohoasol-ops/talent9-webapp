"use client";

import { TALENTS, rankedOf, type TalentKey, type TalentScores } from "@/lib/talents";
import type { TeamMember } from "@/lib/types";

function teamAverage(members: TeamMember[]): TalentScores | null {
  if (members.length === 0) return null;
  const avg = {} as TalentScores;
  TALENTS.forEach((t) => {
    const sum = members.reduce((s, m) => s + m.scores[t.key], 0);
    avg[t.key] = Math.round((sum / members.length) * 10) / 10;
  });
  return avg;
}

export default function SummaryPanel({
  members,
  title,
  step = "05",
  extraActions,
}: {
  members: TeamMember[];
  title?: string;
  step?: string;
  extraActions?: React.ReactNode;
}) {
  const avg = teamAverage(members);
  const today = new Date().toISOString().slice(0, 10);

  const counts: Record<TalentKey, number> = {} as Record<TalentKey, number>;
  TALENTS.forEach((t) => { counts[t.key] = 0; });
  members.forEach((m) => { counts[rankedOf(m.scores)[0].t.key]++; });
  const top1List = TALENTS
    .map((t) => ({ t, n: counts[t.key] }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);

  const avgRanked = avg ? rankedOf(avg) : [];

  return (
    <div className="panel">
      <h2><span className="n">{step}</span>　{title || "人的資本ポートフォリオ　サマリー出力"}</h2>
      <p className="panel-sub">社内検討・統合報告書の人的資本セクション向け参考資料として出力できます。</p>

      {members.length === 0 || !avg ? (
        <div className="empty-state">メンバーを登録するとサマリーが表示されます。</div>
      ) : (
        <>
          <p className="field-group-title">作成日：{today}</p>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-n">{members.length}</div><div className="stat-l">登録メンバー数</div></div>
            <div className="stat-card"><div className="stat-n">{avgRanked[0].t.name}</div><div className="stat-l">最大の強み(平均{avgRanked[0].score.toFixed(1)})</div></div>
            <div className="stat-card"><div className="stat-n">{avgRanked[avgRanked.length - 1].t.name}</div><div className="stat-l">手薄な才能(平均{avgRanked[avgRanked.length - 1].score.toFixed(1)})</div></div>
            <div className="stat-card"><div className="stat-n">{top1List.length}</div><div className="stat-l">首位才能の多様性(9分類中)</div></div>
          </div>

          <p className="field-group-title">第1才能(最もスコアが高い才能)の分布</p>
          <div style={{ marginBottom: 4 }}>
            {top1List.map((c) => {
              const pct = (c.n / members.length) * 100;
              return (
                <div className="coverage-row" key={c.t.key}>
                  <span className="cov-label">{c.t.name}</span>
                  <div className="cov-track"><div className="cov-fill" style={{ width: `${pct}%` }} /></div>
                  <span className="cov-n">{c.n}名({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {extraActions}

      <div className="disclaimer">
        <strong>本ツールについて：</strong>入力に使用しているのは、外部アセスメントの結果シートに記載された測定値(数値データ)のみです。特定アセスメントのタイプ名称・分類ロジック・解説文などの著作物は一切使用していません。9つの才能への換算式および適材適所の重み付けは、本ツール独自に設計した参考ロジックであり、元アセスメントの提供元による見解ではありません。医学的診断・心理検査・採用選考の合否を保証するものではありません。
      </div>
      <div className="disclaimer">
        <strong>データの取り扱いについて：</strong>登録したメンバーの情報はSupabase上のデータベースに保存され、Row Level Securityにより各社は自社のデータのみ、本部は閲覧のみ可能です。本レポートは社内検討のための参考情報であり、有価証券報告書等の法定開示書類そのものではありません。
      </div>
    </div>
  );
}
