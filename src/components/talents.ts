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
    key: "logic", name: "分析",
    def: "データや事実にもとづいて物事を正確に捉え、根拠から確かな判断を導く力。",
    essence: "感覚や思い込みに流されず、データと事実で物事を捉える人です。曖昧さを数字と根拠に置き換え、組織に確かな判断軸をもたらします。",
    roles: "データアナリスト・研究者・経理財務・コンサルタント・エンジニア・戦略立案・監査・品質保証・リサーチャー・マーケティング分析",
    goodFit: "データや事実にもとづいて意思決定する仕事、情報を整理して根拠を示す仕事、リスクや矛盾を検証してから進める仕事に力を発揮します。",
    poorFit: "根拠を確かめる間もなく感覚だけで即断を迫られる仕事、事実より空気で物事が決まる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.5 },
      { key: "wp", label: "WP優位傾向", weight: 0.3 },
      { key: "ec", label: "エモーションコントロール", weight: 0.2 },
    ],
    motivationUp: ["事実やデータにもとづいて判断できる", "分析や検証を任される", "根拠が重視される環境"],
    motivationDown: ["感覚や勢いだけで決まる", "根拠を示しても聞き入れられない", "場当たり的な方針転換が続く"],
    managerTips: ["データ分析・検証を扱う役割を任せる", "意思決定の根拠を共有し納得感を持たせる", "事実を洗い出す時間を確保する"],
    compatibility: {
      complement: "space", complementNote: "分析が捉えた事実を、最適化が使いやすい形に整えると、正確さと扱いやすさを両立できます。",
      tension: "expr", tensionNote: "根拠を固めてから動きたい分析と、まず人とつないで広げたい接続は、進めるテンポが異なることがあります。",
    },
  },
  {
    key: "create", name: "創発",
    def: "既存の枠にとらわれず、新しいアイデアや価値を生み出す力。",
    essence: "前例のない発想で、新しい価値を次々と生み出す人です。まだ無いものを思い描き、組織に新しい可能性をもたらします。",
    roles: "企画職・商品開発・デザイナー・起業家・マーケター・研究開発・クリエイティブディレクター・新規事業・プランナー・アーティスト",
    goodFit: "新しいアイデアや価値を生み出す仕事、前例のない挑戦が歓迎される仕事、自由度の高い企画の仕事に力を発揮します。",
    poorFit: "決められた手順を正確に繰り返すだけの仕事、新しい提案が受け入れられない仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.6 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.4 },
    ],
    motivationUp: ["新しいアイデアを試せる", "前例のない挑戦が歓迎される", "自由に発想できる裁量がある"],
    motivationDown: ["決まったやり方しか許されない", "新しい提案が却下され続ける", "前例踏襲を強く求められる"],
    managerTips: ["新しい企画やアイデア出しを任せる", "前例のない挑戦を後押しする", "自由に発想できる余白を残す"],
    compatibility: {
      complement: "lead", complementNote: "創発が生んだ新しい価値を、共鳴が人の心を動かして広げると、アイデアが形になって伝わります。",
      tension: "empathy", tensionNote: "次々と新しさを求める創発と、一人ひとりに丁寧に寄り添う支援は、進めるペースが合わないことがあります。",
    },
  },
  {
    key: "empathy", name: "支援",
    def: "相手の状況や気持ちを汲み取り、人を支え信頼関係を築く力。",
    essence: "困っている人にそっと手を差し伸べる人です。相手を支え、安心して力を発揮できる土台をチームにもたらします。",
    roles: "人事・カウンセラー・接客サービス・看護師・介護士・キャリアコンサルタント・教育・広報PR・カスタマーサポート・コミュニティマネージャー",
    goodFit: "人を支え信頼関係を築く仕事、困りごとに寄り添って解決する仕事、一対一で向き合う時間がある仕事に力を発揮します。",
    poorFit: "人と関わらず数字だけで淡々と進める仕事、支え合いより競争が優先される仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ce", label: "CE優位傾向", weight: 0.4 },
      { key: "ofc", label: "OFC傾向", weight: 0.3 },
      { key: "soloInv", label: "協調性(Soloist逆数)", weight: 0.3 },
    ],
    motivationUp: ["人の役に立っていると実感できる", "誰かを支える時間がある", "支援やフォローが評価される"],
    motivationDown: ["人間関係が軽視される", "支え合いより競争が優先される", "孤立して働くことを求められる"],
    managerTips: ["人を支える役割(相談役・フォロー役)を任せる", "支援やフォローの貢献を言語化して評価する", "一対一で話す時間を定期的に確保する"],
    compatibility: {
      complement: "order", complementNote: "支援の丁寧な関わりに、蓄積の粘り強さが加わると、長く続く信頼関係が育ちます。",
      tension: "space", tensionNote: "人の気持ちを優先したい支援と、効率や仕上がりを優先したい最適化は、力の入れどころが異なることがあります。",
    },
  },
  {
    key: "lead", name: "共鳴",
    def: "思いを伝えて人の心を動かし、周囲を巻き込んで前進させる力。",
    essence: "熱量で人の心を動かし、周囲を巻き込む人です。共感の輪を広げ、組織に勢いと一体感をもたらします。",
    roles: "経営者・営業リーダー・プロジェクトマネージャー・事業責任者・プロデューサー・チームリーダー・スタートアップ創業者・コミュニティオーガナイザー・広報・講演家",
    goodFit: "思いを伝えて人の心を動かす仕事、周囲を巻き込んで前に進める仕事、裁量を持って旗を振れる仕事に力を発揮します。",
    poorFit: "人と関わらず黙々と進める仕事、決められたことを淡々とこなすだけの仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.5 },
      { key: "solo", label: "Soloist傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.2 },
    ],
    motivationUp: ["人を巻き込んで物事を動かせる", "思いを伝えて共感を得られる", "挑戦とスピードが評価される"],
    motivationDown: ["承認プロセスが多く動けない", "指示待ちを求められる", "熱量が伝わらない環境"],
    managerTips: ["人を巻き込む場面の旗振り役を任せる", "目標と、その後の振り返りを一緒に行う", "小さなチームを率いる経験をさせる"],
    compatibility: {
      complement: "expr", complementNote: "共鳴が動かした人の心を、接続が人と人をつないで広げると、うねりが大きく育ちます。",
      tension: "order", tensionNote: "勢いよく人を動かしたい共鳴と、着実に積み上げたい蓄積は、ペースが合わないことがあります。",
    },
  },
  {
    key: "intro", name: "統合",
    def: "断片的な情報や意見を結びつけ、全体を一つにまとめ上げる力。",
    essence: "バラバラな要素を俯瞰し、一つの筋に束ねる人です。全体像を描き、組織に方向性とまとまりをもたらします。",
    roles: "経営企画・PMO・システムアーキテクト・編集者・コンサルタント・事業統括・プロダクトマネージャー・ディレクター・アナリスト・戦略立案",
    goodFit: "全体像を描いて情報や意見をまとめる仕事、複数の要素を一つの方針に束ねる仕事、俯瞰して整理する仕事に力を発揮します。",
    poorFit: "全体を見ずに目の前の作業だけを求められる仕事、方針がバラバラのまま進めさせられる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ec", label: "エモーションコントロール", weight: 0.5 },
      { key: "acc", label: "ACC傾向", weight: 0.3 },
      { key: "fd", label: "FD優位傾向", weight: 0.2 },
    ],
    motivationUp: ["全体を俯瞰してまとめられる", "方針や構造を描く役割がある", "整理した結果が活かされる"],
    motivationDown: ["全体像を共有されないまま進む", "部分最適ばかりを求められる", "まとめる裁量が与えられない"],
    managerTips: ["全体をまとめる・方針を描く役割を任せる", "俯瞰して整理する時間を確保する", "断片をつなぐ議論の場をつくる"],
    compatibility: {
      complement: "logic", complementNote: "統合が描いた全体像を、分析が事実で裏づけると、説得力のあるまとまりになります。",
      tension: "lead", tensionNote: "じっくり全体を束ねたい統合と、勢いで人を動かしたい共鳴は、テンポが合わないことがあります。",
    },
  },
  {
    key: "expr", name: "接続",
    def: "人と人、情報と情報をつなぎ、輪を広げていく力。",
    essence: "人と人をつなぎ、輪を広げていく人です。垣根を越えて橋をかけ、組織に新しいつながりと広がりをもたらします。",
    roles: "営業・広報PR・アライアンス・コミュニティマネージャー・カスタマーサクセス・イベント企画・採用・パートナー開拓・SNS運用・渉外",
    goodFit: "人や情報をつなぎ輪を広げる仕事、社内外を橋渡しする仕事、新しい関係を築いていく仕事に力を発揮します。",
    poorFit: "人と関わらず一人で完結する仕事、外とのつながりを断って進める仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "mpfc", label: "MPFC傾向", weight: 0.5 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
      { key: "wp", label: "WP優位傾向", weight: 0.2 },
    ],
    motivationUp: ["人や情報をつなぐ機会がある", "新しい関係を広げられる", "橋渡しの貢献が評価される"],
    motivationDown: ["外とのつながりが断たれる", "一人で完結する作業ばかり", "つないでも活かされない"],
    managerTips: ["社内外をつなぐ橋渡し役を任せる", "新しい関係を広げる機会を与える", "つながりが生んだ成果を評価する"],
    compatibility: {
      complement: "body", complementNote: "接続が広げたつながりを、統括が仕組みに落とし込むと、一過性で終わらず定着します。",
      tension: "intro", tensionNote: "外へ広げたい接続と、内で束ねたい統合は、力の向きが異なることがあります。",
    },
  },
  {
    key: "space", name: "最適化",
    def: "無駄を省き、より良い状態へと整え、磨き上げる力。",
    essence: "今あるものをより良い状態へ磨き上げる人です。無駄を省いて整え、組織に効率と完成度をもたらします。",
    roles: "業務改善・UI/UXデザイナー・生産管理・オペレーション設計・品質改善・プロセスエンジニア・空間デザイナー・ロジスティクス・システム改善・整備",
    goodFit: "無駄を省いてより良く整える仕事、使いやすさや効率にこだわれる仕事、改善を積み重ねる仕事に力を発揮します。",
    poorFit: "整える余地を与えられず雑なまま進める仕事、改善提案が軽視される仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "ao", label: "AO優位傾向", weight: 0.7 },
      { key: "fd", label: "FD優位傾向", weight: 0.3 },
    ],
    motivationUp: ["より良く整える裁量がある", "使いやすさや効率にこだわれる", "改善が評価される"],
    motivationDown: ["雑なまま進めることを求められる", "改善提案が軽視される", "完成イメージを共有されない"],
    managerTips: ["改善・最適化の工程を任せる", "完成イメージを共有した上で任せる", "整えるこだわりを尊重する"],
    compatibility: {
      complement: "create", complementNote: "最適化の磨き込みに、創発の自由な発想が加わると、洗練された新しい形が生まれます。",
      tension: "body", tensionNote: "細部まで整えたい最適化と、まず仕組みを形にして動かしたい統括は、スピード感が異なることがあります。",
    },
  },
  {
    key: "body", name: "統括",
    def: "人や役割を束ね、継続して回る仕組みをつくり上げる力。",
    essence: "場当たりを仕組みに変え、回り続ける仕掛けをつくる人です。全体を束ね、組織に安定した実行力をもたらします。",
    roles: "事業責任者・オペレーション統括・COO・部門長・プロジェクトマネージャー・仕組み化担当・組織運営・店舗マネージャー・生産統括・管理職",
    goodFit: "人や役割を束ねて仕組みをつくる仕事、継続して回る仕掛けを整える仕事、全体を統括する仕事に力を発揮します。",
    poorFit: "仕組みを任されず単発の作業だけを求められる仕事、権限がなく統括できない仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "wp", label: "WP優位傾向", weight: 0.4 },
      { key: "ao", label: "AO優位傾向", weight: 0.3 },
      { key: "ea", label: "エモーションアクティブ", weight: 0.3 },
    ],
    motivationUp: ["仕組みをつくる裁量がある", "人や役割を束ねられる", "回り続ける仕掛けが評価される"],
    motivationDown: ["仕組み化を任されない", "権限がなく統括できない", "単発の作業ばかりが続く"],
    managerTips: ["仕組みづくり・統括の役割を任せる", "権限を渡して全体を束ねさせる", "仕組みが回った成果を評価する"],
    compatibility: {
      complement: "empathy", complementNote: "統括のつくった仕組みに、支援の人への配慮が加わると、人が置き去りにならず回り続けます。",
      tension: "logic", tensionNote: "まず仕組みを回したい統括と、根拠を確かめてから動きたい分析は、進め方が異なることがあります。",
    },
  },
  {
    key: "order", name: "蓄積",
    def: "地道な努力をコツコツと積み重ね、着実に力を蓄えていく力。",
    essence: "毎日の小さな積み重ねを続けられる人です。地道な蓄積で、組織に安定と揺るがない土台をもたらします。",
    roles: "経理事務・品質管理・システム運用保守・公務員・生産管理・総務・データ管理・在庫管理・伝統工芸・保守点検",
    goodFit: "コツコツ積み上げる仕事、安定したルーティンの中で着実に続ける仕事、地道な努力が積み重なる仕事に力を発揮します。",
    poorFit: "頻繁な方針転換が続く場当たり的な仕事、積み重ねが無駄になる進め方を強いられる仕事は苦手になりやすい傾向があります。",
    factors: [
      { key: "fd", label: "FD優位傾向", weight: 0.6 },
      { key: "ec", label: "エモーションコントロール", weight: 0.4 },
    ],
    motivationUp: ["コツコツ積み重ねられる環境", "地道な努力が正しく評価される", "安定したルーティンがある"],
    motivationDown: ["頻繁な方針転換・場当たり的な変更", "積み重ねが評価されない", "秩序のない進め方を強いられる"],
    managerTips: ["コツコツ積み上げる役割を任せる", "地道な積み重ねを定期的に評価・承認する", "急な方針転換を避け、見通しを示す"],
    compatibility: {
      complement: "intro", complementNote: "蓄積の着実さに、統合の全体を束ねる視点が加わると、積み上げたものが大きな成果にまとまります。",
      tension: "create", tensionNote: "決まったやり方を守りたい蓄積と、常に新しさを求める創発は、方向性が異なることがあります。",
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
