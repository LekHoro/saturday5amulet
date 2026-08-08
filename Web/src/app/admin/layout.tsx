import type { Metadata } from "next";
import { Prompt, Anuphan } from "next/font/google";
import "../globals.css";

// root layout ของฝั่ง /admin — หลังร้านเป็นภาษาไทยอย่างเดียว
// (ฝั่งหน้าเว็บมี root layout ของตัวเองที่ (site)/[lang]/layout.tsx)

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
});

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: "หลังร้าน เสาร์๕มหานิยม",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${anuphan.variable} antialiased`}>{children}</body>
    </html>
  );
}
