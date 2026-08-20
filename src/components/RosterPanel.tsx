"use client";

import RadarChart from "./RadarChart";
import PersonReportSections from "./PersonReportSections";
import { rankedOf, commentFor, presetFits } from "@/lib/talents";
import type { TeamMember, GoalSheet } from "@/lib/types";

function RankTable({ scores }: { scores: TeamMember["scores"] }) {
  const ranked = rankedOf(scores);
  const max = ranked[0]?.score || 1;
  return (
    <div className="scroll-x">
      <table className="data">
        <thead>
          <tr><th>順位</th><th>才能</th><th>スコア</th></tr>
        </thead>
        <tbody>
          {ranked.map((r, idx) => (
            <tr key={r.t.key}>
              <td>{idx + 1}</td>
              <td>{r.t.name}</td>
              <td className="mono">
                {r.score.toFixed(1)}
                <div className="cov-track" style={{ marginTop: 3 }}>
                  <div className="cov-fill" style={{ width: `${Math.max(4, (r.score / max) * 100)}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RosterPanel({
  members,
  onDelete,
  onPrintMember,
  onEditMember,
  onSaveGoalSheet,
  printTargetId,
  readOnly,
  step = "02",
}: {
  members: TeamMember[];
  onDelete?: (id: string) => void;
  onPrintMember?: (id: string) => void;
  onEditMember?: (id: string) => void;
  onSaveGoalSheet?: (id: string, sheet: GoalSheet) => Promise<void> | void;
  printTargetId?: string | null;
  readOnly?: boolean;
  step?: string;
}) {
  return (
    <div className="panel">
      <h2 className="roster-title"><span className="n">{step}</span>　チームメンバー一覧　<span className="mono">({members.length}名)</span></h2>
      {members.length === 0 ? (
        <div className="empty-state">
          {readOnly ? "このチームにはまだメンバーが登録されていません。" : "まだメンバーが登録されていません。上の「メンバーを追加」からPDFを取り込んでください。"}
        </div>
      ) : (
        members.map((m) => {
          const top3 = rankedOf(m.scores).slice(0, 3);
          const fits = presetFits(m.scores);
          const bestFit = fits[0];
          const isPrintTarget = printTargetId === m.id;
          return (
            <details
              className={`roster-item${isPrintTarget ? " print-target" : ""}`}
              open={isPrintTarget || undefined}
              key={m.id}
            >
              <summary>
                <span className="r-name">{m.name || "(氏名未設定)"}</span>
                <span className="r-date mono">{m.measuredDate || "－"}</span>
                <span className="chip fit-chip">適性：{bestFit.name} {bestFit.fit.toFixed(0)}%</span>
                <span className="r-top3">
                  {top3.map((r) => (
                    <span className="chip" key={r.t.key}>{r.t.name} {r.score.toFixed(1)}</span>
                  ))}
                </span>
                {onPrintMember && (
                  <button
                    type="button"
                    className="r-print no-print"
                    onClick={(e) => {
                      e.preventDefault();
                      onPrintMember(m.id);
                    }}
                  >
                    個人レポートを印刷
                  </button>
                )}
                {!readOnly && onEditMember && (
                  <button
                    type="button"
                    className="r-print no-print"
                    onClick={(e) => {
                      e.preventDefault();
                      onEditMember(m.id);
                    }}
                  >
                    編集
                  </button>
                )}
                {!readOnly && onDelete && (
                  <button
                    type="button"
                    className="r-del no-print"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("このメンバーを削除しますか？")) onDelete(m.id);
                    }}
                  >
                    削除
                  </button>
                )}
              </summary>
              <div className="roster-detail">
                <RadarChart scores={m.scores} size={180} />
                <RankTable scores={m.scores} />
              </div>
              <div className="strength-block">
                <p className="field-group-title">適性タイプ(5つの働き方の型・相対比較)</p>
                <p className="fit-note">数値は5つの型の中での相対的な近さの目安です。数値が低い型があっても、その仕事が苦手・向いていないという意味ではありません。</p>
                <div style={{ marginBottom: 16 }}>
                  {fits.map((f, idx) => (
                    <div className="coverage-row" key={f.name}>
                      <span className="cov-label">{idx === 0 && "★ "}{f.name}</span>
                      <div className="cov-track"><div className="cov-fill" style={{ width: `${f.fit}%` }} /></div>
                      <span className="cov-n">{f.fit.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                <p className="field-group-title">TOP3の強み・向いている職種</p>
                <div className="strength-grid">
                  {top3.map((r, idx) => (
                    <div className="strength-card" key={r.t.key}>
                      <span className="strength-rank">TOP{idx + 1}</span>
                      <h4>{r.t.name}</h4>
                      <p className="def">{r.t.def}</p>
                      <p className="comment">{commentFor(r.t, m.raw)}</p>
                      <p className="roles"><strong>向いている職種例：</strong>{r.t.roles}</p>
                      <p className="roles" style={{ marginTop: 4 }}><strong>向いている仕事：</strong>{r.t.goodFit}</p>
                      <p className="roles" style={{ marginTop: 4 }}><strong>苦手になりやすい仕事：</strong>{r.t.poorFit}</p>
                    </div>
                  ))}
                </div>
              </div>
              <PersonReportSections member={m} onSaveGoalSheet={onSaveGoalSheet} />
            </details>
          );
        })
      )}
    </div>
  );
}
