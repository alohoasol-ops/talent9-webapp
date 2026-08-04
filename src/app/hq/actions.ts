"use server";

import { requireHqAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { randomPassword, emailToLoginId } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export async function deleteCompanyAction(companyId: string) {
  await requireHqAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", companyId);

  for (const p of profiles || []) {
    await admin.auth.admin.deleteUser(p.id);
  }

  await supabase.from("companies").delete().eq("id", companyId);

  revalidatePath("/hq");
}

export async function resetCompanyPasswordAction(
  companyId: string
): Promise<{ loginId: string; password: string } | { error: string }> {
  await requireHqAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", companyId)
    .limit(1)
    .single();

  if (!profile) {
    return { error: "この会社の管理者アカウントが見つかりませんでした。" };
  }

  const password = randomPassword();
  const { data: userData, error } = await admin.auth.admin.updateUserById(profile.id, { password });

  if (error || !userData?.user?.email) {
    return { error: "パスワードの再発行に失敗しました。時間をおいて再度お試しください。" };
  }

  return { loginId: emailToLoginId(userData.user.email), password };
}
