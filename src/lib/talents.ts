export type RawKey = "wp" | "fd" | "ao" | "ce" | "ea" | "ec" | "acc" | "mpfc" | "ofc" | "solo";

export type RawScores = Record<RawKey, number>;

export const RAW_LABELS: Record<RawKey, string> = {
  wp: "WP優位脳",
  fd: "FD優位脳",
  ao: "AO優位脳",
  ce: "CE優位脳",
  ea: "エモーションアクティブ",
  ec: "エモーションコントロール",
  acc: "ACC傾向",
  mpfc: "MPFC傾向",
  ofc: "OFC傾向",
  solo: "Soloist傾向",
};

export const RAW_KEYS: RawKey[] = ["wp", "fd", "ao", "ce", "ea", "ec", "acc", "mpfc", "ofc", "solo"];

export const DEFAULT_RAW: RawScores = {
  wp: 40, fd: 35, ao: 45, ce: 30, ea: 50, ec: 60, acc: 35, mpfc: 70, ofc: 50, solo: 45,
};

export type TalentKey =
  | "logic" | "create" | "empathy" | "lead" | "intro" | "expr" | "space" | "body" | "order";

export interface TalentFactor {
  key: RawKey | "soloInv";
  label: string;
  weight: number;
}

export interface Talent {
  key: TalentKey;
  name: string;
  def: string;
  roles: string;
  factors: TalentFactor[];
}

export const TALENTS: Talent[] = [
  {
    key: "logic", name: "論理力",
    def: "物事を筋道立てて分析し、根拠に基づいて合理的な結論を導き出す力。",
    roles: "エンジニア・研究者・コンサルタント・経理財務・戦略立案",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.5 },
      { key: "wp", label: "WP優位傾向", weight: 0.3 },
      { key: "ec", label: "エモーションコントロール", weight: 0.2 },
    ],
  },
  {
    key: "create", name: "発想力",
    def: "既存の枠にとらわれず、新しいアイデアや発想を生み出す力。",
    roles: "企画職・デザイナー・アーティスト・商品開発・起業家",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.6 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.4 },
    ],
  },
  {
    key: "empathy", name: "共感力",
    def: "相手の感情や立場を理解し、信頼関係を築く力。",
    roles: "営業・カウンセラー・人事・接客サービス・教育",
    factors: [
      { key: "ce", label: "CE優位傾向", weight: 0.4 },
      { key: "ofc", label: "OFC傾向", weight: 0.3 },
      { key: "soloInv", label: "協調性(Soloist逆数)", weight: 0.3 },
    ],
  },
  {
    key: "lead", name: "リーダー力",
    def: "目標を定め、周囲を巻き込みながら物事を前に進める力。",
    roles: "経営者・プロジェクトマネージャー・営業リーダー",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.5 },
      { key: "solo", label: "Soloist傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.2 },
    ],
  },
  {
    key: "intro", name: "探究力",
    def: "物事の本質やなぜを深く掘り下げて考え続ける力。",
    roles: "研究者・ライター・編集者・専門職・カウンセラー",
    factors: [
      { key: "ec", label: "エモーションコントロール", weight: 0.5 },
      { key: "acc", label: "ACC傾向", weight: 0.3 },
      { key: "fd", label: "FD優位傾向", weight: 0.2 },
    ],
  },
  {
    key: "expr", name: "伝達力",
    def: "言葉や文章、話し方などを通じて自分の考えや思いを人に伝える力。",
    roles: "ライター・講師・広報PR・司会アナウンサー・営業",
    factors: [
      { key: "mpfc", label: "MPFC傾向", weight: 0.5 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
      { key: "wp", label: "WP優位傾向", weight: 0.2 },
    ],
  },
  {
    key: "space", name: "デザイン力",
    def: "形・色・空間・レイアウトなどを視覚的に捉え、構成する力。",
    roles: "デザイナー・建築家・映像写真・インテリア・設計エンジニア",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.7 },
      { key: "fd", label: "FD優位傾向", weight: 0.3 },
    ],
  },
  {
    key: "body", name: "実践力",
    def: "体を動かし、手先や体感を通じて学び、実行する力。",
    roles: "スポーツ選手・職人・料理人・理学療法士・ダンサー",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.4 },
      { key: "ao", label: "AO優位傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
    ],
  },
  {
    key: "order", name: "継続力",
    def: "計画的に物事を進め、地道な努力をコツコツと積み重ねる力。",
    roles: "経理事務・品質管理・公務員・システム管理・伝統工芸",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.6 },
      { key: "ec", label: "エモーションコントロール", weight: 0.4 },
    ],
  },
];

export const TALENT_BY_KEY: Record<TalentKey, Talent> = TALENTS.reduce((acc, t) => {
  acc[t.key] = t;
  return acc;
}, {} as Record<TalentKey, Talent>);

export const CHART_ORDER: TalentKey[] = ["logic", "create", "empathy", "lead", "intro", "expr", "space", "body", "order"];

export type TalentScores = Record<TalentKey, number>;

function clamp(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

export function sanitizeRaw(raw: Partial<RawScores>): RawScores {
  const out = {} as RawScores;
  RAW_KEYS.forEach((k) => { out[k] = clamp(Number(raw[k] ?? 0)); });
  return out;
}

export function computeScores(rawInput: Partial<RawScores>): TalentScores {
  const raw = sanitizeRaw(rawInput);
  const extended: Record<string, number> = { ...raw, soloInv: 100 - raw.solo };
  const scores = {} as TalentScores;
  TALENTS.forEach((t) => {
    let s = 0;
    t.factors.forEach((f) => { s += extended[f.key] * f.weight; });
    scores[t.key] = Math.round(s * 10) / 10;
  });
  return scores;
}

export function rankedOf(scores: TalentScores) {
  return TALENTS
    .map((t) => ({ t, score: scores[t.key] }))
    .sort((a, b) => b.score - a.score);
}

export function relNormalize(scores: TalentScores): Record<TalentKey, number> {
  const vals = CHART_ORDER.map((k) => scores[k]);
  const max = Math.max(...vals) || 1;
  const out = {} as Record<TalentKey, number>;
  CHART_ORDER.forEach((k) => { out[k] = (scores[k] / max) * 5; });
  return out;
}

export const ROLE_PRESETS: { name: string; weights: Record<TalentKey, number> }[] = [
  { name: "リーダー候補", weights: { lead: 5, expr: 3, order: 3, empathy: 2, logic: 1, create: 1, intro: 1, space: 1, body: 1 } },
  { name: "企画・新規事業", weights: { create: 5, space: 3, expr: 2, lead: 2, logic: 1, empathy: 1, intro: 1, order: 1, body: 1 } },
  { name: "顧客対応・CS", weights: { empathy: 5, expr: 4, order: 2, lead: 1, logic: 1, create: 1, intro: 1, space: 1, body: 1 } },
  { name: "品質管理・オペレーション", weights: { order: 5, logic: 3, body: 3, intro: 1, empathy: 1, lead: 1, create: 1, expr: 1, space: 1 } },
  { name: "研究・専門職", weights: { intro: 5, logic: 4, space: 2, order: 2, empathy: 1, lead: 1, create: 1, expr: 1, body: 1 } },
];

function descriptor(val: number): string {
  if (val >= 75) return "非常に高く";
  if (val >= 60) return "高く";
  if (val >= 45) return "やや高く";
  return "見られ";
}

export function commentFor(talent: Talent, rawInput: Partial<RawScores>): string {
  const raw = sanitizeRaw(rawInput);
  const extended: Record<string, number> = { ...raw, soloInv: 100 - raw.solo };
  const sorted = [...talent.factors].sort((a, b) => extended[b.key] - extended[a.key]);
  const top = sorted[0];
  const val = Math.round(extended[top.key]);
  return `${top.label}が${val}%と${descriptor(val)}、${talent.name}の背景要因になっていると考えられます。`;
}

export function fitScore(scores: TalentScores, weights: Record<TalentKey, number>): number {
  const totalWeight = TALENTS.reduce((s, t) => s + (weights[t.key] || 0), 0) || 1;
  const sum = TALENTS.reduce((s, t) => s + (weights[t.key] || 0) * scores[t.key], 0);
  return Math.max(0, Math.min(100, (sum / (totalWeight * 100)) * 100));
}

export function presetFits(scores: TalentScores): { name: string; fit: number }[] {
  return ROLE_PRESETS
    .map((p) => ({ name: p.name, fit: fitScore(scores, p.weights) }))
    .sort((a, b) => b.fit - a.fit);
}
