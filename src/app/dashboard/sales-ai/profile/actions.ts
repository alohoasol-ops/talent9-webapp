"use server";

import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { computeDiagnosis, type SalesProfileInput } from "@/lib/salesAi/scoring";
import { enhanceBottleneckSummary } from "@/lib/salesAi/ai";

export interface SaveProfileState {
  error?: string;
  saved?: boolean;
}

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export async function saveSalesProfileAction(
  _prev: SaveProfileState | null,
  formData: FormData
): Promise<SaveProfileState> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const companyName = String(formData.get("companyName") || "").trim();
  if (!companyName) {
    return { error: "会社名は必須です。" };
  }

  if (profile.companyId) {
    await supabase.from("companies").update({ name: companyName }).eq("id", profile.companyId);
  }

  const row = {
    company_id: profile.companyId,
    industry: String(formData.get("industry") || "").trim(),
    area: String(formData.get("area") || "").trim(),
    employee_count: String(formData.get("employeeCount") || "").trim(),
    website: String(formData.get("website") || "").trim(),
    product_service: String(formData.get("productService") || "").trim(),
    price_range: String(formData.get("priceRange") || "").trim(),
    current_marketing: String(formData.get("currentMarketing") || "").trim(),
    current_sales_method: String(formData.get("currentSalesMethod") || "").trim(),
    monthly_inquiries: toIntOrNull(formData.get("monthlyInquiries")),
    monthly_deals: toIntOrNull(formData.get("monthlyDeals")),
    monthly_orders: toIntOrNull(formData.get("monthlyOrders")),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("sales_profiles").upsert(row, { onConflict: "company_id" });

  if (error) {
    return { error: "保存に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/dashboard/sales-ai/profile");
  revalidatePath("/dashboard/sales-ai");
  return { saved: true };
}

export async function runDiagnosisAction(): Promise<void> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: profileRow } = await supabase
    .from("sales_profiles")
    .select(
      "industry, area, employee_count, website, product_service, price_range, current_marketing, current_sales_method, monthly_inquiries, monthly_deals, monthly_orders"
    )
    .eq("company_id", profile.companyId)
    .maybeSingle();

  const input: SalesProfileInput = {
    industry: profileRow?.industry ?? "",
    area: profileRow?.area ?? "",
    employeeCount: profileRow?.employee_count ?? "",
    website: profileRow?.website ?? "",
    productService: profileRow?.product_service ?? "",
    priceRange: profileRow?.price_range ?? "",
    currentMarketing: profileRow?.current_marketing ?? "",
    currentSalesMethod: profileRow?.current_sales_method ?? "",
    monthlyInquiries: profileRow?.monthly_inquiries ?? null,
    monthlyDeals: profileRow?.monthly_deals ?? null,
    monthlyOrders: profileRow?.monthly_orders ?? null,
  };

  const result = computeDiagnosis(input);

  const profileSummary = `業種:${input.industry || "未設定"} / 主力商品:${input.productService || "未設定"} / 現在の集客方法:${
    input.currentMarketing || "未設定"
  } / 現在の営業方法:${input.currentSalesMethod || "未設定"} / 月間問い合わせ:${input.monthlyInquiries ?? "-"}件 商談:${
    input.monthlyDeals ?? "-"
  }件 受注:${input.monthlyOrders ?? "-"}件`;

  const bottleneckSummary = await enhanceBottleneckSummary(profileSummary, result.bottleneckSummary);

  await supabase.from("sales_diagnoses").insert({
    company_id: profile.companyId,
    marketing_scores: result.marketingScores,
    sales_scores: result.salesScores,
    lead_scores: result.leadScores,
    bottleneck_category: result.bottleneckCategory,
    bottleneck_summary: bottleneckSummary,
    created_by: profile.id,
  });

  revalidatePath("/dashboard/sales-ai/profile");
  revalidatePath("/dashboard/sales-ai");
}
