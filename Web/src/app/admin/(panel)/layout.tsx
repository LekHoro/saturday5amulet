import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer, supabaseConfigured } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "หลังร้าน",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "หน้าหลัก", icon: "🏠" },
  { href: "/admin/products", label: "วัตถุมงคล", icon: "📿" },
  { href: "/admin/articles", label: "บทความ", icon: "📄" },
  { href: "/admin/masters", label: "อาจารย์", icon: "🙏" },
  { href: "/admin/settings", label: "ตั้งค่า", icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) redirect("/admin/login");
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-night pb-24 text-ivory">
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-night/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="font-heading font-bold text-gold">หลังร้าน เสาร์๕มหานิยม</div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>

      {/* เมนูล่างแบบมือถือ — ปุ่มใหญ่กดง่าย */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-night-soft/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-xs text-smoke transition hover:text-gold-light"
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
