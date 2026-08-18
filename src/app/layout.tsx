import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "9タレントマップ",
  description: "複数会社・複数メンバーの9才能スコアを管理する9タレントマップ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
