import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface CurrentProfile {
  id: string;
  email: string | null;
  role: "hq_admin" | "company_admin";
  companyId: string | null;
  displayName: string | null;
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, company_id, display_name")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // 認証はできているがプロフィール未登録(セットアップ未完了)のケース
    redirect("/login?error=no_profile");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    companyId: profile.company_id,
    displayName: profile.display_name,
  };
}

export async function requireHqAdmin(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (profile.role !== "hq_admin") redirect("/dashboard");
  return profile;
}

export async function requireCompanyAdmin(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (profile.role !== "company_admin" || !profile.companyId) redirect("/hq");
  return profile;
}
