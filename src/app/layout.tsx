import type { Metadata } from "next";
import { Prompt, Anuphan } from "next/font/google";
import Link from "next/link";
import { FloatingLineButton } from "@/components/LineButton";
import { LINE_ID } from "@/lib/line";
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

export const metadata: Metadata = {
  title: {
    default: "เสาร์๕มหานิยม - Saturday5Amulet วัตถุมงคล เครื่องราง กุมารทอง",
    template: "%s | เสาร์๕มหานิยม",
  },
  description:
    "เสาร์๕มหานิยม โดยแม่หมอสายมู อาจารย์เล็กเสาร์ห้า วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง พร้อมวิธีบูชาและคาถา",
};

const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "วัตถุมงคลและเครื่องราง" },
  { href: "/articles", label: "บทความ" },
  { href: "/how-to-order", label: "วิธีสั่งบูชา" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${anuphan.variable} antialiased`}>
        <header className="sticky top-0 z-40 border-b border-gold/25 bg-night/90 text-ivory shadow-md backdrop-blur">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold text-gold-light sm:text-2xl">
                เสาร์๕มหานิยม
              </span>
              <span className="hidden text-xs tracking-widest text-smoke sm:inline">SATURDAY5AMULET</span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto text-sm sm:gap-2 sm:text-base">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-gold/10 hover:text-gold-light"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="mt-16 border-t border-gold/20 bg-night-soft px-4 py-10 text-ivory/80">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
            <div>
              <div className="font-heading text-lg font-bold text-gold-light">เสาร์๕มหานิยม</div>
              <p className="mt-2 text-sm leading-relaxed">
                วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง
                โดยแม่หมอสายมู อาจารย์เล็กเสาร์ห้า
              </p>
            </div>
            <div>
              <div className="font-heading font-semibold text-ivory">เมนู</div>
              <ul className="mt-2 space-y-1 text-sm">
                {navItems.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="hover:text-gold-light">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-heading font-semibold text-ivory">ติดต่อ</div>
              <p className="mt-2 text-sm">
                Line: {LINE_ID}
                <br />
                เปิดทุกวัน ตอบแชทเร็ว
              </p>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-6xl border-t border-ivory/10 pt-4 text-center text-xs text-ivory/50">
            © {new Date().getFullYear()} Saturday5Amulet.com
          </div>
        </footer>

        <FloatingLineButton />
      </body>
    </html>
  );
}
