"use client";

import RadarChart from "./RadarChart";
import { rankedOf } from "@/lib/talents";
import type { TeamMember } from "@/lib/types";

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
  readOnly,
  step = "02",
}: {
  members: TeamMember[];
  onDelete?: (id: string) => void;
  readOnly?: boolean;
  step?: string;
}) {
  return (
    <div className="panel">
      <h2><span className="n">{step}</span>　チームメンバー一覧　<span className="mono">({members.length}名)</span></h2>
      {members.length === 0 ? (
        <div className="empty-state">
          {readOnly ? "このチームにはまだメンバーが登録されていません。" : "まだメンバーが登録されていません。上の「メンバーを追加」からPDFを取り込んでください。"}
        </div>
      ) : (
        members.map((m) => {
          const top3 = rankedOf(m.scores).slice(0, 3);
          return (
            <details className="roster-item" key={m.id}>
              <summary>
                <span className="r-name">{m.name || "(氏名未設定)"}</span>
                <span className="r-date mono">{m.measuredDate || "－"}</span>
                <span className="r-top3">
                  {top3.map((r) => (
                    <span className="chip" key={r.t.key}>{r.t.name} {r.score.toFixed(1)}</span>
                  ))}
                </span>
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
            </details>
          );
        })
      )}
    </div>
  );
}
