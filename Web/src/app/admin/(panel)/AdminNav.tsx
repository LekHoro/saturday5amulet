"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "หน้าหลัก", icon: "🏠" },
  { href: "/admin/products", label: "วัตถุมงคล", icon: "📿" },
  { href: "/admin/articles", label: "บทความ", icon: "📄" },
  { href: "/admin/masters", label: "อาจารย์", icon: "🙏" },
  { href: "/admin/settings", label: "ตั้งค่า", icon: "⚙️" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** เมนูข้างซ้ายสำหรับจอ desktop */
export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-gold/15 text-gold"
                : "text-smoke hover:bg-gold/10 hover:text-gold-light"
            }`}
          >
            <span aria-hidden className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** เมนูล่างแบบมือถือ — ปุ่มใหญ่กดง่าย */
export function AdminBottomNav() {
  const pathname = usePathname();
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-5">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs transition ${
              active ? "text-gold" : "text-smoke hover:text-gold-light"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
