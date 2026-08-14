"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_RAW, DEFAULT_EXTRA_RAW, THINKING_TYPES, SENSE_TYPES,
  type RawKey, type RawScores, type ExtraRawScores,
} from "@/lib/talents";
import { extractFromPdf, extractThinkingFromPdf, extractSenseFromPdf } from "@/lib/pdfExtract";
import type { TeamMember } from "@/lib/types";

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
  editingMember,
  onUpdate,
  onCancelEdit,
}: {
  onAdd: (input: { name: string; date: string; raw: RawScores & Partial<ExtraRawScores> }) => Promise<void> | void;
  pending?: boolean;
  editingMember?: TeamMember | null;
  onUpdate?: (id: string, input: { name: string; date: string; raw: RawScores & Partial<ExtraRawScores> }) => Promise<void> | void;
  onCancelEdit?: () => void;
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

  useEffect(() => {
    if (!editingMember) return;
    setName(editingMember.name || "");
    setDate(editingMember.measuredDate || "");
    setRaw({ ...DEFAULT_RAW, ...editingMember.raw });
    setExtraRaw({ ...DEFAULT_EXTRA_RAW, ...editingMember.raw });
    setManualOpen(true);
    setStatus(null);
    setThinkingStatus(null);
    setSenseStatus(null);
  }, [editingMember]);

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
    if (editingMember && onUpdate) {
      await on
