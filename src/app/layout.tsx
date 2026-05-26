import type { Metadata } from "next";
import { Noto_Sans_KR, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

const serif = Nanum_Myeongjo({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "한글 알키오네",
  description: "한국어가 어떻게 조립되는지 발견하는 퍼즐 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
