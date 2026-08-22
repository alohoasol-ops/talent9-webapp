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

export const RAW_DEFS: Record<RawKey, string> = {
  wp: "他者の気持ちや意図を想像しながら関わる傾向。",
  fd: "集中して深く考え、計画的に取り組む傾向。",
  ao: "新しい刺激や変化に反応し、行動を広げる傾向。",
  ce: "周囲の感情の動きを敏感に察知する傾向。",
  ea: "感情や意欲が行動として表に出やすい度合い。",
  ec: "感情を目的に合わせて調整する度合い。",
  acc: "対人関係の中でリスクや緊張を察知する感度。",
  mpfc: "周囲からどう見られているかを意識する度合い。",
  ofc: "周りの感情の影響を受けやすい度合い。",
  solo: "自分のペースで物事を進めたい度合い。",
};

export function rawBand(value: number): string {
  if (value >= 65) return "高め";
  if (value >= 40) return "標準";
  return "低め";
}

export const RAW_CARE: Record<RawKey, { high: string; low: string }> = {
  wp: {
    high: "人間関係の変化に敏感なため、周囲との関係性が安定していることが安心につながります。",
    low: "対人関係よりも成果や仕組みを重視するため、成果が正しく評価される環境が力になります。",
  },
  fd: {
    high: "見通しの立たない状況が続くとストレスになりやすいため、方針や計画を早めに共有すると安心です。",
    low: "細かい計画より柔軟な進め方が合うため、過度に手順を固定しすぎない方が力を発揮しやすいです。",
  },
  ao: {
    high: "変化や刺激が少ない環境が続くと物足りなさを感じやすいため、新しい挑戦の機会が力になります。",
    low: "急な変化が続くと負担になりやすいため、ペースを保てる環境が安心につながります。",
  },
  ce: {
    high: "周囲の緊張や不満を敏感に感じ取るため、チームの雰囲気が悪化すると影響を受けやすいです。",
    low: "周囲の感情の変化に気づきにくい面があるため、率直なフィードバックを心がけると助けになります。",
  },
  ea: {
    high: "感情が行動に出やすいため、気持ちを言葉にできる場があると安定しやすいです。",
    low: "気持ちを内に溜め込みやすいため、定期的に本音を聞く機会を作ると安心です。",
  },
  ec: {
    high: "感情のコントロールが得意な分、無理をしていても気づかれにくいことがあるため、意識的に声をかけると安心です。",
    low: "感情に振り回されやすい面があるため、落ち着いて話せる時間を確保すると力になります。",
  },
  acc: {
    high: "対人関係の変化に敏感なため、異動や体制変更の際は特に丁寧なフォローが安心につながります。",
    low: "対人関係のリスクにあまり動じないため、率直なコミュニケーションが合いやすいです。",
  },
  mpfc: {
    high: "周囲からの評価を気にしやすいため、こまめに評価やフィードバックを伝えると安心につながります。",
    low: "周囲の評価をあまり気にしないため、必要な時だけ簡潔にフィードバックする方が合っています。",
  },
  ofc: {
    high: "周囲の感情に影響されやすいため、チーム内の雰囲気づくりが特に重要です。",
    low: "周囲の感情に左右されにくいため、落ち着いて自分のペースを保ちやすいタイプです。",
  },
  solo: {
    high: "自分のペースを大事にするため、裁量を持たせることが力を発揮する鍵になります。",
    low: "周囲と歩調を合わせることを大事にするため、孤立させずチームの一員としての関わりが安心につながります。",
  },
};

export function retentionTips(raw: RawScores): string[] {
  const tips: string[] = [];
  RAW_KEYS.forEach((k) => {
    const v = raw[k];
    if (v >= 65) tips.push(RAW_CARE[k].high);
    else if (v < 40) tips.push(RAW_CARE[k].low);
  });
  return tips;
}

export type CareLevel = "低" | "中" | "高";

export function careLevel(raw: RawScores): { level: CareLevel; count: number } {
  const count = retentionTips(raw).length;
  const level: CareLevel = count >= 4 ? "高" : count >= 2 ? "中" : "低";
  return { level, count };
}

export const RAW_TRAITS: Record<RawKey, { high: string; low: string }> = {
  wp: { high: "人の気持ちを汲み取りながら関わる", low: "人間関係よりも結果や仕組みを重視する" },
  fd: { high: "じっくり考えて計画的に進める", low: "細かい計画より、その場の流れで柔軟に動く" },
  ao: { high: "新しいことに刺激を感じ、行動の幅を広げる", low: "変化よりも慣れたペースを好む" },
  ce: { high: "周りの空気や感情の変化によく気づく", low: "周りの空気にはあまり左右されない" },
  ea: { high: "気持ちがそのまま行動や表情に出やすい", low: "気持ちを内に秘めやすい" },
  ec: { high: "感情をうまくコントロールできる", low: "感情が動くとそのまま表に出やすい" },
  acc: { high: "人間関係の変化に敏感な", low: "人間関係のリスクにはあまり動じない" },
  mpfc: { high: "周りからどう見られているかを気にする", low: "周りの評価をあまり気にしない" },
  ofc: { high: "周りの感情に影響を受けやすい", low: "周りの感情にあまり左右されない" },
  solo: { high: "自分のペースを大事にする", low: "周りと歩調を合わせることを大事にする" },
};

export function rawNarrative(raw: RawScores, name?: string): string {
  const highs = [...RAW_KEYS].filter((k) => raw[k] >= 65).sort((a, b) => raw[b] - raw[a]).slice(0, 2);
  const lows = [...RAW_KEYS].filter((k) => raw[k] < 40).sort((a, b) => raw[a] - raw[b]).slice(0, 2);
  const who = name ? `${name}さん` : "この方";
  let text = "";
  if (highs.length) {
    text += `${who}は、${highs.map((k) => RAW_TRAITS[k].high).join("、")}人です。`;
  } else {
    text += `${who}は、特定の傾向に偏りが少なく、バランスの取れた人です。`;
  }
  if (lows.length) {
    text += `一方で、${lows.map((k) => RAW_TRAITS[k].low).join("、")}一面もあります。`;
  }
  return text;
}

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
  workHint: string;
  commTrait: string;
  commAdvice: string;
}

export const THINKING_TYPES: ThinkingType[] = [
  {
    key: "scrutiny", name: "慎重型", def: "物事を丁寧に調べ、根拠や仕組みに納得してから動くタイプ。じっくり考える時間があるほど力を発揮します。", workHint: "根拠やデータを確認しながら進める",
    commTrait: "根拠が明確でないと納得しにくく、勢いだけの提案には慎重になりやすい",
    commAdvice: "結論だけでなく、理由やデータも一緒に伝えると納得を得やすくなります",
  },
  {
    key: "steady", name: "堅実型", def: "決まった手順やルールを大切にし、リスクを避けながら着実に進めるタイプ。見通しが立つと安心して力を発揮します。", workHint: "手順やルールが明確な中で着実に進める",
    commTrait: "急な変更や曖昧な指示には不安を感じやすい",
    commAdvice: "変更がある場合は、事前に見通しを伝えておくと安心して受け止めてもらえます",
  },
  {
    key: "coop", name: "協調型", def: "周囲との関係性を大切にし、人との一体感や評価の中でモチベーションが高まるタイプ。", workHint: "人との関わりやチームプレーを大切にする",
    commTrait: "一方的な指示よりも、対話や相談の形を好む",
    commAdvice: "指示するより、一緒に相談する形で話しかけると受け入れられやすくなります",
  },
  {
    key: "idea", name: "ひらめき型", def: "新しいものや変化に興味を持ち、発想力を活かして素早く判断するタイプ。好奇心が原動力になります。", workHint: "変化や新しい挑戦を取り入れながら進める",
    commTrait: "細かい手順の説明より、全体像や目的から入る方が理解しやすい",
    commAdvice: "詳細から入るのではなく、まず全体像や狙いを伝えると話が伝わりやすくなります",
  },
];

export interface SenseType {
  key: SenseKey;
  name: string;
  def: string;
  workHint: string;
  commTrait: string;
  commAdvice: string;
}

export const SENSE_TYPES: SenseType[] = [
  {
    key: "visual", name: "視覚型", def: "見る・読むことで理解が進むタイプ。図やグラフ、文字情報があると納得しやすくなります。", workHint: "資料や図を見ながら理解を深める",
    commTrait: "言葉だけの説明より、資料や文字で見せてもらう方が理解しやすい",
    commAdvice: "口頭だけで伝えず、資料やメモ、図を用意して伝えると伝わりやすくなります",
  },
  {
    key: "auditory", name: "聴覚型", def: "聞く・話すことで理解が進むタイプ。説明を耳で聞いたり、声に出して確認すると定着しやすくなります。", workHint: "会話や説明を通じて理解を深める",
    commTrait: "資料を読むよりも、口頭で説明してもらう方が理解しやすい",
    commAdvice: "文書だけで済まさず、直接話す時間を取って説明すると伝わりやすくなります",
  },
  {
    key: "tactile", name: "体感型", def: "まず触れる・やってみることで理解が進むタイプ。実際に体を動かしながら覚えるのが得意です。", workHint: "実際に手を動かしながら理解を深める",
    commTrait: "説明を聞くよりも、実際にやってみながら理解する",
    commAdvice: "説明だけで終わらせず、実際に試させながら伝えると理解が深まります",
  },
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

export function communicationInsight(thinking: ThinkingType, sense: SenseType): { traits: string[]; advice: string[] } {
  return {
    traits: [thinking.commTrait, sense.commTrait],
    advice: [thinking.commAdvice, sense.commAdvice],
  };
}

export function combinedInsight(talent: Talent, thinking: ThinkingType, sense: SenseType): { strength: string; reason: string; roleFit: string } {
  return {
    strength: `${talent.name}を軸に、${thinking.name}と${sense.name}の傾向を併せ持つタイプです。`,
    reason: `${talent.def} これに加えて、${thinking.workHint}という思考の特徴と、${sense.workHint}という情報の受け取り方が組み合わさることで、単に${talent.name}が高いだけでなく、実務の進め方にも一貫した強みが表れます。`,
    roleFit: `${talent.roles}といった職種の中でも、特に${thinking.workHint}かつ${sense.workHint}ような環境・役割で力を発揮しやすいと考えられます。`,
  };
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
  goodFit: string;
  poorFit: string;
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
    roles: "エンジニア・研究者・コンサルタント・経理財務・戦略立案・データアナリスト・監査・法務・品質保証・アクチュアリー",
    goodFit: "根拠やデータに基づいて意思決定する仕事、複雑な情報を整理して筋道立てて説明する仕事、矛盾やリスクを検証してから進める仕事に力を発揮します。",
    poorFit: "根拠を求めず勢いや感覚だけで即断即決することが常に求められる仕事、検証の時間を与えられずスピードだけを優先させられる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.5 },
      { key: "wp", label: "WP優位傾向", weight: 0.3 },
      { key: "ec", label: "エモーションコントロール", weight: 0.2 },
    ],
    motivationUp: ["根拠に基づいて意思決定できる環境", "複雑な課題の分析を任される", "データや事実が重視される"],
    motivationDown: ["感覚や勢いだけで物事が決まる", "根拠を求めても聞き入れられない", "場当たり的な方針転換が続く"],
    managerTips: ["根拠やデータを扱う役割を任せる", "意思決定の理由を共有し納得感を持たせる", "分析・検証が必要な課題を渡す"],
    compatibility: {
      complement: "space", complementNote: "論理力の緻密さに、彩る力の表現力が加わると、機能的で美しい形が生まれます。",
      tension: "expr", tensionNote: "根拠を積み上げてから話したい論理力と、感じたことをすぐ言葉にしたい伝達力は、話すペースが異なることがあります。",
    },
  },
  {
    key: "create", name: "発想力",
    def: "既存の枠にとらわれず、新しいアイデアや発想を生み出す力。",
    essence: "アイデアが尽きることなく湧き出る人です。前例のない発想で、周囲に新しい視点をもたらします。",
    roles: "企画職・デザイナー・アーティスト・商品開発・起業家・マーケター・クリエイティブディレクター・脚本家・ゲームプランナー・研究開発",
    goodFit: "新しいアイデアを次々と生み出す仕事、前例のない挑戦が歓迎される仕事、自由度の高い企画立案の仕事で力を発揮します。",
    poorFit: "決まった手順を厳密に繰り返すだけの仕事、変化のないルーティンワーク、前例通りにしか進められない環境は苦手になりやすい傾向があります。",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.6 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.4 },
    ],
    motivationUp: ["自由な発想が歓迎される環境", "新しい企画に挑戦できる機会", "アイデアを否定されずまず受け止められる"],
    motivationDown: ["決まったやり方を強制される", "前例主義・変化のない繰り返し作業", "アイデアを頭ごなしに否定される"],
    managerTips: ["新しい企画やアイデア出しの機会を与える", "結果だけでなく発想の過程も評価する", "前例のないテーマに挑戦させる"],
    compatibility: {
      complement: "lead", complementNote: "発想力の新しいアイデアを、巻き込み力が周囲を動かして形にする組み合わせです。",
      tension: "empathy", tensionNote: "スピーディに発想を広げたい発想力と、一人ひとりに丁寧に向き合いたい共感力はペースが合わないことがあります。",
    },
  },
  {
    key: "empathy", name: "共感力",
    def: "相手の感情や立場を理解し、信頼関係を築く力。",
    essence: "相手の気持ちに寄り添い、信頼を築く人です。人と人をつなぎ、チームに安心感をもたらします。",
    roles: "営業・カウンセラー・人事・接客サービス・教育・看護師・介護士・キャリアコンサルタント・広報PR・コミュニティマネージャー",
    goodFit: "人の気持ちに寄り添い信頼関係を築く仕事、対立を調整してチームの雰囲気を整える仕事、一対一で向き合う時間がある仕事に力を発揮します。",
    poorFit: "成果や数字だけで淡々と評価される仕事、人と関わらず一人で黙々と作業を続ける仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ce", label: "CE優位傾向", weight: 0.4 },
      { key: "ofc", label: "OFC傾向", weight: 0.3 },
      { key: "soloInv", label: "協調性(Soloist逆数)", weight: 0.3 },
    ],
    motivationUp: ["人の役に立っていると実感できる", "信頼関係を築く時間がある", "チームの調和への貢献が評価される"],
    motivationDown: ["対立や衝突が絶えない環境", "成果だけで人間関係が軽視される", "孤立して働くことを求められる"],
    managerTips: ["人と関わる役割(窓口・相談役)を任せる", "チームの雰囲気づくりへの貢献を言語化して評価する", "一対一で話す時間を定期的に確保する"],
    compatibility: {
      complement: "order", complementNote: "共感力の丁寧な関わりに、継続力の粘り強さが加わると、長く続く信頼関係が育ちます。",
      tension: "space", tensionNote: "人への配慮を優先したい共感力と、形や見た目の完成度を優先したい彩る力は、力の入れどころが異なることがあります。",
    },
  },
  {
    key: "lead", name: "巻き込み力",
    def: "目標を定め、周囲を巻き込みながら物事を前に進める力。",
    essence: "目標に向けて周囲を巻き込み、前進させる人です。決断力と推進力で、組織に勢いをもたらします。",
    roles: "経営者・プロジェクトマネージャー・営業リーダー・事業責任者・スタートアップ創業者・チームリーダー・コミュニティオーガナイザー・プロデューサー",
    goodFit: "目標を定めて周囲を巻き込み物事を前に進める仕事、裁量を持って自分で意思決定できる仕事に力を発揮します。",
    poorFit: "承認プロセスが多く自分では何も決められない仕事、指示を待ってから動くことだけを求められる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.5 },
      { key: "solo", label: "Soloist傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.2 },
    ],
    motivationUp: ["裁量を持って物事を進められる", "目標達成に向けて周囲を動かせる", "挑戦とスピードが評価される"],
    motivationDown: ["承認プロセスが多く決断できない", "指示待ちを求められる", "成果より過程ばかり管理される"],
    managerTips: ["裁量を持たせて任せる", "目標設定とその後の振り返りを一緒に行う", "小さなプロジェクトの責任者を経験させる"],
    compatibility: {
      complement: "expr", complementNote: "巻き込み力の推進力に、伝達力の分かりやすい発信が加わると、ビジョンが周囲によく伝わります。",
      tension: "order", tensionNote: "スピードを求める巻き込み力と、着実に進めたい継続力はペースが合わないことがあります。",
    },
  },
  {
    key: "intro", name: "探究力",
    def: "物事の本質やなぜを深く掘り下げて考え続ける力。",
    essence: "物事の本質をとことん掘り下げる人です。深い洞察と専門性で、組織に確かな知見をもたらします。",
    roles: "研究者・ライター・編集者・専門職・カウンセラー・学術研究者・アナリスト・翻訳家・図書館司書・専門コンサルタント",
    goodFit: "一つのテーマをじっくり深く掘り下げる仕事、専門性を磨き続けられる仕事、表面的でない議論ができる仕事に力を発揮します。",
    poorFit: "拙速な結論を求められる仕事、浅く広く手早くこなすことだけが求められる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ec", label: "エモーションコントロール", weight: 0.5 },
      { key: "acc", label: "ACC傾向", weight: 0.3 },
      { key: "fd", label: "FD優位傾向", weight: 0.2 },
    ],
    motivationUp: ["じっくり考える時間が確保されている", "専門性を深められるテーマがある", "表面的でない議論ができる"],
    motivationDown: ["拙速な結論を求められる", "浅い理解のまま進めさせられる", "一人で考える時間が取れない"],
    managerTips: ["一つのテーマを深掘りする時間を確保する", "拙速な結論を求めず、じっくり検討させる", "専門性を発揮できる役割を用意する"],
    compatibility: {
      complement: "logic", complementNote: "探究力が掘り下げた知見を、論理力が筋道立てて整理し、確かな結論に導く組み合わせです。",
      tension: "lead", tensionNote: "深く考えたい探究力と、スピードを求める巻き込み力はテンポが合わないことがあります。",
    },
  },
  {
    key: "expr", name: "伝達力",
    def: "言葉や文章、話し方などを通じて自分の考えや思いを人に伝える力。",
    essence: "考えや思いを言葉にして届ける人です。分かりやすい発信で、周囲の理解と共感を引き出します。",
    roles: "ライター・講師・広報PR・司会アナウンサー・営業・講演家・カスタマーサクセス・コピーライター・研修講師・動画コンテンツ制作",
    goodFit: "自分の言葉で考えを発信し人に伝える仕事、人前で話したり説明したりする機会が多い仕事に力を発揮します。",
    poorFit: "発言や発信の機会がほとんどない仕事、決まった言い回りしか許されない仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "mpfc", label: "MPFC傾向", weight: 0.5 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
      { key: "wp", label: "WP優位傾向", weight: 0.2 },
    ],
    motivationUp: ["人前で話す・伝える機会がある", "自分の言葉で表現することが歓迎される", "発信した内容への反応がある"],
    motivationDown: ["発言の機会が少ない", "決まった伝え方を強制される", "発信しても反応や関心を示されない"],
    managerTips: ["人前で発表・説明する機会を与える", "発信した内容にきちんと反応・フィードバックする", "社内外への情報発信の役割を任せる"],
    compatibility: {
      complement: "body", complementNote: "伝達力が示した方向性を、実践力が実際に手を動かして体現する組み合わせです。",
      tension: "intro", tensionNote: "言葉にしてすぐ発信したい伝達力と、じっくり考えを深めたい探究力はテンポが合わないことがあります。",
    },
  },
  {
    key: "space", name: "彩る力",
    def: "形・色・空間・レイアウトなどを視覚的に捉え、構成する力。",
    essence: "形や空間を美しく構成する人です。視覚的な発想で、アイデアをかたちにする力を発揮します。",
    roles: "デザイナー・建築家・映像写真・インテリア・設計エンジニア・UI/UXデザイナー・空間デザイナー・アートディレクター・プロダクトデザイナー・映像クリエイター",
    goodFit: "形・色・空間を美しく構成する仕事、見た目や使いやすさにこだわれる仕事に力を発揮します。",
    poorFit: "見た目より機能・効率だけで判断される仕事、表現の細部を軽視される仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.7 },
      { key: "fd", label: "FD優位傾向", weight: 0.3 },
    ],
    motivationUp: ["見た目や使いやすさにこだわれる", "アイデアを形にする裁量がある", "美意識やセンスが評価される"],
    motivationDown: ["機能・効率だけで判断される", "完成イメージを共有せず進められる", "表現の細部を軽視される"],
    managerTips: ["見た目や使いやすさを検討する工程に関わらせる", "完成イメージを共有した上で任せる", "表現やデザインへのこだわりを尊重する"],
    compatibility: {
      complement: "create", complementNote: "彩る力の表現力に、発想力の自由な着想が加わると、新しい形が次々と生まれます。",
      tension: "body", tensionNote: "完成度にこだわりたい彩る力と、とにかく早く形にしたい実践力は、スピード感が異なることがあります。",
    },
  },
  {
    key: "body", name: "実践力",
    def: "体を動かし、手先や体感を通じて学び、実行する力。",
    essence: "頭で考えるより先に体が動く人です。実際にやってみることで学び、現場に実行力をもたらします。",
    roles: "スポーツ選手・職人・料理人・理学療法士・ダンサー・現場エンジニア・調理師・トレーナー・整備士・建設作業員",
    goodFit: "実際に手を動かし体で覚えていく仕事、すぐに試して素早く直していく仕事に力を発揮します。",
    poorFit: "座学や書類作業ばかりが中心の仕事、じっと待たされる時間が長い仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.4 },
      { key: "ao", label: "AO優位傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
    ],
    motivationUp: ["実際に手を動かして学べる環境", "体を動かす・実技を伴う仕事", "すぐに試してフィードバックを得られる"],
    motivationDown: ["座学や書類作業ばかりが続く", "頭で考えるだけで実行に移せない", "じっと待たされる時間が長い"],
    managerTips: ["実際に手を動かす・試作する機会を与える", "座学より実践を通じた学びの場を用意する", "素早く試して素早く直すサイクルを許容する"],
    compatibility: {
      complement: "empathy", complementNote: "実践力の行動力に、共感力の人への配慮が加わると、周囲を置き去りにしない前進ができます。",
      tension: "logic", tensionNote: "まず動いて試したい実践力と、根拠を確かめてから動きたい論理力は進め方が異なることがあります。",
    },
  },
  {
    key: "order", name: "継続力",
    def: "計画的に物事を進め、地道な努力をコツコツと積み重ねる力。",
    essence: "計画的にコツコツと積み重ねる人です。地道な努力で、組織に安定と信頼をもたらします。",
    roles: "経理事務・品質管理・公務員・システム管理・伝統工芸・総務・品質保証・システム運用保守・生産管理・図書館業務",
    goodFit: "計画的にコツコツ積み重ねる仕事、安定したルーティンの中で力を発揮できる仕事に向いています。",
    poorFit: "頻繁な方針転換が続く場当たり的な仕事、秩序のない進め方を強いられる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.6 },
      { key: "ec", label: "エモーションコントロール", weight: 0.4 },
    ],
    motivationUp: ["計画的にコツコツ取り組める環境", "地道な努力が正しく評価される", "安定したルーティンがある"],
    motivationDown: ["頻繁な方針転換・場当たり的な変更", "努力の過程が評価されない", "秩序のない進め方を強いられる"],
    managerTips: ["計画立てて進める役割を任せる", "地道な積み重ねを定期的に評価・承認する", "急な方針転換を避け、見通しを示す"],
    compatibility: {
      complement: "intro", complementNote: "継続力の着実さに、探究力の深い洞察が加わると、質の高い積み重ねが生まれます。",
      tension: "create", tensionNote: "決まったやり方を守りたい継続力と、常に新しさを求める発想力は方向性が異なることがあります。",
    },
  },
];

export const TALENT_BY_KEY: Record<TalentKey, Talent> = TALENTS.reduce((acc, t) => {
  acc[t.key] = t;
  return acc;
}, {} as Record<TalentKey, Talent>);

export const CHART_ORDER: TalentKey[] = ["logic", "create", "empathy", "lead", "intro", "expr", "space", "body", "order"];

export const RELATIONSHIP_ORDER: TalentKey[] = ["create", "lead", "expr", "body", "empathy", "order", "intro", "logic", "space"];

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

export function scoreDeltas(current: TalentScores, previous: TalentScores) {
  return TALENTS
    .map((t) => {
      const delta = Math.round((current[t.key] - previous[t.key]) * 10) / 10;
      return { t, current: current[t.key], previous: previous[t.key], delta };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
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
