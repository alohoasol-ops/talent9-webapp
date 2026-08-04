"use server";

import { createClient } from "@/lib/supabase/server";
import { loginIdToEmail } from "@/lib/slug";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const input = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!input || !password) {
    return { error: "ログインIDとパスワードを入力してください。" };
  }

  // 本部アカウントなど実メールアドレスで登録されている場合はそのまま、
  // 会社アカウントの場合は本部発行のログインIDを内部用メールアドレスに変換する
  const email = input.includes("@") ? input : loginIdToEmail(input);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "ログインに失敗しました。ログインIDとパスワードをご確認ください。" };
  }

  redirect("/");
}
