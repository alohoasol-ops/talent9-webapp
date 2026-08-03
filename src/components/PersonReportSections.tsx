"use client";

import { rankedOf, TALENT_BY_KEY } from "@/lib/talents";
import type { TeamMember } from "@/lib/types";

export default function PersonReportSections({ member }: { member: TeamMember }) {
  const ranked = rankedOf(member.scores);
  const main = ranked[0].t;
  const sub = ranked[1].t;
  const complementTalent = TALENT_BY_KEY[main.compatibility.complement];
  const tensionTalent = TALENT_BY_KEY[main.compatibility.tension];

  return (
    <div className="strength-block">
      <p className="field-group-title">エグゼクティブサマリー</p>
      <div className="stat-grid" style={{ marginBottom: 10 }}>
        <div className="stat-card"><div className="stat-n" style={{ fontSize: 16 }}>{main.name}</div><div className="stat-l">メイン才能</div></div>
        <div className="stat-card"><div className="stat-n" style={{ fontSize: 16 }}>{sub.name}</div><div className="stat-l">サブ才能</div></div>
      </div>
      <div className="info-box" style={{ marginBottom: 18 }}>{main.essence}</div>

      <p className="field-group-title">モチベーション要因</p>
      <div className="two-col" style={{ marginBottom: 18 }}>
        <div className="motiv-box motiv-up">
          <p className="motiv-title">上がる要因</p>
          {main.motivationUp.map((t) => <p className="motiv-item" key={t}>▲ {t}</p>)}
        </div>
        <div className="motiv-box motiv-down">
          <p className="motiv-title">下がる要因</p>
          {main.motivationDown.map((t) => <p className="motiv-item" key={t}>▼ {t}</p>)}
        </div>
      </div>

      <p className="field-group-title">チーム相性</p>
      <div className="two-col" style={{ marginBottom: 18 }}>
        <div className="compat-card compat-good">
          <p className="compat-label">◎ 最強の補完パートナー</p>
          <h4>{complementTalent.name}</h4>
          <p>{main.compatibility.complementNote}</p>
        </div>
        <div className="compat-card compat-tense">
          <p className="compat-label">△ ぶつかりやすい相手</p>
          <h4>{tensionTalent.name}</h4>
          <p>{main.compatibility.tensionNote}</p>
        </div>
      </div>

      <p className="field-group-title">マネージャーへの提言</p>
      <div style={{ marginBottom: 18 }}>
        {main.managerTips.map((tip, i) => (
          <p className="motiv-item" key={tip}>{i + 1}. {tip}</p>
        ))}
      </div>

      <p className="field-group-title">個人目標 × 会社目標 接続シート(1on1テンプレート)</p>
      <div className="scroll-x">
        <table className="data goal-sheet">
          <thead>
            <tr><th>項目</th><th>個人({member.name || "本人"})</th><th>会社・チーム</th></tr>
          </thead>
          <tbody>
            <tr><td>才能・強み</td><td>{main.name}({sub.name})</td><td></td></tr>
            <tr><td>最も輝ける役割</td><td>{main.roles}</td><td></td></tr>
            <tr><td>モチベーション源泉</td><td>{main.motivationUp.slice(0, 2).join("／")}</td><td></td></tr>
            <tr><td>3ヶ月の目標</td><td></td><td></td></tr>
            <tr><td>1年後のありたい姿</td><td></td><td></td></tr>
            <tr><td>目標一致のためのアクション</td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
