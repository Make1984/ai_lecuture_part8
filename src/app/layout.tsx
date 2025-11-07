import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "表現の正当性チェックAI",
  description: "Webサイトの内容をAIで採点します",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
