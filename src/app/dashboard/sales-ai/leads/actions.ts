"use server";

import { requireCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { scoreLead, buildApproachTexts, type LeadScoreInput } from "@/lib/salesAi/scoring";
import { enhanceLeadReason, enhanceApproachTexts } from "@/lib/salesAi/ai";
import { icpFromRow, LEAD_STATUSES, type DbIcpRow, type Icp, type LeadStatus } from "@/lib/salesAi/types";

async function getLatestIcp(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string): Promise<Icp | null> {
  const { data } = await supabase
    .from("icps")
    .select(
      "id, company_id, industry, employee_range, area, revenue_range, pain_points, features, decision_maker, buying_trigger, reasoning, created_at"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1);
  return data && data[0] ? icpFromRow(data[0] as DbIcpRow) : null;
}

async function scoreAndReason(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  lead: LeadScoreInput
): Promise<{ score: number; reason: string }> {
  const icp = await getLatestIcp(supabase, companyId);
  const computed = scoreLead(lead, icp);
  const leadSummary = `会社名:${lead.industry || "業種未設定"}の企業 / 所在地:${lead.area || "-"} / 従業員数:${
    lead.employeeCount || "-"
  } / 採用状況:${lead.hiringStatus || "-"} / 課題:${lead.painPoints || "-"}`;
  const reason = await enhanceLeadReason(leadSummary, computed.reason);
  return { score: computed.score, reason };
}

export interface CreateLeadState {
  error?: string;
}

export async function createLeadAction(_prev: CreateLeadState | null, formData: FormData): Promise<CreateLeadState> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "会社名は必須です。" };

  const leadInput: LeadScoreInput = {
    industry: String(formData.get("industry") || "").trim(),
    area: String(formData.get("area") || "").trim(),
    employeeCount: String(formData.get("employeeCount") || "").trim(),
    hiringStatus: String(formData.get("hiringStatus") || "").trim(),
    painPoints: String(formData.get("painPoints") || "").trim(),
    contactName: String(formData.get("contactName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
  };

  const { score, reason } = await scoreAndReason(supabase, profile.companyId!, leadInput);

  const { data, error } = await supabase
    .from("leads")
    .insert({
      company_id: profile.companyId,
      name,
      url: String(formData.get("url") || "").trim(),
      industry: leadInput.industry,
      area: leadInput.area,
      employee_count: leadInput.employeeCount,
      estimated_revenue: String(formData.get("estimatedRevenue") || "").trim(),
      contact_name: leadInput.contactName,
      contact_title: String(formData.get("contactTitle") || "").trim(),
      email: leadInput.email,
      phone: leadInput.phone,
      sns_url: String(formData.get("snsUrl") || "").trim(),
      hiring_status: leadInput.hiringStatus,
      pain_points: leadInput.painPoints,
      ai_score: score,
      score_reason: reason,
      status: "未接触",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "リードの登録に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/dashboard/sales-ai/leads");
  revalidatePath("/dashboard/sales-ai");
  redirect(`/dashboard/sales-ai/leads/${data.id}`);
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus): Promise<void> {
  const profile = await requireCompanyAdmin();
  if (!LEAD_STATUSES.includes(status)) return;
  const supabase = await createClient();

  await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("company_id", profile.companyId);

  revalidatePath("/dashboard/sales-ai/leads");
  revalidatePath(`/dashboard/sales-ai/leads/${leadId}`);
  revalidatePath("/dashboard/sales-ai");
}

export interface UpdateLeadState {
  error?: string;
  saved?: boolean;
}

export async function updateLeadDetailsAction(
  _prev: UpdateLeadState | null,
  formData: FormData
): Promise<UpdateLeadState> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();
  const leadId = String(formData.get("leadId") || "");
  if (!leadId) return { error: "リードが見つかりません。" };

  const dealAmountRaw = String(formData.get("dealAmount") || "").trim();
  const lastContactDateRaw = String(formData.get("lastContactDate") || "").trim();

  const { error } = await supabase
    .from("leads")
    .update({
      contact_name: String(formData.get("contactName") || "").trim(),
      contact_title: String(formData.get("contactTitle") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      next_action: String(formData.get("nextAction") || "").trim(),
      last_contact_date: lastContactDateRaw || null,
      deal_amount: dealAmountRaw ? Number(dealAmountRaw) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("company_id", profile.companyId);

  if (error) return { error: "更新に失敗しました。" };

  revalidatePath(`/dashboard/sales-ai/leads/${leadId}`);
  revalidatePath("/dashboard/sales-ai/leads");
  revalidatePath("/dashboard/sales-ai");
  return { saved: true };
}

export async function rescoreLeadAction(leadId: string): Promise<void> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("industry, area, employee_count, hiring_status, pain_points, contact_name, email, phone")
    .eq("id", leadId)
    .eq("company_id", profile.companyId)
    .maybeSingle();

  if (!lead) return;

  const { score, reason } = await scoreAndReason(supabase, profile.companyId!, {
    industry: lead.industry ?? "",
    area: lead.area ?? "",
    employeeCount: lead.employee_count ?? "",
    hiringStatus: lead.hiring_status ?? "",
    painPoints: lead.pain_points ?? "",
    contactName: lead.contact_name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
  });

  await supabase
    .from("leads")
    .update({ ai_score: score, score_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("company_id", profile.companyId);

  revalidatePath(`/dashboard/sales-ai/leads/${leadId}`);
  revalidatePath("/dashboard/sales-ai/leads");
}

export async function generateApproachTextAction(leadId: string): Promise<void> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("name, contact_name, contact_title, pain_points, score_reason")
    .eq("id", leadId)
    .eq("company_id", profile.companyId)
    .maybeSingle();

  if (!lead) return;

  const { data: profileRow } = await supabase
    .from("sales_profiles")
    .select("product_service")
    .eq("company_id", profile.companyId)
    .maybeSingle();

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.companyId)
    .single();

  const ruleBased = buildApproachTexts({
    companyName: company?.name || "",
    productService: profileRow?.product_service || "",
    leadName: lead.name,
    contactName: lead.contact_name || "",
    contactTitle: lead.contact_title || "",
    painPoints: lead.pain_points || "",
    scoreReason: lead.score_reason || "",
  });

  const context = `【自社】${company?.name || ""}(商品・サービス：${
    profileRow?.product_service || "未設定"
  })\n【アプローチ先】${lead.name}(担当:${lead.contact_name || "不明"} ${lead.contact_title || ""})\n【想定課題】${
    lead.pain_points || "不明"
  }\n【見込み度の根拠】${lead.score_reason || "-"}`;

  const finalTexts = await enhanceApproachTexts(context, ruleBased);

  await supabase.from("approach_texts").insert({
    lead_id: leadId,
    company_id: profile.companyId,
    email_subject: finalTexts.emailSubject,
    email_body: finalTexts.emailBody,
    form_message: finalTexts.formMessage,
    phone_script: finalTexts.phoneScript,
    first_meeting_script: finalTexts.firstMeetingScript,
    created_by: profile.id,
  });

  revalidatePath(`/dashboard/sales-ai/leads/${leadId}`);
}

export async function deleteLeadAction(leadId: string): Promise<void> {
  const profile = await requireCompanyAdmin();
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", leadId).eq("company_id", profile.companyId);
  revalidatePath("/dashboard/sales-ai/leads");
  revalidatePath("/dashboard/sales-ai");
  redirect("/dashboard/sales-ai/leads");
}
