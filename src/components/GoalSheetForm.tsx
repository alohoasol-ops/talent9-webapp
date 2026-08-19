"use client";

import { useState } from "react";
import { rankedOf } from "@/lib/talents";
import { DEFAULT_GOAL_SHEET, type GoalSheet, type TeamMember } from "@/lib/types";

export default function GoalSheetForm({
  member,
  onSave,
}: {
  member: TeamMember;
  onSave?: (id: string, sheet: GoalSheet) => Promise<void> | void;
}) {
  const ranked = rankedOf(member.scores);
  const main = ranked[0].t;
  const sub = ranked[1].t;
  const [sheet, setSheet] = useState<GoalSheet>({ ...DEFAULT_GOAL_SHEET, ...member.goalSheet });
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof GoalSheet, value: string) {
    setSheet((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setPending(true);
    await onSave?.(member.id, sheet);
    setPending(false);
    setSaved(true);
  }

  return (
    <div>
      <div className="scroll-x">
        <table className="data goal-sheet">
          <thead>
            <tr><th>項目</th><th>個人({member.name || "本人"})</th><th>会社・チーム</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>才能・強み</td>
              <td>{main.name}({sub.name})</td>
              <td>
                <input className="goal-input" value={sheet.strengthCompany} onChange={(e) => set("strengthCompany", e.target.value)} placeholder="会社・チームとしての捉え方" />
              </td>
            </tr>
            <tr>
              <td>最も輝ける役割</td>
              <td>{main.roles}</td>
              <td>
                <input className="goal-input" value={sheet.roleCompany} onChange={(e) => set("roleCompany", e.target.value)} placeholder="会社・チームとしての捉え方" />
              </td>
            </tr>
            <tr>
              <td>モチベーション源泉</td>
              <td>{main.motivationUp.slice(0, 2).join("／")}</td>
              <td>
                <input className="goal-input" value={sheet.motivationCompany} onChange={(e) => set("motivationCompany", e.target.value)} placeholder="会社・チームとしての捉え方" />
              </td>
            </tr>
            <tr>
              <td>3ヶ月の目標</td>
              <td>
                <input className="goal-input" value={sheet.threeMonthPersonal} onChange={(e) => set("threeMonthPersonal", e.target.value)} placeholder="入力してください" />
              </td>
              <td>
                <input className="goal-input" value={sheet.threeMonthCompany} onChange={(e) => set("threeMonthCompany", e.target.value)} placeholder="入力してください" />
              </td>
            </tr>
            <tr>
              <td>1年後のありたい姿</td>
              <td>
                <input className="goal-input" value={sheet.oneYearPersonal} onChange={(e) => set("oneYearPersonal", e.target.value)} placeholder="入力してください" />
              </td>
              <td>
                <input className="goal-input" value={sheet.oneYearCompany} onChange={(e) => set("oneYearCompany", e.target.value)} placeholder="入力してください" />
              </td>
            </tr>
            <tr>
              <td>目標一致のためのアクション</td>
              <td>
                <input className="goal-input" value={sheet.actionPersonal} onChange={(e) => set("actionPersonal", e.target.value)} placeholder="入力してください" />
              </td>
              <td>
                <input className="goal-input" value={sheet.actionCompany} onChange={(e) => set("actionCompany", e.target.value)} placeholder="入力してください" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="btn-row no-print" style={{ marginTop: 10 }}>
        <button type="button" className="primary" onClick={handleSave} disabled={pending}>
          {pending ? "保存中…" : "保存する"}
        </button>
        {saved && <span style={{ fontSize: 12.5, color: "var(--ink-dim)", alignSelf: "center" }}>保存しました</span>}
      </div>
    </div>
  );
}
