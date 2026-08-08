"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** ปุ่มแว่นขยายใน header — กดแล้วกางช่องค้นหาคลุมทั้งแถบ ส่งไป /products?q=… */
export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // ปิดแล้วคืน focus ให้ปุ่มแว่นขยาย — ไม่ปล่อยให้ focus หล่นไป body
  const close = () => {
    setOpen(false);
    openerRef.current?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (!value) return;
    router.push(`/products?q=${encodeURIComponent(value)}`);
    close();
  };

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="ค้นหาวัตถุมงคล"
        className="shrink-0 rounded-lg p-2 text-ivory transition hover:bg-gold/10 hover:text-gold-light"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>

      {open && (
        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="absolute inset-0 z-10 flex items-center gap-2 bg-night px-4"
        >
          <input
            ref={inputRef}
            type="search"
            placeholder="ค้นหาชื่อรุ่น เกจิอาจารย์ หรือหมวดหมู่…"
            aria-label="ค้นหาวัตถุมงคล"
            className="min-w-0 flex-1 rounded-lg border border-gold/30 bg-night-soft px-3 py-2 text-sm text-ivory placeholder:text-smoke/80 focus:border-gold/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/25"
          >
            ค้นหา
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="ปิดค้นหา"
            className="shrink-0 rounded-lg p-2 text-smoke transition hover:bg-gold/10 hover:text-gold-light"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </form>
      )}
    </>
  );
}
