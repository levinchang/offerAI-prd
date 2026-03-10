import type { Metadata } from "next";
import "./globals.css";
import CSiteNav from "@/components/C-site-nav";

export const metadata: Metadata = {
  title: "OfferAI",
  description: "校招与事业编信息表、面试资料与投递工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <CSiteNav />
        {children}
      </body>
    </html>
  );
}
