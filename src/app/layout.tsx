import type { Metadata } from "next";
import { Prompt, Anuphan } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import "./globals.css";

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

const title = "เสาร์๕มหานิยม - Saturday5Amulet วัตถุมงคล เครื่องราง กุมารทอง";
const description =
  "เสาร์๕มหานิยม โดยแม่หมอสายมู อาจารย์เล็กเสาร์ห้า วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง พร้อมวิธีบูชาและคาถา";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | เสาร์๕มหานิยม",
  },
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "/",
    siteName: SITE_NAME,
    title,
    description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${anuphan.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
