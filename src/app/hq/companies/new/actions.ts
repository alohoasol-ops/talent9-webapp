"use server";

import { requireHqAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { slugify, randomPassword } from "@/lib/slug";

export interface CreateCompanyState {
  error?: string;
  success?: {
    companyName: string;
    slug: string;
    adminEmail: string;
    adminPassword: string;
  };
}

export async function createCompanyAction(
  _prev: CreateCompanyState | null,
  formData: FormData
): Promise<CreateCompanyState> {
  await requireHqAdmin();

  const companyName = String(formData.get("companyName") || "").trim();
  const adminName = String(formData.get("adminName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim();

  if (!companyName || !adminEmail) {
    return { error: "会社名と管理者メールアドレスは必須です。" };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const slug = slugify(companyName);

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ name: companyName, slug })
    .select("id, name, slug")
    .single();

  if (companyError || !company) {
    return { error: "会社の作成に失敗しました。時間をおいて再度お試しください。" };
  }

  const password = randomPassword();

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
  });

  if (userError || !userData?.user) {
    // ロールバック: 会社だけ作られてユーザーが作れなかった場合は会社を削除しておく
    await supabase.from("companies").delete().eq("id", company.id);
    return { error: `管理者アカウントの作成に失敗しました：${userError?.message || "unknown error"}` };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    company_id: company.id,
    role: "company_admin",
    display_name: adminName || companyName,
  });

  if (profileError) {
    return { error: `プロフィールの作成に失敗しました：${profileError.message}` };
  }

  return {
    success: {
      companyName: company.name,
      slug: company.slug,
      adminEmail,
      adminPassword: password,
    },
  };
}
