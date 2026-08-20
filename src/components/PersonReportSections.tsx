"use client";

import {
  rankedOf, TALENT_BY_KEY,
  THINKING_KEYS, SENSE_KEYS, hasExtraData, rankedThinking, rankedSense, combinedInsight, communicationInsight,
  RAW_KEYS, RAW_LABELS, RAW_DEFS, rawBand, rawNarrative, retentionTips, scoreDeltas, careLevel,
} from "@/lib/talents";
import type { TeamMember, GoalSheet } from "@/lib/types";
import GoalSheetForm from "./GoalSheetForm";

const TRUST_BUILDERS = [
  { label: "認める", note: "結果が出る前から、相手の存在や取り組みそのものを肯定する" },
  { label: "任せる", note: "手順を細かく管理せず、相手なりのやり方を尊重して委ねる" },
  { label: "聴く", note: "話の途中で否定や反論をはさまず、最後まで受け止める" },
  { label: "支える", note: "代わりにやるのではなく、困っている時に一緒に考える" },
  { label: "伝える", note: "感じたことや良い変化を、言葉にしてきちんと本人に返す" },
];

const TRUST_ERODERS = [
  { label: "コントロールしたい気持ち", note: "「こうあるべき」という期待を押しつけるほど、信頼は弱まる" },
  { label: "疑う気持ち", note: "「本当に大丈夫か」という不安が強いほど、信頼は弱まる" },
];

export default function PersonReportSections({
  member,
  onSaveGoalSheet,
}: {
  member: TeamMember;
  onSaveGoalSheet?: (id: string, sheet: GoalSheet) => Promise<void> | void;
}) {
  const ranked = rankedOf(member.scores);
  const main = ranked[0].t;
  const sub = ranked[1].t;
  const complementTalent = TALENT_BY_KEY[main.compatibility.complement];
  const tensionTalent = TALENT_BY_KEY[main.compatibility.tension];
  const showThinking = hasExtraData(THINKING_KEYS, member.raw);
  const showSense = hasExtraData(SENSE_KEYS, member.raw);
  const thinking = showThinking ? rankedThinking(member.raw) : [];
  const sense = showSense ? rankedSense(member.raw) : [];
  const insight = showThinking && showSense ? combinedInsight(main, thinking[0].t, sense[0].t) : null;
  const comm = showThinking && showSense ? communicationInsight(thinking[0].t, sense[0].t) : null;
  const care = careLevel(member.raw);
  const careColor = care.level === "高" ? "var(--danger)" : care.level === "中" ? "#b8860b" : "var(--brand)";

  return (
    <div className="strength-block">
      {member.previousScores && (
        <>
          <p className="field-group-title">
            前回との比較{member.previousMeasuredDate ? `(前回測定日：${member.previousMeasuredDate})` : ""}
          </p>
          <div className="scroll-x" style={{ marginBottom: 18 }}>
            <table className="data">
              <thead>
                <tr><th>才能</th><th>前回</th><th>今回</th><th>変化</th></tr>
              </thead>
              <tbody>
                {scoreDeltas(member.scores, member.previousScores).map((d) => (
                  <tr key={d.t.key}>
                    <td className="name-cell">{d.t.name}</td>
                    <td className="mono">{d.previous.toFixed(1)}</td>
                    <td className="mono">{d.current.toFixed(1)}</td>
                    <td className="mono" style={{ color: d.delta > 0 ? "var(--brand)" : d.delta < 0 ? "var(--danger)" : "var(--ink-dim)" }}>
                      {d.delta > 0 ? "▲" : d.delta < 0 ? "▼" : "→"} {d.delta > 0 ? "+" : ""}{d.delta.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="field-group-title">エグゼクティブサマリー</p>
      <div className="stat-grid" style={{ marginBottom: 10 }}>
        <div className="stat-card"><div className="stat-n" style={{ fontSize: 16 }}>{main.name}</div><div className="stat-l">メイン才能</div></div>
        <div className="stat-card"><div className="stat-n" style={{ fontSize: 16 }}>{sub.name}</div><div className="stat-l">サブ才能</div></div>
      </div>
      <div className="info-box" style={{ marginBottom: 18 }}>{main.essence}</div>

      <p className="field-group-title">脳の使用傾向(測定値の詳細)</p>
      <div style={{ marginBottom: 18 }}>
        {RAW_KEYS.map((k) => {
          const v = member.raw[k];
          return (
            <div className="coverage-row" key={k}>
              <span className="cov-label">{RAW_LABELS[k]}</span>
              <div className="cov-track"><div className="cov-fill" style={{ width: `${v}%` }} /></div>
              <span className="cov-n">{v.toFixed(0)}%({rawBand(v)})</span>
            </div>
          );
        })}
        <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 6 }}>
          {RAW_KEYS.map((k) => `${RAW_LABELS[k]}：${RAW_DEFS[k]}`).join(" ")}
        </p>
      </div>

      <p className="field-group-title">どんな人か</p>
      <div className="info-box" style={{ marginBottom: 18 }}>{rawNarrative(member.raw, member.name)}</div>

      <p className="field-group-title">
        定着のために気をつけたいポイント
        <span
          className="chip"
          style={{ marginLeft: 8, background: careColor, color: "#fff", borderColor: careColor }}
        >
          注意レベル：{care.level}
        </span>
      </p>
      <div style={{ marginBottom: 8 }}>
        {retentionTips(member.raw).length > 0 ? (
          retentionTips(member.raw).map((t) => <p className="motiv-item" key={t}>・{t}</p>)
        ) : (
          <p className="motiv-item">各項目が標準的な範囲に収まっており、特に注意すべき偏りは見られません。</p>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 18 }}>
        ※この注意レベルは、測定値が高め・低めに偏っている項目の数をもとにした参考情報であり、離職や退職を予測するものではありません。人事評価や処遇の判断材料として単独で用いず、日々の対話の参考としてご活用ください。
      </p>

      {(showThinking || showSense) && (
        <>
          <p className="field-group-title">思考スタイル・感覚チャンネル</p>
          <div className="two-col" style={{ marginBottom: 18 }}>
            {showThinking && (
              <div>
                <p className="motiv-title" style={{ marginBottom: 8 }}>思考スタイル</p>
                {thinking.map((r, idx) => (
                  <div className="coverage-row" key={r.t.key}>
                    <span className="cov-label">{idx === 0 && "★ "}{r.t.name}</span>
                    <div className="cov-track"><div className="cov-fill" style={{ width: `${r.value}%` }} /></div>
                    <span className="cov-n">{r.value.toFixed(0)}%</span>
                  </div>
                ))}
                <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 6 }}>{thinking[0]?.t.def}</p>
              </div>
            )}
            {showSense && (
              <div>
                <p className="motiv-title" style={{ marginBottom: 8 }}>感覚チャンネル</p>
                {sense.map((r, idx) => (
                  <div className="coverage-row" key={r.t.key}>
                    <span className="cov-label">{idx === 0 && "★ "}{r.t.name}</span>
                    <div className="cov-track"><div className="cov-fill" style={{ width: `${r.value}%` }} /></div>
                    <span className="cov-n">{r.value.toFixed(0)}%</span>
                  </div>
                ))}
                <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 6 }}>{sense[0]?.t.def}</p>
              </div>
            )}
          </div>
        </>
      )}

      {insight && (
        <>
          <p className="field-group-title">統合分析：強み・適職とその理由</p>
          <div className="info-box" style={{ marginBottom: 8 }}>{insight.strength}</div>
          <div className="strength-grid" style={{ marginBottom: 18 }}>
            <div className="strength-card">
              <span className="strength-rank">強みの理由</span>
              <p className="comment" style={{ marginTop: 6 }}>{insight.reason}</p>
            </div>
            <div className="strength-card">
              <span className="strength-rank">適職</span>
              <p className="comment" style={{ marginTop: 6 }}>{insight.roleFit}</p>
            </div>
          </div>
        </>
      )}

      {comm && (
        <>
          <p className="field-group-title">コミュニケーションの取り方</p>
          <div className="two-col" style={{ marginBottom: 18 }}>
            <div className="motiv-box motiv-up">
              <p className="motiv-title">この人の特徴</p>
              {comm.traits.map((t) => <p className="motiv-item" key={t}>・{t}</p>)}
            </div>
            <div className="motiv-box motiv-up">
              <p className="motiv-title">接し方のヒント</p>
              {comm.advice.map((a) => <p className="motiv-item" key={a}>・{a}</p>)}
            </div>
          </div>
        </>
      )}

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

      <p className="field-group-title">信頼を育てる5つの要素</p>
      <div className="info-box" style={{ marginBottom: 10 }}>
        信頼関係は足し算ではなく掛け算で育ちます。5つの要素がすべて揃って初めて強い信頼になり、どれか1つが欠けると、他がどれだけ高くても信頼全体が弱くなってしまいます。
      </div>
      <div className="two-col" style={{ marginBottom: 8 }}>
        <div className="motiv-box motiv-up">
          <p className="motiv-title">信頼を育てる5要素</p>
          {TRUST_BUILDERS.map((b) => (
            <p className="motiv-item" key={b.label}>▲ <strong>{b.label}</strong> — {b.note}</p>
          ))}
        </div>
        <div className="motiv-box motiv-down">
          <p className="motiv-title">信頼を弱める2つの要因</p>
          {TRUST_ERODERS.map((e) => (
            <p className="motiv-item" key={e.label}>▼ <strong>{e.label}</strong> — {e.note}</p>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginBottom: 18 }}>
        5つの要素のうち、どれか1つでも欠けると信頼はゼロに近づきます。まずは1つだけでも意識して満たすことが、信頼構築の一番の近道です。
      </p>

      <p className="field-group-title">個人目標 × 会社目標 接続シート(1on1テンプレート)</p>
      <GoalSheetForm member={member} onSave={onSaveGoalSheet} />
    </div>
  );
}
