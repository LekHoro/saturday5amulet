"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
      className="hidden items-center gap-1 overflow-x-auto text-sm lg:flex xl:gap-2 xl:text-base [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

/** เมนูมือถือ/แท็บเล็ต — hamburger เปิด drawer ฝั่งขวา เห็นครบทุกเมนู (แถวเมนูเดิมล้นจอจนเมนูท้ายหาย) */
export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // เปลี่ยนหน้าแล้วปิด drawer (ปรับ state ระหว่าง render — ไม่ใช้ effect)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        aria-expanded={open}
        className="rounded-lg p-2 text-ivory transition hover:bg-gold/10 hover:text-gold-light"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* portal ออกนอก header — backdrop-blur บน header ทำให้ fixed ของลูกยึดกับ header ไม่ใช่ viewport */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="เมนูหลัก">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto border-l border-gold/25 bg-night-soft p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-lg font-semibold text-gold">เมนู</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิดเมนู"
                className="rounded-lg p-1.5 text-smoke transition hover:bg-night hover:text-gold-light"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav>
              {items.map((item) =>
                item.groups?.length ? (
                  <details key={item.href} className="group border-t border-gold/15">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 font-semibold text-ivory [&::-webkit-details-marker]:hidden">
                      {item.label}
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
                    </summary>
                    <div className="pb-2">
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-gold-light hover:bg-gold/10"
                      >
                        ดู{item.label}ทั้งหมด →
                      </Link>
                      {item.groups.map((g) => (
                        <div key={g.label || item.href}>
                          {g.label && (
                            <div className="px-3 py-1.5 text-xs font-semibold tracking-wide text-gold">
                              {g.label}
                            </div>
                          )}
                          <ul>
                            {g.items.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className="block rounded-lg px-3 py-1.5 text-sm text-ivory/90 hover:bg-gold/10 hover:text-gold-light"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-3 font-semibold transition first:border-0 border-t border-gold/15 ${
                      pathname === item.href
                        ? "bg-gold/15 text-gold-light"
                        : "text-ivory hover:bg-gold/10 hover:text-gold-light"
                    }`}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
