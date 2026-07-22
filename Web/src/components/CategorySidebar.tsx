"use client";

import { useState } from "react";
import Link from "next/link";

export interface SidebarItem {
  id: string;
  name: string;
  count: number;
}

export interface SidebarGroup {
  label: string;
  slug: string;
  items: SidebarItem[];
}

function Chevron() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gold transition-transform group-open:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FilterList({
  groups,
  active,
  total,
  onNavigate,
}: {
  groups: SidebarGroup[];
  active?: string;
  total: number;
  onNavigate?: () => void;
}) {
  // กางเฉพาะกลุ่มที่มีหมวดที่กำลังกรองอยู่ — ไม่มีตัวกรองให้กางกลุ่มแรก
  const openSlug = active
    ? groups.find((g) => g.items.some((i) => i.id === active))?.slug
    : groups[0]?.slug;

  return (
    <nav aria-label="ตัวกรองหมวดหมู่">
      <Link
        href="/products"
        onClick={onNavigate}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
          active
            ? "text-foreground hover:bg-night hover:text-gold-light"
            : "bg-gold/15 font-semibold text-gold-light"
        }`}
      >
        <span>ทั้งหมด</span>
        <span className="text-xs tabular-nums text-smoke">{total}</span>
      </Link>
      {groups.map((group) => (
        <details key={group.slug} className="group border-t border-gold/15" open={group.slug === openSlug}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-gold [&::-webkit-details-marker]:hidden">
            {group.label}
            <Chevron />
          </summary>
          <ul className="pb-2">
            {group.items.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={isActive ? "/products" : `/products?cat=${item.id}`}
                    onClick={onNavigate}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-gold/15 font-semibold text-gold-light"
                        : "text-foreground hover:bg-night hover:text-gold-light"
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs tabular-nums text-smoke">{item.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </nav>
  );
}

export default function CategorySidebar({
  groups,
  active,
  total,
}: {
  groups: SidebarGroup[];
  active?: string;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border border-gold/25 bg-night-soft p-3">
          <FilterList groups={groups} active={active} total={total} />
        </div>
      </aside>

      {/* Mobile: trigger + drawer */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-1.5 text-sm font-semibold text-gold transition hover:bg-gold/10 lg:hidden"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        ตัวกรอง
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="ตัวกรองหมวดหมู่">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-gold/25 bg-night-soft p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-lg font-semibold text-gold">ตัวกรอง</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิดตัวกรอง"
                className="rounded-lg p-1.5 text-smoke transition hover:bg-night hover:text-gold-light"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterList groups={groups} active={active} total={total} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
