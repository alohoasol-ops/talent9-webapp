// 商談創出AIの「頭脳」部分。
// 外部AI(Anthropic)が使えない環境でもアプリが完全に動作するよう、
// ここではネットワークに依存しない決定論的なルールベースのロジックのみを実装する。
// (AI連携で文章の質を上げる部分は ./ai.ts が担当し、失敗時は必ずここの結果にフォールバックする)

import {
  DEFAULT_SALES_PROFILE,
  LEAD_HEALTH_LABELS,
  MARKETING_LABELS,
  SALES_LABELS,
  type BottleneckCategory,
  type Icp,
  type LeadHealthScores,
  type MarketingScores,
  type SalesProfile,
  type SalesScores,
} from "./types";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

// 自由記述のテキストにキーワードが含まれているかで、取り組みの度合いを推定する。
// (「〇〇という記述が見つからない → スコアが低い」という、経営者にも分かる理由をつけられるようにするため)
function keywordScore(text: string, keywords: string[], baseIfEmpty = 15): number {
  const t = (text || "").trim();
  if (!t) return baseIfEmpty;
  const hits = keywords.filter((k) => t.includes(k)).length;
  const lengthBonus = Math.min(20, Math.floor(t.length / 10));
  return clamp(30 + hits * 18 + lengthBonus);
}

function ratioScore(numerator: number | null, denominator: number | null, goodRatio: number): number {
  if (!denominator || denominator <= 0) return 20;
  if (numerator === null || numerator < 0) return 20;
  const ratio = numerator / denominator;
  return clamp((ratio / goodRatio) * 100);
}

export type SalesProfileInput = Omit<SalesProfile, "companyId" | "updatedAt">;

export function emptySalesProfileInput(): SalesProfileInput {
  return { ...DEFAULT_SALES_PROFILE };
}

export interface ComputedDiagnosis {
  marketingScores: MarketingScores;
  salesScores: SalesScores;
  leadScores: LeadHealthScores;
  bottleneckCategory: BottleneckCategory;
  bottleneckSummary: string;
}

export function computeDiagnosis(profile: SalesProfileInput): ComputedDiagnosis {
  const marketing = profile.currentMarketing;
  const sales = profile.currentSalesMethod;

  const marketingScores: MarketingScores = {
    targetClarity: keywordScore(marketing, ["ターゲット", "ペルソナ", "業種", "従業員"]),
    web: keywordScore(marketing, ["ホームページ", "自社サイト", "HP", "Web", "サイト"]),
    seo: keywordScore(marketing, ["SEO", "検索", "オーガニック"]),
    sns: keywordScore(marketing, ["SNS", "Instagram", "X(Twitter)", "Twitter", "Facebook", "YouTube"]),
    ads: keywordScore(marketing, ["広告", "リスティング", "Web広告", "Google広告", "Meta広告"]),
    content: keywordScore(marketing, ["ブログ", "コンテンツ", "事例", "導入事例", "note"]),
    inquiryFlow: keywordScore(marketing, ["問い合わせフォーム", "資料請求", "フォーム", "LINE"]),
  };

  const monthlyDealRate = ratioScore(profile.monthlyDeals, profile.monthlyInquiries, 0.3);
  const monthlyCloseRate = ratioScore(profile.monthlyOrders, profile.monthlyDeals, 0.3);

  const salesScores: SalesScores = {
    list: keywordScore(sales, ["リスト", "名簿", "データベース", "SFA", "CRM"]),
    approach: keywordScore(sales, ["架電", "テレアポ", "訪問", "メール", "紹介", "DM"]),
    appointmentRate: keywordScore(sales, ["アポ率", "アポイント", "商談化"], 25),
    dealRate: monthlyDealRate,
    closeRate: monthlyCloseRate,
    followUp: keywordScore(sales, ["フォロー", "追客", "ナーチャリング", "定期連絡"]),
  };

  const inquiries = profile.monthlyInquiries ?? 0;
  const leadScores: LeadHealthScores = {
    volume: clamp((inquiries / 20) * 100),
    quality: monthlyDealRate,
    source: keywordScore(marketing, ["紹介", "SEO", "広告", "SNS", "展示会", "セミナー"]),
    nurture: keywordScore(sales, ["ナーチャリング", "メルマガ", "ステップメール", "フォロー"]),
    reapproach: keywordScore(sales, ["失注", "再アプローチ", "掘り起こし"], 10),
  };

  const categoryAverages: { category: BottleneckCategory; avg: number; scores: Record<string, number>; labels: Record<string, string> }[] = [
    {
      category: "集客",
      avg: average(Object.values(marketingScores)),
      scores: marketingScores as unknown as Record<string, number>,
      labels: MARKETING_LABELS as unknown as Record<string, string>,
    },
    {
      category: "営業",
      avg: average(Object.values(salesScores)),
      scores: salesScores as unknown as Record<string, number>,
      labels: SALES_LABELS as unknown as Record<string, string>,
    },
    {
      category: "リード",
      avg: average(Object.values(leadScores)),
      scores: leadScores as unknown as Record<string, number>,
      labels: LEAD_HEALTH_LABELS as unknown as Record<string, string>,
    },
  ];

  categoryAverages.sort((a, b) => a.avg - b.avg);
  const worst = categoryAverages[0];
  const worstItemKey = Object.entries(worst.scores).sort((a, b) => a[1] - b[1])[0][0];
  const worstItemLabel = worst.labels[worstItemKey];

  const bottleneckSummary = `御社の最大のボトルネックは「${worst.category}」です(${Math.round(worst.avg)}点)。とくに「${worstItemLabel}」のスコアが低く、ここを改善することが有望商談数を増やす一番の近道です。`;

  return {
    marketingScores,
    salesScores,
    leadScores,
    bottleneckCategory: worst.category,
    bottleneckSummary,
  };
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// ---------- ICP(理想顧客像) ----------

export interface ComputedIcp {
  industry: string;
  employeeRange: string;
  area: string;
  revenueRange: string;
  painPoints: string;
  features: string;
  decisionMaker: string;
  buyingTrigger: string;
  reasoning: string;
}

export function buildIcp(profile: SalesProfileInput): ComputedIcp {
  const industry = profile.industry || "(業種未設定)";
  const area = profile.area || "全国";
  const isHighPrice = /\d{3,}万|億/.test(profile.priceRange || "");

  const employeeRange = isHighPrice ? "50〜200名" : "10〜50名";
  const revenueRange = isHighPrice ? "10億〜50億円" : "1億〜10億円";
  const decisionMaker = isHighPrice ? "代表取締役・事業責任者" : "代表取締役・営業責任者";

  const marketingGap = !/(SEO|広告|SNS)/.test(profile.currentMarketing || "");
  const salesGap = !/(リスト|CRM|SFA)/.test(profile.currentSalesMethod || "");

  const painPointsList = [
    marketingGap ? "新規リードの獲得経路が乏しい" : null,
    salesGap ? "営業リストや商談管理の仕組みが整っていない" : null,
    "営業担当者ごとに成果のばらつきがある",
  ].filter(Boolean) as string[];

  const buyingTrigger = marketingGap
    ? "問い合わせ・リードの不足を課題として認識し始めたタイミング"
    : "商談数や成約率の伸び悩みを感じ始めたタイミング";

  const features = `${profile.productService || "自社の商品・サービス"}と親和性が高く、${area}を中心に事業展開する${industry}の企業`;

  const reasoning = `${industry}の企業で、従業員数${employeeRange}・売上規模${revenueRange}のレンジは、${
    profile.productService || "御社の商品・サービス"
  }(${profile.priceRange || "価格帯未設定"})を無理なく導入できる予算規模と組織体制を持つと考えられます。また${painPointsList
    .map((p) => `「${p}」`)
    .join("")}という課題を抱えている企業ほど、御社サービスとの適合度が高くなります。`;

  return {
    industry,
    employeeRange,
    area,
    revenueRange,
    painPoints: painPointsList.join(" / "),
    features,
    decisionMaker,
    buyingTrigger,
    reasoning,
  };
}

// ---------- リードスコアリング ----------

export interface LeadScoreInput {
  industry: string;
  area: string;
  employeeCount: string;
  hiringStatus: string;
  painPoints: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface ComputedLeadScore {
  score: number;
  reason: string;
}

export function scoreLead(lead: LeadScoreInput, icp: Icp | null): ComputedLeadScore {
  const chain: string[] = [];
  let score = 20; // ベーススコア(登録されているだけで最低限の見込みはある、という前提)
  chain.push("企業として登録済み → 一定の実在確認ができている");

  if (icp && lead.industry && icp.industry && lead.industry.includes(icp.industry)) {
    score += 20;
    chain.push(`業種がICP(${icp.industry})と一致 → サービスとの適合度が高い`);
  }

  if (icp && lead.employeeCount && icp.employeeRange) {
    score += 15;
    chain.push(`従業員規模がICPレンジ(${icp.employeeRange})に近い → 予算・組織体制が合致しやすい`);
  }

  if (icp && lead.area && icp.area && (lead.area.includes(icp.area) || icp.area === "全国")) {
    score += 10;
    chain.push("エリアがターゲット範囲内 → 商談化しやすい");
  }

  if (/採用|求人|募集/.test(lead.hiringStatus || "")) {
    score += 20;
    chain.push("採用ページ・求人広告を公開している → 組織課題・人材課題が存在する可能性が高い");
  }

  if ((lead.painPoints || "").trim().length > 0) {
    score += 15;
    chain.push("課題感が明確に把握できている → アプローチ時の訴求ポイントが作りやすい");
  }

  if (lead.contactName && (lead.email || lead.phone)) {
    score += 10;
    chain.push("担当者名と連絡先が判明している → 直接アプローチが可能");
  }

  score = clamp(score);
  const reason = chain.map((c, i) => `${i + 1}. ${c}`).join("\n");

  return { score, reason };
}

// ---------- アプローチ文生成(テンプレートベース) ----------

export interface ApproachTextInput {
  companyName: string;
  productService: string;
  leadName: string;
  contactName: string;
  contactTitle: string;
  painPoints: string;
  scoreReason: string;
}

export interface ComputedApproachTexts {
  emailSubject: string;
  emailBody: string;
  formMessage: string;
  phoneScript: string;
  firstMeetingScript: string;
}

export function buildApproachTexts(input: ApproachTextInput): ComputedApproachTexts {
  const to = input.contactName ? `${input.contactName}様` : "ご担当者様";
  const pain = input.painPoints || "組織づくり・売上拡大における課題";
  const product = input.productService || "私たちのサービス";

  const emailSubject = `【${input.leadName}様へ】${pain}に関するご提案(${input.companyName || "弊社"}より)`;

  const emailBody = `${to}

突然のご連絡失礼いたします。${input.companyName || "弊社"}の者です。

貴社の取り組みを拝見し、${pain}という点で${product}がお役に立てるのではと思いご連絡いたしました。

同じような課題をお持ちの企業様に対して、${product}を通じて具体的な成果につなげてきた実績がございます。
もしご興味をお持ちいただけましたら、15分ほどオンラインでお話しさせていただけないでしょうか。

ご検討のほど、よろしくお願いいたします。`;

  const formMessage = `${input.companyName || "弊社"}と申します。貴社の${pain}という課題に対して、${product}でお力になれるのではと思いご連絡いたしました。一度お話しする機会をいただけますと幸いです。`;

  const phoneScript = `お世話になっております。${input.companyName || "弊社"}の者です。
本日は、${pain}に課題をお持ちの企業様向けにご案内しております${product}について、
ご担当の${to}にご案内できればと思いご連絡いたしました。
今、1〜2分だけお時間よろしいでしょうか。`;

  const firstMeetingScript = `本日はお時間をいただきありがとうございます。
まず貴社の現状(${pain})について、簡単にお伺いできますでしょうか。
その上で、${product}が貴社の課題解決にどう役立てるか、具体例を交えてご説明させていただきます。`;

  return { emailSubject, emailBody, formMessage, phoneScript, firstMeetingScript };
}
