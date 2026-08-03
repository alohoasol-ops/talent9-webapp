"use client";

import RadarChart from "./RadarChart";
import { CHART_ORDER, TALENTS, TALENT_BY_KEY, rankedOf, type TalentKey, type TalentScores } from "@/lib/talents";
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

export default function PortfolioPanel({
  members,
  step = "03",
  title = "チーム才能ポートフォリオ",
  subtitle = "チーム全体の平均プロフィールと、メンバーごとの才能マトリクスです。",
}: {
  members: TeamMember[];
  step?: string;
  title?: string;
  subtitle?: string;
}) {
  const avg = teamAverage(members);

  return (
    <div className="panel">
      <h2><span className="n">{step}</span>　{title}</h2>
      <p className="panel-sub">{subtitle}</p>

      {!avg ? (
        <div className="empty-state">メンバーを登録するとチームの才能ポートフォリオが表示されます。</div>
      ) : (
        <>
          <div className="two-col">
            <div>
              <RadarChart scores={avg} size={280} />
              <p style={{ fontSize: 12, color: "var(--ink-dim)", textAlign: "center", marginTop: 6 }}>
                チーム平均プロフィール(最大値を5.0として相対換算)
              </p>
            </div>
            <div>
              <p className="field-group-title">才能カバレッジ(各才能がTOP3に入っているメンバーの割合)</p>
              <Coverage members={members} />
            </div>
          </div>

          <p className="field-group-title" style={{ marginTop: 18 }}>メンバー × 才能マトリクス</p>
          <div className="scroll-x">
            <table className="data">
              <thead>
                <tr>
                  <th>氏名</th>
                  {CHART_ORDER.map((k) => <th key={k}>{TALENT_BY_KEY[k].name}</th>)}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="name-cell">{m.name || "(未設定)"}</td>
                    {CHART_ORDER.map((k) => {
                      const v = m.scores[k];
                      const t = Math.max(0, Math.min(1, v / 80));
                      const alpha = 0.05 + t * 0.45;
                      return (
                        <td
                          key={k}
                          className="heat-cell"
                          style={{ background: `rgba(var(--brand-rgb),${alpha.toFixed(2)})` }}
                        >
                          {v.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Coverage({ members }: { members: TeamMember[] }) {
  const counts: Record<TalentKey, number> = {} as Record<TalentKey, number>;
  TALENTS.forEach((t) => { counts[t.key] = 0; });
  members.forEach((m) => {
    rankedOf(m.scores).slice(0, 3).forEach((r) => { counts[r.t.key]++; });
  });
  const list = TALENTS.map((t) => ({ t, n: counts[t.key] })).sort((a, b) => b.n - a.n);

  return (
    <div>
      {list.map((c) => {
        const pct = members.length ? (c.n / members.length) * 100 : 0;
        return (
          <div className="coverage-row" key={c.t.key}>
            <span className="cov-label">{c.t.name}</span>
            <div className="cov-track"><div className="cov-fill" style={{ width: `${pct}%` }} /></div>
            <span className="cov-n">{c.n}/{members.length}名</span>
          </div>
        );
      })}
    </div>
  );
}
