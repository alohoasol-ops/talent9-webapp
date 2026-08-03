"use client";

import { useState } from "react";
import { ROLE_PRESETS, TALENTS, fitScore, type TalentKey } from "@/lib/talents";
import type { TeamMember } from "@/lib/types";

function defaultWeights(): Record<TalentKey, number> {
  const w = {} as Record<TalentKey, number>;
  TALENTS.forEach((t) => { w[t.key] = 2; });
  return w;
}

export default function FitSimulatorPanel({ members, step = "04" }: { members: TeamMember[]; step?: string }) {
  const [weights, setWeights] = useState<Record<TalentKey, number>>(defaultWeights());

  const results = members
    .map((m) => ({ m, fit: fitScore(m.scores, weights) }))
    .sort((a, b) => b.fit - a.fit);

  return (
    <div className="panel no-print">
      <h2><span className="n">{step}</span>　適材適所シミュレーター</h2>
      <p className="panel-sub">ポジションで重視する才能の重みを設定すると、フィット度が高いメンバー順に並び替わります。重みはあくまで検討用の例です。</p>

      <div className="preset-row">
        {ROLE_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            className="preset-btn"
            onClick={() => setWeights({ ...p.weights })}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="slider-grid">
        {TALENTS.map((t) => (
          <div className="slider-row" key={t.key}>
            <label htmlFor={`w-${t.key}`}>
              {t.name} <span className="sv">{weights[t.key]}</span>
            </label>
            <input
              id={`w-${t.key}`}
              type="range"
              min={0}
              max={5}
              step={1}
              value={weights[t.key]}
              onChange={(e) => setWeights((prev) => ({ ...prev, [t.key]: Number(e.target.value) }))}
            />
          </div>
        ))}
      </div>

      {members.length === 0 ? (
        <div className="empty-state">メンバーを登録するとフィット度を計算できます。</div>
      ) : (
        <div>
          {results.map((r, idx) => (
            <div className="fit-row" key={r.m.id}>
              <span className={`fit-rank${idx < 3 ? " gold" : ""}`}>{idx + 1}</span>
              <span className="fit-name">{r.m.name || "(未設定)"}</span>
              <div className="fit-track"><div className="fit-fill" style={{ width: `${r.fit}%` }} /></div>
              <span className="fit-pct mono">{r.fit.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
