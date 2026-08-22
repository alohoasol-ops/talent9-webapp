"use client";

import { useState } from "react";
import { rawNarrative } from "@/lib/talents";
import type { TeamMember } from "@/lib/types";

export default function JohariWindowSection({
  member,
  onSave,
}: {
  member: TeamMember;
  onSave?: (id: string, fields: { selfPerception: string; johariOpenNote: string }) => Promise<void> | void;
}) {
  const [selfPerception, setSelfPerception] = useState(member.selfPerception);
  const [johariOpenNote, setJohariOpenNote] = useState(member.johariOpenNote);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copied, setCopied] = useState(false);

  const unknownText = rawNarrative(member.raw, member.name);

  async function handleSave() {
    if (!onSave) return;
    setStatus("saving");
    await onSave(member.id, { selfPerception, johariOpenNote });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }

  function handleCopyLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/feedback/${member.id}?name=${encodeURIComponent(member.name || "")}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <p className="field-group-title">ジョハリの窓</p>
      <p className="fit-note">
        自己認識(本人が語ること)と、周囲からのフィードバックを組み合わせて、4つの窓に整理します。「開放の窓」は本人と周囲、両方の内容を読んだ上で共通点があれば書き足してください。
      </p>

      <div className="johari-grid">
        <div className="johari-cell">
          <h4>開放の窓(自分も周囲も知っている)</h4>
          <p className="johari-sub">本人の話と周囲の声を見比べて、共通する点があれば書き足してください(手動で編集する欄です)</p>
          <textarea
            value={johariOpenNote}
            onChange={(e) => setJohariOpenNote(e.target.value)}
            readOnly={!onSave}
            rows={4}
            placeholder="例：発言が率直で、周囲も本人もそれを強みだと感じている"
            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", background: "var(--surface)", color: "var(--ink)", font: "inherit", resize: "vertical" }}
          />
        </div>

        <div className="johari-cell">
          <h4>盲点の窓(周囲は知っているが本人は気づいていないかも)</h4>
          <p className="johari-sub">フィードバックリンクから届いた、周囲からの声です</p>
          {member.peerFeedback.length > 0 ? (
            member.peerFeedback.map((f) => (
              <p className="johari-feedback-item" key={f.id}>{f.feedbackText}</p>
            ))
          ) : (
            <p className="johari-sub" style={{ marginBottom: 0 }}>まだフィードバックが届いていません。下のリンクを共有してみてください。</p>
          )}
        </div>

        <div className="johari-cell">
          <h4>秘密の窓(本人は知っているが周囲には見せていないかも)</h4>
          <p className="johari-sub">本人が自分自身についてどう思っているか、自由に書いてもらう欄です</p>
          <textarea
            value={selfPerception}
            onChange={(e) => setSelfPerception(e.target.value)}
            readOnly={!onSave}
            rows={4}
            placeholder="例：人前で話すのは実は苦手だと感じている"
            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", background: "var(--surface)", color: "var(--ink)", font: "inherit", resize: "vertical" }}
          />
        </div>

        <div className="johari-cell">
          <h4>未知の窓(本人も周囲も気づいていないかも)</h4>
          <p className="johari-sub">脳の使用傾向の測定データから見える、意識されにくい特徴です</p>
          <p style={{ fontSize: 13, margin: 0 }}>{unknownText}</p>
        </div>
      </div>

      {onSave && (
        <div className="btn-row" style={{ marginBottom: 14 }}>
          <button type="button" className="primary" onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "保存中…" : status === "saved" ? "保存しました" : "自己認識・開放の窓を保存する"}
          </button>
        </div>
      )}

      {onSave && (
        <div className="johari-cell" style={{ marginBottom: 18 }}>
          <h4 style={{ marginBottom: 8 }}>フィードバック依頼リンク</h4>
          <p className="johari-sub">このリンクを同僚や上司に共有すると、ログインなしで「盲点の窓」にフィードバックを送ってもらえます</p>
          <div className="btn-row">
            <button type="button" onClick={handleCopyLink}>
              {copied ? "コピーしました" : "リンクをコピー"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
