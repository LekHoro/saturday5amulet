import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseServer, supabaseConfigured } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import { AdminSidebarNav, AdminBottomNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "หลังร้าน",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) redirect("/admin/login");
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-night pb-24 text-ivory lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-night/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8" />
            <div className="font-heading font-bold text-gold">หลังร้าน เสาร์๕มหานิยม</div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="lg:flex">
        {/* เมนูข้างซ้ายสำหรับจอ desktop */}
        <aside className="hidden shrink-0 lg:block lg:w-60">
          <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-r border-gold/25 p-4">
            <AdminSidebarNav />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-night-soft/95 backdrop-blur lg:hidden">
        <AdminBottomNav />
      </nav>
    </div>
  );
}
