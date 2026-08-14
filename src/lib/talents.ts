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

export type ThinkingKey = "scrutiny" | "steady" | "coop" | "idea";
export type SenseKey = "visual" | "auditory" | "tactile";

export interface ExtraRawScores {
  scrutiny: number;
  steady: number;
  coop: number;
  idea: number;
  visual: number;
  auditory: number;
  tactile: number;
}

export const THINKING_KEYS: ThinkingKey[] = ["scrutiny", "steady", "coop", "idea"];
export const SENSE_KEYS: SenseKey[] = ["visual", "auditory", "tactile"];

export const DEFAULT_EXTRA_RAW: ExtraRawScores = {
  scrutiny: 0, steady: 0, coop: 0, idea: 0, visual: 0, auditory: 0, tactile: 0,
};

export interface ThinkingType {
  key: ThinkingKey;
  name: string;
  def: string;
}

export const THINKING_TYPES: ThinkingType[] = [
  { key: "scrutiny", name: "慎重型", def: "物事を丁寧に調べ、根拠や仕組みに納得してから動くタイプ。じっくり考える時間があるほど力を発揮します。" },
  { key: "steady", name: "堅実型", def: "決まった手順やルールを大切にし、リスクを避けながら着実に進めるタイプ。見通しが立つと安心して力を発揮します。" },
  { key: "coop", name: "協調型", def: "周囲との関係性を大切にし、人との一体感や評価の中でモチベーションが高まるタイプ。" },
  { key: "idea", name: "ひらめき型", def: "新しいものや変化に興味を持ち、発想力を活かして素早く判断するタイプ。好奇心が原動力になります。" },
];

export interface SenseType {
  key: SenseKey;
  name: string;
  def: string;
}

export const SENSE_TYPES: SenseType[] = [
  { key: "visual", name: "視覚型", def: "見る・読むことで理解が進むタイプ。図やグラフ、文字情報があると納得しやすくなります。" },
  { key: "auditory", name: "聴覚型", def: "聞く・話すことで理解が進むタイプ。説明を耳で聞いたり、声に出して確認すると定着しやすくなります。" },
  { key: "tactile", name: "体感型", def: "まず触れる・やってみることで理解が進むタイプ。実際に体を動かしながら覚えるのが得意です。" },
];

export function hasExtraData(keys: (ThinkingKey | SenseKey)[], raw: Partial<ExtraRawScores>): boolean {
  return keys.some((k) => Number(raw[k] ?? 0) > 0);
}

export function rankedThinking(raw: Partial<ExtraRawScores>) {
  return THINKING_TYPES
    .map((t) => ({ t, value: Number(raw[t.key] ?? 0) }))
    .sort((a, b) => b.value - a.value);
}

export function rankedSense(raw: Partial<ExtraRawScores>) {
  return SENSE_TYPES
    .map((t) => ({ t, value: Number(raw[t.key] ?? 0) }))
    .sort((a, b) => b.value - a.value);
}

export type TalentKey =
  | "logic" | "create" | "empathy" | "lead" | "intro" | "expr" | "space" | "body" | "order";

export interface TalentFactor {
  key: RawKey | "soloInv";
  label: string;
  weight: number;
}

export interface Compatibility {
  complement: TalentKey;
  complementNote: string;
  tension: TalentKey;
  tensionNote: string;
}

export interface Talent {
  key: TalentKey;
  name: string;
  def: string;
  essence: string;
  roles: string;
  factors: TalentFactor[];
  motivationUp: string[];
  motivationDown: string[];
  managerTips: string[];
  compatibility: Compatibility;
}

export const TALENTS: Talent[] = [
  {
    key: "logic", name: "論理力",
    def: "物事を筋道立てて分析し、根拠に基づいて合理的な結論を導き出す力。",
    essence: "筋道立てて考え、根拠から結論を導く人です。複雑な問題を整理し、確かな判断軸を組織にもたらします。",
    roles: "エンジニア・研究者・コンサルタント・経理財務・戦略立案",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.5 },
      { key: "wp", label: "WP優位傾向", weight: 0.3 },
      { key: "ec", label: "エモーションコントロール", weight: 0.2 },
    ],
    motivationUp: ["根拠に基づいて意思決定できる環境", "複雑な課題の分析を任される", "データや事実が重視される"],
    motivationDown: ["感覚や勢いだけで物事が決まる", "根拠を求めても聞き入れられない", "場当たり的な方針転換が続く"],
    managerTips: ["根拠やデータを扱う役割を任せる", "意思決定の理由を共有し納得感を持たせる", "分析・検証が必要な課題を渡す"],
    compatibility: {
      complement: "create", complementNote: "発想力の自由なアイデアを、論理力が現実的な形に整理する組み合わせです。",
      tension: "lead", tensionNote: "慎重に検証したい論理力と、スピード重視で決断するリーダー力はペースが合わないことがあります。",
    },
  },
  {
    key: "create", name: "発想力",
    def: "既存の枠にとらわれず、新しいアイデアや発想を生み出す力。",
    essence: "アイデアが尽きることなく湧き出る人です。前例のない発想で、周囲に新しい視点をもたらします。",
    roles: "企画職・デザイナー・アーティスト・商品開発・起業家",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.6 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.4 },
    ],
    motivationUp: ["自由な発想が歓迎される環境", "新しい企画に挑戦できる機会", "アイデアを否定されずまず受け止められる"],
    motivationDown: ["決まったやり方を強制される", "前例主義・変化のない繰り返し作業", "アイデアを頭ごなしに否定される"],
    managerTips: ["新しい企画やアイデア出しの機会を与える", "結果だけでなく発想の過程も評価する", "前例のないテーマに挑戦させる"],
    compatibility: {
      complement: "order", complementNote: "発想力の新しいアイデアを、継続力が最後までやり抜く粘り強さで支える組み合わせです。",
      tension: "logic", tensionNote: "スピード感のある発想力と、根拠を求める論理力は、初期のテンポが合わないことがあります。",
    },
  },
  {
    key: "empathy", name: "共感力",
    def: "相手の感情や立場を理解し、信頼関係を築く力。",
    essence: "相手の気持ちに寄り添い、信頼を築く人です。人と人をつなぎ、チームに安心感をもたらします。",
    roles: "営業・カウンセラー・人事・接客サービス・教育",
    factors: [
      { key: "ce", label: "CE優位傾向", weight: 0.4 },
      { key: "ofc", label: "OFC傾向", weight: 0.3 },
      { key: "soloInv", label: "協調性(Soloist逆数)", weight: 0.3 },
    ],
    motivationUp: ["人の役に立っていると実感できる", "信頼関係を築く時間がある", "チームの調和への貢献が評価される"],
    motivationDown: ["対立や衝突が絶えない環境", "成果だけで人間関係が軽視される", "孤立して働くことを求められる"],
    managerTips: ["人と関わる役割(窓口・相談役)を任せる", "チームの雰囲気づくりへの貢献を言語化して評価する", "一対一で話す時間を定期的に確保する"],
    compatibility: {
      complement: "lead", complementNote: "人を思う共感力と、前に進めるリーダー力が組み合わさると、無理のない推進力が生まれます。",
      tension: "logic", tensionNote: "感情面への配慮を求める共感力と、合理性を優先する論理力はすれ違いやすい組み合わせです。",
    },
  },
  {
    key: "lead", name: "リーダー力",
    def: "目標を定め、周囲を巻き込みながら物事を前に進める力。",
    essence: "目標に向けて周囲を巻き込み、前進させる人です。決断力と推進力で、組織に勢いをもたらします。",
    roles: "経営者・プロジェクトマネージャー・営業リーダー",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.5 },
      { key: "solo", label: "Soloist傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.2 },
    ],
    motivationUp: ["裁量を持って物事を進められる", "目標達成に向けて周囲を動かせる", "挑戦とスピードが評価される"],
    motivationDown: ["承認プロセスが多く決断できない", "指示待ちを求められる", "成果より過程ばかり管理される"],
    managerTips: ["裁量を持たせて任せる", "目標設定とその後の振り返りを一緒に行う", "小さなプロジェクトの責任者を経験させる"],
    compatibility: {
      complement: "empathy", complementNote: "推進力のあるリーダー力に、共感力の人への配慮が加わると、無理のない前進ができます。",
      tension: "intro", tensionNote: "スピードを求めるリーダー力と、じっくり考えたい探究力はテンポが合わないことがあります。",
    },
  },
  {
    key: "intro", name: "探究力",
    def: "物事の本質やなぜを深く掘り下げて考え続ける力。",
    essence: "物事の本質をとことん掘り下げる人です。深い洞察と専門性で、組織に確かな知見をもたらします。",
    roles: "研究者・ライター・編集者・専門職・カウンセラー",
    factors: [
      { key: "ec", label: "エモーションコントロール", weight: 0.5 },
      { key: "acc", label: "ACC傾向", weight: 0.3 },
      { key: "fd", label: "FD優位傾向", weight: 0.2 },
    ],
    motivationUp: ["じっくり考える時間が確保されている", "専門性を深められるテーマがある", "表面的でない議論ができる"],
    motivationDown: ["拙速な結論を求められる", "浅い理解のまま進めさせられる", "一人で考える時間が取れない"],
    managerTips: ["一つのテーマを深掘りする時間を確保する", "拙速な結論を求めず、じっくり検討させる", "専門性を発揮できる役割を用意する"],
    compatibility: {
      complement: "expr", complementNote: "探究力が深めた知見を、伝達力が分かりやすく発信する組み合わせです。",
      tension: "lead", tensionNote: "深く考えたい探究力と、スピードを求めるリーダー力はテンポが合わないことがあります。",
    },
  },
  {
    key: "expr", name: "伝達力",
    def: "言葉や文章、話し方などを通じて自分の考えや思いを人に伝える力。",
    essence: "考えや思いを言葉にして届ける人です。分かりやすい発信で、周囲の理解と共感を引き出します。",
    roles: "ライター・講師・広報PR・司会アナウンサー・営業",
    factors: [
      { key: "mpfc", label: "MPFC傾向", weight: 0.5 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
      { key: "wp", label: "WP優位傾向", weight: 0.2 },
    ],
    motivationUp: ["人前で話す・伝える機会がある", "自分の言葉で表現することが歓迎される", "発信した内容への反応がある"],
    motivationDown: ["発言の機会が少ない", "決まった伝え方を強制される", "発信しても反応や関心を示されない"],
    managerTips: ["人前で発表・説明する機会を与える", "発信した内容にきちんと反応・フィードバックする", "社内外への情報発信の役割を任せる"],
    compatibility: {
      complement: "intro", complementNote: "探究力が深めた知見を、伝達力が分かりやすく届ける組み合わせです。",
      tension: "body", tensionNote: "言葉で伝えたい伝達力と、まず動いて見せたい実践力はスタイルが異なることがあります。",
    },
  },
  {
    key: "space", name: "デザイン力",
    def: "形・色・空間・レイアウトなどを視覚的に捉え、構成する力。",
    essence: "形や空間を美しく構成する人です。視覚的な発想で、アイデアをかたちにする力を発揮します。",
    roles: "デザイナー・建築家・映像写真・インテリア・設計エンジニア",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.7 },
      { key: "fd", label: "FD優位傾向", weight: 0.3 },
    ],
    motivationUp: ["見た目や使いやすさにこだわれる", "アイデアを形にする裁量がある", "美意識やセンスが評価される"],
    motivationDown: ["機能・効率だけで判断される", "完成イメージを共有せず進められる", "表現の細部を軽視される"],
    managerTips: ["見た目や使いやすさを検討する工程に関わらせる", "完成イメージを共有した上で任せる", "表現やデザインへのこだわりを尊重する"],
    compatibility: {
      complement: "body", complementNote: "デザイン力が描いた形を、実践力が実際に作り上げる組み合わせです。",
      tension: "order", tensionNote: "新しい表現を求めるデザイン力と、決まった手順を守りたい継続力は方向性が異なることがあります。",
    },
  },
  {
    key: "body", name: "実践力",
    def: "体を動かし、手先や体感を通じて学び、実行する力。",
    essence: "頭で考えるより先に体が動く人です。実際にやってみることで学び、現場に実行力をもたらします。",
    roles: "スポーツ選手・職人・料理人・理学療法士・ダンサー",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.4 },
      { key: "ao", label: "AO優位傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
    ],
    motivationUp: ["実際に手を動かして学べる環境", "体を動かす・実技を伴う仕事", "すぐに試してフィードバックを得られる"],
    motivationDown: ["座学や書類作業ばかりが続く", "頭で考えるだけで実行に移せない", "じっと待たされる時間が長い"],
    managerTips: ["実際に手を動かす・試作する機会を与える", "座学より実践を通じた学びの場を用意する", "素早く試して素早く直すサイクルを許容する"],
    compatibility: {
      complement: "space", complementNote: "実践力の実行力に、デザイン力の形や美しさへの視点が加わる組み合わせです。",
      tension: "intro", tensionNote: "まず動きたい実践力と、じっくり考えたい探究力はペースが合わないことがあります。",
    },
  },
  {
    key: "order", name: "継続力",
    def: "計画的に物事を進め、地道な努力をコツコツと積み重ねる力。",
    essence: "計画的にコツコツと積み重ねる人です。地道な努力で、組織に安定と信頼をもたらします。",
    roles: "経理事務・品質管理・公務員・システム管理・伝統工芸",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.6 },
      { key: "ec", label: "エモーションコントロール", weight: 0.4 },
    ],
    motivationUp: ["計画的にコツコツ取り組める環境", "地道な努力が正しく評価される", "安定したルーティンがある"],
    motivationDown: ["頻繁な方針転換・場当たり的な変更", "努力の過程が評価されない", "秩序のない進め方を強いられる"],
    managerTips: ["計画立てて進める役割を任せる", "地道な積み重ねを定期的に評価・承認する", "急な方針転換を避け、見通しを示す"],
    compatibility: {
      complement: "create", complementNote: "安定した継続力に、発想力の新しいアイデアが刺激を与える組み合わせです。",
      tension: "lead", tensionNote: "スピードを求めるリーダー力と、着実に進めたい継続力はペースが合わないことがあります。",
    },
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
  { name: "けん引・推進タイプ", weights: { lead: 5, expr: 3, order: 3, empathy: 2, logic: 1, create: 1, intro: 1, space: 1, body: 1 } },
  { name: "発想・企画タイプ", weights: { create: 5, space: 3, expr: 2, lead: 2, logic: 1, empathy: 1, intro: 1, order: 1, body: 1 } },
  { name: "対人折衝タイプ", weights: { empathy: 5, expr: 4, order: 2, lead: 1, logic: 1, create: 1, intro: 1, space: 1, body: 1 } },
  { name: "堅実運用タイプ", weights: { order: 5, logic: 3, body: 3, intro: 1, empathy: 1, lead: 1, create: 1, expr: 1, space: 1 } },
  { name: "探究・専門タイプ", weights: { intro: 5, logic: 4, space: 2, order: 2, empathy: 1, lead: 1, create: 1, expr: 1, body: 1 } },
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
