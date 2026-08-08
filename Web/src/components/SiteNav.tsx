"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavChild {
  href: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavChild[];
}

export interface NavItem {
  href: string;
  label: string;
  /** ถ้ามี — เมนูนี้กางเป็น dropdown (แบ่งเป็นกลุ่ม ๆ) */
  groups?: NavGroup[];
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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

function DropdownNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  // ตำแหน่งแบบ fixed — nav เป็น overflow-x-auto เลยวาง absolute ในตัวไม่ได้ (โดน clip)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelWidth = Math.min(320, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8));
    setPos({ top: rect.bottom + 6, left });
  };

  const toggle = () => {
    if (!open) place();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScrollOrResize = () => place();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-gold/10 hover:text-gold-light ${
          open ? "bg-gold/10 text-gold-light" : ""
        }`}
      >
        {item.label}
        <Chevron open={open} />
      </button>
      {open && pos && (
        <div
          ref={panelRef}
          role="menu"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 max-h-[70vh] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border border-gold/30 bg-night-soft p-2 text-ivory shadow-xl shadow-black/40"
        >
          <Link
            href={item.href}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/10"
          >
            ดู{item.label}ทั้งหมด →
          </Link>
          {item.groups!.map((group) => (
            <div key={group.label} className="mt-1 border-t border-gold/15 pt-1">
              {group.label && (
                <div className="px-3 py-1.5 text-xs font-semibold tracking-wide text-gold">
                  {group.label}
                </div>
              )}
              <ul>
                {group.items.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-1.5 text-sm transition hover:bg-gold/10 hover:text-gold-light"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      key={pathname}
      className="flex items-center gap-1 overflow-x-auto text-sm sm:gap-2 sm:text-base [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) =>
        item.groups?.length ? (
          <DropdownNavItem key={item.href} item={item} />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-gold/10 hover:text-gold-light"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
