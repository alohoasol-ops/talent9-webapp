"use client";

import { useRef, useState } from "react";
import {
  DEFAULT_RAW, DEFAULT_EXTRA_RAW, THINKING_TYPES, SENSE_TYPES,
  type RawKey, type RawScores, type ExtraRawScores,
} from "@/lib/talents";
import { extractFromPdf, extractThinkingFromPdf, extractSenseFromPdf } from "@/lib/pdfExtract";

const FIELD_GROUPS: { title: string; keys: RawKey[] }[] = [
  { title: "パーソナルブレインスコア", keys: ["wp", "fd", "ao", "ce"] },
  { title: "エモーションスコア", keys: ["ea", "ec"] },
  { title: "リレーションシップブレイン", keys: ["acc", "mpfc", "ofc", "solo"] },
];

const FIELD_LABELS: Record<RawKey, string> = {
  wp: "WP優位脳", fd: "FD優位脳", ao: "AO優位脳", ce: "CE優位脳",
  ea: "エモーションアクティブ", ec: "エモーションコントロール",
  acc: "ACC傾向", mpfc: "MPFC傾向", ofc: "OFC傾向", solo: "Soloist傾向",
};

export default function AddMemberPanel({
  onAdd,
  pending,
}: {
  onAdd: (input: { name: string; date: string; raw: RawScores & Partial<ExtraRawScores> }) => Promise<void> | void;
  pending?: boolean;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [raw, setRaw] = useState<RawScores>({ ...DEFAULT_RAW });
  const [extraRaw, setExtraRaw] = useState<ExtraRawScores>({ ...DEFAULT_EXTRA_RAW });
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string; meta?: string } | null>(null);
  const [thinkingStatus, setThinkingStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [senseStatus, setSenseStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setName("");
    setDate("");
    setRaw({ ...DEFAULT_RAW });
    setExtraRaw({ ...DEFAULT_EXTRA_RAW });
    setThinkingStatus(null);
    setSenseStatus(null);
  }

  async function handleThinkingFile(file: File | undefined | null) {
    if (!file) return;
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setThinkingStatus({ kind: "err", text: "PDFファイルを選択してください。" });
      return;
    }
    setThinkingStatus({ kind: "ok", text: "PDFを解析しています…" });
    try {
      const result = await extractThinkingFromPdf(file);
      if (result.missing.length > 2) {
        setThinkingStatus({
          kind: "err",
          text: "このPDFから数値を読み取れませんでした。「池川チームロールアセスメント」の結果シートと異なる形式の可能性があります。数値を直接入力してください。",
        });
        return;
      }
      setExtraRaw((prev) => ({ ...prev, ...result.values }));
      setThinkingStatus({ kind: "ok", text: "読み込み完了。下の数値を確認してください。" });
    } catch (err) {
      console.error(err);
      setThinkingStatus({ kind: "err", text: "PDFの解析に失敗しました。数値を直接入力してください。" });
    }
  }

  async function handleSenseFile(file: File | undefined | null) {
    if (!file) return;
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setSenseStatus({ kind: "err", text: "PDFファイルを選択してください。" });
      return;
    }
    setSenseStatus({ kind: "ok", text: "PDFを解析しています…" });
    try {
      const result = await extractSenseFromPdf(file);
      if (result.missing.length > 1) {
        setSenseStatus({
          kind: "err",
          text: "このPDFから数値を読み取れませんでした。「池川センスチャネルアセスメント」の結果シートと異なる形式の可能性があります。数値を直接入力してください。",
        });
        return;
      }
      setExtraRaw((prev) => ({ ...prev, ...result.values }));
      setSenseStatus({ kind: "ok", text: "読み込み完了。下の数値を確認してください。" });
    } catch (err) {
      console.error(err);
      setSenseStatus({ kind: "err", text: "PDFの解析に失敗しました。数値を直接入力してください。" });
    }
  }

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setStatus({ kind: "err", text: "PDFファイルを選択してください。" });
      return;
    }
    setStatus({ kind: "ok", text: "PDFを解析しています…" });
    try {
      const result = await extractFromPdf(file);
      if (result.missing.length > 5) {
        setStatus({
          kind: "err",
          text: "このPDFから測定値を読み取れませんでした。「池川ブレインアセスメント(一般成人用)」の結果シート1ページ目と異なる形式の可能性があります。下の「手動で入力・修正する」から数値を直接入力してください。",
        });
        setManualOpen(true);
        return;
      }
      setRaw((prev) => ({ ...prev, ...result.values }));
      if (result.name) setName(result.name);
      if (result.date) setDate(result.date);
      setManualOpen(true);

      const metaParts: string[] = [];
      if (result.name) metaParts.push(`対象者：${result.name}`);
      if (result.date) metaParts.push(`測定日：${result.date}`);
      if (result.missing.length) metaParts.push(`未検出項目(0として計算)：${result.missing.join(", ")}`);

      setStatus({
        kind: "ok",
        text: "読み込み完了。内容を確認し「＋ チームに追加」を押してください。",
        meta: metaParts.join("　"),
      });
    } catch (err) {
      console.error(err);
      setStatus({
        kind: "err",
        text: "PDFの解析に失敗しました。ファイルが破損していないかご確認のうえ、下の「手動で入力・修正する」から数値を直接入力してください。",
      });
      setManualOpen(true);
    }
  }

  async function handleAdd() {
    await onAdd({ name, date, raw: { ...raw, ...extraRaw } });
    resetForm();
    setStatus(null);
  }

  return (
    <div className="panel no-print">
      <h2><span className="n">01</span>　メンバーを追加</h2>
      <p className="panel-sub">結果PDFを1人分ずつ取り込み、内容を確認してからチームに追加してください。</p>

      <div className="two-col">
        <div>
          <label
            className={`dropzone${dragging ? " drag" : ""}`}
            onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
            </svg>
            <div className="dz-title">結果シートPDFをドラッグ&amp;ドロップ</div>
            <div className="dz-sub">またはクリックしてファイルを選択</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0])}
              style={{ display: "none" }}
            />
          </label>
          {status && (
            <div className={`status-box ${status.kind}`}>
              {status.text}
              {status.meta && <div className="meta">{status.meta}</div>}
            </div>
          )}
          <button type="button" className="manual-toggle-btn" onClick={() => setManualOpen((v) => !v)} style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "var(--ink-dim)", textDecoration: "underline", cursor: "pointer" }}>
            {manualOpen ? "入力フォームを閉じる ▴" : "数値を手動で入力・修正する ▾"}
          </button>
        </div>

        {manualOpen && (
          <div>
            <div className="name-row">
              <div className="name-field">
                <label htmlFor="m-name">氏名</label>
                <input id="m-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：山田 太郎" />
              </div>
              <div className="name-field">
                <label htmlFor="m-date">測定日</label>
                <input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            {FIELD_GROUPS.map((g) => (
              <div className="field-group" key={g.title}>
                <p className="field-group-title">{g.title}</p>
                {g.keys.map((k) => (
                  <div className="field-row" key={k}>
                    <label htmlFor={`m-${k}`}>{FIELD_LABELS[k]}</label>
                    <div className="input-wrap">
                      <input
                        id={`m-${k}`}
                        type="number"
                        min={0}
                        max={100}
                        value={raw[k]}
                        onChange={(e) => setRaw((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                      />
                      <span className="pct">%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="field-group">
              <p className="field-group-title">思考タイプ(任意・合計100%目安)</p>
              <label className="btn" style={{ display: "inline-block", marginBottom: 10, fontSize: 12.5, cursor: "pointer" }}>
                池川チームロールアセスメントの結果PDFを読み込む
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleThinkingFile(e.target.files?.[0])}
                  style={{ display: "none" }}
                />
              </label>
