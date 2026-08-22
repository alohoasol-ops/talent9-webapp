"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FeedbackForm({ memberId, name }: { memberId: string; name?: string }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase
      .from("peer_feedback")
      .insert({ member_id: memberId, feedback_text: trimmed.slice(0, 2000) });
    setStatus(error ? "error" : "done");
  }

  const who = name ? `${name}さん` : "この方";

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        {status === "done" ? (
          <>
            <h1 className="font-display" style={{ fontSize: 20 }}>送信しました</h1>
            <p className="sub">ご協力ありがとうございました。</p>
          </>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: 20 }}>{who}へのフィードバック</h1>
            <p className="sub" style={{ textAlign: "left" }}>
              {who}の普段の様子について、感じていることを自由に書いてください。ここでの回答に記名は不要です。
            </p>
            <form onSubmit={handleSubmit}>
              <div className="name-field">
                <label htmlFor="feedback-text">フィードバック内容</label>
                <textarea
                  id="feedback-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  rows={7}
                  placeholder="例：会議で率直に意見を言ってくれるので助かっています。一方で…"
                  required
                />
              </div>
              {status === "error" && <p className="field-error">送信に失敗しました。時間をおいて再度お試しください。</p>}
              <div className="btn-row">
                <button
                  type="submit"
                  className="primary"
                  disabled={status === "sending" || !text.trim()}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {status === "sending" ? "送信中…" : "送信する"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
