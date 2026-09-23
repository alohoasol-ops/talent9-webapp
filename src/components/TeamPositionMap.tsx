"use client";

import { CHART_ORDER, TALENT_BY_KEY, rankedOf, type TalentKey } from "@/lib/talents";
import type { TeamMember } from "@/lib/types";

type Placed = { name: string; score: number };

export default function TeamPositionMap({
  members,
  step = "05",
}: {
  members: TeamMember[];
  step?: string;
}) {
  const groups = {} as Record<TalentKey, Placed[]>;
  CHART_ORDER.forEach((k) => {
    groups[k] = [];
  });
  members.forEach((m) => {
    const top = rankedOf(m.scores)[0];
    if (top) groups[top.t.key].push({ name: m.name || "(未設定)", score: top.score });
  });
  CHART_ORDER.forEach((k) => groups[k].sort((a, b) => b.score - a.score));

  const gaps = CHART_ORDER.filter((k) => groups[k].length === 0).map((k) => TALENT_BY_KEY[k].name);

  return (
    <div className="panel">
      <h2>
        <span className="n">{step}</span>　チーム最適配置マップ
      </h2>
      <p className="panel-sub">
        各メンバーを、診断でいちばん強い才能ごとに配置しています。どのポジションが厚い／手薄かがひと目でわかります。（名前の右の数字はその才能のスコア）
      </p>

      {members.length === 0 ? (
        <div className="empty-state">メンバーを登録すると配置マップが表示されます。</div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {CHART_ORDER.map((k) => {
              const t = TALENT_BY_KEY[k];
              const people = groups[k];
              const empty = people.length === 0;
              return (
                <div
                  key={k}
                  style={{
                    border: empty ? "1px dashed var(--line, #d5d9e0)" : "1px solid var(--line, #d5d9e0)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: empty ? "transparent" : "var(--surface, #fff)",
                    opacity: empty ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>{t.name}</strong>
                    {empty ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#b23b3b",
                          border: "1px solid #e3b7b7",
                          borderRadius: 999,
                          padding: "1px 8px",
                        }}
                      >
                        手薄
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>{people.length}名</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ink-dim)", margin: "0 0 8px", lineHeight: 1.5 }}>{t.def}</p>
                  {empty ? (
                    <p style={{ fontSize: 12, color: "var(--ink-dim)", margin: 0 }}>担う人がいません</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {people.map((p) => (
                        <span className="chip" key={p.name + p.score}>
                          {p.name}
                          <span className="mono" style={{ marginLeft: 5, opacity: 0.55 }}>
                            {p.score.toFixed(0)}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {gaps.length > 0 && (
            <div className="info-box" style={{ marginTop: 12 }}>
              ⚠ 手薄なポジション：{gaps.join("・")}。この才能を強みとするメンバーがいないため、採用・育成や役割分担で補うと、チームのバランスが整います。
            </div>
          )}
        </>
      )}
    </div>
  );
}
