export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "company"}-${suffix}`;
}

const LOGIN_ID_SUFFIX = "@login.invalid";

export function sanitizeLoginId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function loginIdToEmail(id: string): string {
  return `${id}${LOGIN_ID_SUFFIX}`;
}

export function emailToLoginId(email: string): string {
  return email.endsWith(LOGIN_ID_SUFFIX) ? email.slice(0, -LOGIN_ID_SUFFIX.length) : email;
}

export function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}
