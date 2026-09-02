// 商談創出AI(Sales AI)モジュールの型定義。
// DBの行 <-> アプリ内で使う camelCase の型 の変換もここにまとめる。

export const LEAD_STATUSES = [
  "未接触",
  "アプローチ済",
  "反応あり",
  "興味あり",
  "商談候補",
  "商談",
  "提案",
  "受注",
  "失注",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

// 「商談化」した(=有望商談としてカウントする)とみなすステータス
export const DEAL_STAGE_STATUSES: LeadStatus[] = ["商談候補", "商談", "提案", "受注"];

export interface SalesProfile {
  companyId: string;
  industry: string;
  area: string;
  employeeCount: string;
  website: string;
  productService: string;
  priceRange: string;
  currentMarketing: string;
  currentSalesMethod: string;
  monthlyInquiries: number | null;
  monthlyDeals: number | null;
  monthlyOrders: number | null;
  updatedAt: string;
}

export interface DbSalesProfileRow {
  company_id: string;
  industry: string | null;
  area: string | null;
  employee_count: string | null;
  website: string | null;
  product_service: string | null;
  price_range: string | null;
  current_marketing: string | null;
  current_sales_method: string | null;
  monthly_inquiries: number | null;
  monthly_deals: number | null;
  monthly_orders: number | null;
  updated_at: string;
}

export function salesProfileFromRow(row: DbSalesProfileRow): SalesProfile {
  return {
    companyId: row.company_id,
    industry: row.industry ?? "",
    area: row.area ?? "",
    employeeCount: row.employee_count ?? "",
    website: row.website ?? "",
    productService: row.product_service ?? "",
    priceRange: row.price_range ?? "",
    currentMarketing: row.current_marketing ?? "",
    currentSalesMethod: row.current_sales_method ?? "",
    monthlyInquiries: row.monthly_inquiries,
    monthlyDeals: row.monthly_deals,
    monthlyOrders: row.monthly_orders,
    updatedAt: row.updated_at,
  };
}

export const DEFAULT_SALES_PROFILE: Omit<SalesProfile, "companyId" | "updatedAt"> = {
  industry: "",
  area: "",
  employeeCount: "",
  website: "",
  productService: "",
  priceRange: "",
  currentMarketing: "",
  currentSalesMethod: "",
  monthlyInquiries: null,
  monthlyDeals: null,
  monthlyOrders: null,
};

// ---------- 診断 ----------

export interface MarketingScores {
  targetClarity: number;
  web: number;
  seo: number;
  sns: number;
  ads: number;
  content: number;
  inquiryFlow: number;
}

export interface SalesScores {
  list: number;
  approach: number;
  appointmentRate: number;
  dealRate: number;
  closeRate: number;
  followUp: number;
}

export interface LeadHealthScores {
  volume: number;
  quality: number;
  source: number;
  nurture: number;
  reapproach: number;
}

export type BottleneckCategory = "集客" | "営業" | "リード";

export interface DiagnosisResult {
  id: string;
  companyId: string;
  marketingScores: MarketingScores;
  salesScores: SalesScores;
  leadScores: LeadHealthScores;
  bottleneckCategory: BottleneckCategory;
  bottleneckSummary: string;
  createdAt: string;
}

export interface DbSalesDiagnosisRow {
  id: string;
  company_id: string;
  marketing_scores: MarketingScores;
  sales_scores: SalesScores;
  lead_scores: LeadHealthScores;
  bottleneck_category: BottleneckCategory;
  bottleneck_summary: string;
  created_at: string;
}

export function diagnosisFromRow(row: DbSalesDiagnosisRow): DiagnosisResult {
  return {
    id: row.id,
    companyId: row.company_id,
    marketingScores: row.marketing_scores,
    salesScores: row.sales_scores,
    leadScores: row.lead_scores,
    bottleneckCategory: row.bottleneck_category,
    bottleneckSummary: row.bottleneck_summary,
    createdAt: row.created_at,
  };
}

export const MARKETING_LABELS: Record<keyof MarketingScores, string> = {
  targetClarity: "ターゲットの明確性",
  web: "Web集客",
  seo: "SEO",
  sns: "SNS",
  ads: "広告",
  content: "コンテンツ",
  inquiryFlow: "問い合わせ導線",
};

export const SALES_LABELS: Record<keyof SalesScores, string> = {
  list: "営業リスト",
  approach: "アプローチ方法",
  appointmentRate: "アポ率",
  dealRate: "商談化率",
  closeRate: "成約率",
  followUp: "フォロー体制",
};

export const LEAD_HEALTH_LABELS: Record<keyof LeadHealthScores, string> = {
  volume: "リード数",
  quality: "リードの質",
  source: "リード獲得経路",
  nurture: "リード育成",
  reapproach: "失注顧客への再アプローチ",
};

// ---------- ICP ----------

export interface Icp {
  id: string;
  companyId: string;
  industry: string;
  employeeRange: string;
  area: string;
  revenueRange: string;
  painPoints: string;
  features: string;
  decisionMaker: string;
  buyingTrigger: string;
  reasoning: string;
  createdAt: string;
}

export interface DbIcpRow {
  id: string;
  company_id: string;
  industry: string | null;
  employee_range: string | null;
  area: string | null;
  revenue_range: string | null;
  pain_points: string | null;
  features: string | null;
  decision_maker: string | null;
  buying_trigger: string | null;
  reasoning: string | null;
  created_at: string;
}

export function icpFromRow(row: DbIcpRow): Icp {
  return {
    id: row.id,
    companyId: row.company_id,
    industry: row.industry ?? "",
    employeeRange: row.employee_range ?? "",
    area: row.area ?? "",
    revenueRange: row.revenue_range ?? "",
    painPoints: row.pain_points ?? "",
    features: row.features ?? "",
    decisionMaker: row.decision_maker ?? "",
    buyingTrigger: row.buying_trigger ?? "",
    reasoning: row.reasoning ?? "",
    createdAt: row.created_at,
  };
}

// ---------- リード ----------

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  url: string;
  industry: string;
  area: string;
  employeeCount: string;
  estimatedRevenue: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  snsUrl: string;
  hiringStatus: string;
  painPoints: string;
  aiScore: number | null;
  scoreReason: string;
  status: LeadStatus;
  dealAmount: number | null;
  lastContactDate: string | null;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbLeadRow {
  id: string;
  company_id: string;
  name: string;
  url: string | null;
  industry: string | null;
  area: string | null;
  employee_count: string | null;
  estimated_revenue: string | null;
  contact_name: string | null;
  contact_title: string | null;
  email: string | null;
  phone: string | null;
  sns_url: string | null;
  hiring_status: string | null;
  pain_points: string | null;
  ai_score: number | null;
  score_reason: string | null;
  status: LeadStatus;
  deal_amount: number | null;
  last_contact_date: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export function leadFromRow(row: DbLeadRow): Lead {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    url: row.url ?? "",
    industry: row.industry ?? "",
    area: row.area ?? "",
    employeeCount: row.employee_count ?? "",
    estimatedRevenue: row.estimated_revenue ?? "",
    contactName: row.contact_name ?? "",
    contactTitle: row.contact_title ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    snsUrl: row.sns_url ?? "",
    hiringStatus: row.hiring_status ?? "",
    painPoints: row.pain_points ?? "",
    aiScore: row.ai_score,
    scoreReason: row.score_reason ?? "",
    status: row.status,
    dealAmount: row.deal_amount,
    lastContactDate: row.last_contact_date,
    nextAction: row.next_action ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ScoreBand = "最優先" | "有望" | "育成" | "優先度低";

export function scoreBand(score: number | null): ScoreBand {
  if (score === null) return "優先度低";
  if (score >= 90) return "最優先";
  if (score >= 70) return "有望";
  if (score >= 50) return "育成";
  return "優先度低";
}

export const SCORE_BAND_CLASS: Record<ScoreBand, string> = {
  最優先: "chip fit-chip",
  有望: "chip",
  育成: "chip",
  優先度低: "chip",
};

// ---------- アプローチ文 ----------

export interface ApproachTexts {
  id: string;
  leadId: string;
  emailSubject: string;
  emailBody: string;
  formMessage: string;
  phoneScript: string;
  firstMeetingScript: string;
  createdAt: string;
}

export interface DbApproachTextRow {
  id: string;
  lead_id: string;
  company_id: string;
  email_subject: string | null;
  email_body: string | null;
  form_message: string | null;
  phone_script: string | null;
  first_meeting_script: string | null;
  created_at: string;
}

export function approachTextsFromRow(row: DbApproachTextRow): ApproachTexts {
  return {
    id: row.id,
    leadId: row.lead_id,
    emailSubject: row.email_subject ?? "",
    emailBody: row.email_body ?? "",
    formMessage: row.form_message ?? "",
    phoneScript: row.phone_script ?? "",
    firstMeetingScript: row.first_meeting_script ?? "",
    createdAt: row.created_at,
  };
}
