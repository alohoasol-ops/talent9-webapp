"use client";

import type { RawKey, ThinkingKey, SenseKey } from "./talents";

// 池川ブレインアセスメント(一般成人用)結果シート 1ページ目の固定レイアウト座標。
// ラベル文字が画像として描画されておりテキスト抽出できないため、数値の座標位置で判定する。
const PDF_ZONES: { key: RawKey; yMin: number; yMax: number; xMin: number; xMax: number }[] = [
  { key: "wp", yMin: 470, yMax: 490, xMin: 180, xMax: 290 },
  { key: "ao", yMin: 470, yMax: 490, xMin: 450, xMax: 560 },
  { key: "fd", yMin: 420, yMax: 442, xMin: 180, xMax: 290 },
  { key: "ce", yMin: 420, yMax: 442, xMin: 450, xMax: 560 },
  { key: "ea", yMin: 278, yMax: 298, xMin: 20, xMax: 130 },
  { key: "ec", yMin: 278, yMax: 298, xMin: 290, xMax: 400 },
  { key: "acc", yMin: 182, yMax: 203, xMin: 150, xMax: 260 },
  { key: "mpfc", yMin: 142, yMax: 163, xMin: 150, xMax: 260 },
  { key: "ofc", yMin: 102, yMax: 123, xMin: 150, xMax: 260 },
  { key: "solo", yMin: 63, yMax: 84, xMin: 150, xMax: 260 },
];

// 池川チームロールアセスメント(一般成人用)結果シートの固定レイアウト座標。
// こちらもラベル文字が画像として描画されておりテキスト抽出できないため、数値の座標位置で判定する。
const THINKING_ZONES: { key: ThinkingKey; yMin: number; yMax: number; xMin: number; xMax: number }[] = [
  { key: "scrutiny", yMin: 220, yMax: 270, xMin: 400, xMax: 560 }, // 分析型(上)
  { key: "steady", yMin: 45, yMax: 95, xMin: 400, xMax: 560 }, // 構造型(下)
  { key: "coop", yMin: 105, yMax: 155, xMin: 260, xMax: 390 }, // 社交型(左)
  { key: "idea", yMin: 105, yMax: 155, xMin: 460, xMax: 590 }, // コンセプト型(右)
];

// 池川センスチャネルアセスメント(一般成人用)結果シートの固定レイアウト座標。
const SENSE_ZONES: { key: SenseKey; yMin: number; yMax: number; xMin: number; xMax: number }[] = [
  { key: "visual", yMin: 330, yMax: 385, xMin: 440, xMax: 580 }, // 視覚優先脳(上)
  { key: "auditory", yMin: 155, yMax: 210, xMin: 280, xMax: 420 }, // 聴覚優先脳(左下)
  { key: "tactile", yMin: 155, yMax: 210, xMin: 460, xMax: 590 }, // 皮膚感覚優先脳(右下)
];

export interface PdfExtractResult {
  values: Partial<Record<RawKey, number>>;
  missing: RawKey[];
  name: string;
  date: string;
}

export interface ThinkingExtractResult {
  values: Partial<Record<ThinkingKey, number>>;
  missing: ThinkingKey[];
  name: string;
  date: string;
}

export interface SenseExtractResult {
  values: Partial<Record<SenseKey, number>>;
  missing: SenseKey[];
  name: string;
  date: string;
}

interface TextItemLike {
  str: string;
  transform: number[];
}

interface ZoneLike {
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
}

function extractZoneValue(items: TextItemLike[], zone: ZoneLike): number | null {
  const candidates = items.filter((it) => {
    const s = it.str.trim();
    if (!/^\d{1,3}$/.test(s)) return false;
    const x = it.transform[4];
    const y = it.transform[5];
    return x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax;
  });
  if (candidates.length === 0) return null;
  const n = parseInt(candidates[0].str.trim(), 10);
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

function extractMeta(items: TextItemLike[]): { name: string; date: string } {
  let name = "";
  let date = "";
  items.forEach((it) => {
    const s = it.str.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) date = s;
    else if (/^[ぁ-んァ-ヶ一-龠]+[\s　]+[ぁ-んァ-ヶ一-龠]+$/.test(s) && s.length <= 12) name = s;
  });
  return { name, date };
}

async function getPageTextItems(file: File): Promise<TextItemLike[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  return content.items as unknown as TextItemLike[];
}

export async function extractFromPdf(file: File): Promise<PdfExtractResult> {
  const items = await getPageTextItems(file);

  const values: Partial<Record<RawKey, number>> = {};
  const missing: RawKey[] = [];
  PDF_ZONES.forEach((z) => {
    const v = extractZoneValue(items, z);
    if (v === null) missing.push(z.key);
    else values[z.key] = v;
  });

  const meta = extractMeta(items);
  return { values, missing, name: meta.name, date: meta.date };
}

export async function extractThinkingFromPdf(file: File): Promise<ThinkingExtractResult> {
  const items = await getPageTextItems(file);

  const values: Partial<Record<ThinkingKey, number>> = {};
  const missing: ThinkingKey[] = [];
  THINKING_ZONES.forEach((z) => {
    const v = extractZoneValue(items, z);
    if (v === null) missing.push(z.key);
    else values[z.key] = v;
  });

  const meta = extractMeta(items);
  return { values, missing, name: meta.name, date: meta.date };
}

export async function extractSenseFromPdf(file: File): Promise<SenseExtractResult> {
  const items = await getPageTextItems(file);

  const values: Partial<Record<SenseKey, number>> = {};
  const missing: SenseKey[] = [];
  SENSE_ZONES.forEach((z) => {
    const v = extractZoneValue(items, z);
    if (v === null) missing.push(z.key);
    else values[z.key] = v;
  });

  const meta = extractMeta(items);
  return { values, missing, name: meta.name, date: meta.date };
}
