"use server";

import { requireHqAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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
