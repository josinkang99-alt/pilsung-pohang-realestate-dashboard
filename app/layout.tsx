import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "필승부동산 | 포항 아파트 브리핑",
  description: "포항시 동별 아파트 실거래·시장지표·입지분석 대시보드",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
