"use server";

import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { buildIcp, type SalesProfileInput } from "@/lib/salesAi/scoring";
import { enhanceIcpReasoning } from "@/lib/salesAi/ai";

export async function generateIcpAction(): Promise<void> {
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

  const icp = buildIcp(input);

  const profileSummary = `業種:${input.industry || "未設定"} / 商品:${input.productService || "未設定"}(${
    input.priceRange || "価格未設定"
  }) / 現在の集客:${input.currentMarketing || "未設定"} / 現在の営業:${input.currentSalesMethod || "未設定"}`;

  const reasoning = await enhanceIcpReasoning(profileSummary, icp.reasoning);

  await supabase.from("icps").insert({
    company_id: profile.companyId,
    industry: icp.industry,
    employee_range: icp.employeeRange,
    area: icp.area,
    revenue_range: icp.revenueRange,
    pain_points: icp.painPoints,
    features: icp.features,
    decision_maker: icp.decisionMaker,
    buying_trigger: icp.buyingTrigger,
    reasoning,
    created_by: profile.id,
  });

  revalidatePath("/dashboard/sales-ai/icp");
  revalidatePath("/dashboard/sales-ai");
}
