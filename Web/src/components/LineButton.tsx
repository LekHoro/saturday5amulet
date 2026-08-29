"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { lineChatUrl } from "@/lib/line";
import { getDict, stripLang, type Lang } from "@/lib/i18n";
import LineLink from "./LineLink";

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.03 3.58 7.4 8.42 8.04.33.07.77.22.89.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.02.89.56 1.1-.47 5.92-3.49 8.08-5.97C21.66 13.4 22 11.83 22 10.13 22 5.64 17.52 2 12 2zM7.9 12.8H5.87a.53.53 0 0 1-.53-.53V8.2a.53.53 0 0 1 1.06 0v3.54H7.9a.53.53 0 0 1 0 1.06zm1.9-.53a.53.53 0 0 1-1.06 0V8.2a.53.53 0 0 1 1.06 0v4.07zm4.9 0a.53.53 0 0 1-.36.5.54.54 0 0 1-.6-.17l-2.08-2.83v2.5a.53.53 0 0 1-1.06 0V8.2a.53.53 0 0 1 .96-.32l2.08 2.84V8.2a.53.53 0 0 1 1.06 0v4.07zm3.32-2.57a.53.53 0 0 1 0 1.06h-1.5v.98h1.5a.53.53 0 0 1 0 1.06h-2.03a.53.53 0 0 1-.53-.53V8.2c0-.29.24-.53.53-.53h2.03a.53.53 0 0 1 0 1.06h-1.5v.97h1.5z" />
    </svg>
  );
}

export function FloatingLineButton({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const pathname = usePathname();
  // มือถือจอแคบ ปุ่มเต็มแถบบังราคาการ์ดมุมล่างขวาระหว่างเลื่อน — เริ่ม scroll แล้วหดเหลือไอคอนกลม
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // หน้า "วิธีสั่งบูชา" มี CTA/ชิป/QR ของ LINE เต็มหน้าอยู่แล้ว — ปุ่มลอยซ้ำซ้อน
  // และบนมือถือมันทับปุ่ม "เริ่มแชทกับทางร้าน" ท้ายหน้าพอดี
  if (stripLang(pathname) === "/how-to-order") return null;

  return (
    <LineLink
      href={lineChatUrl(t.line.floatingGreeting)}
      lang={lang}
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 flex items-center rounded-full bg-line-green text-white shadow-lg shadow-black/30 transition-all hover:scale-105 ${
        collapsed ? "gap-0 p-3.5 sm:gap-2 sm:px-5 sm:py-3" : "gap-2 px-5 py-3"
      }`}
      ariaLabel={t.line.floatingAria}
    >
      <LineIcon className="h-6 w-6" />
      <span className={`whitespace-nowrap font-semibold ${collapsed ? "hidden sm:inline" : ""}`}>
        {t.line.floatingLabel}
      </span>
    </LineLink>
  );
}

export function LineInquiryButton({ url, lang, label }: { url: string; lang: Lang; label: string }) {
  return (
    <LineLink
      href={url}
      lang={lang}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-line-green px-6 py-4 text-lg font-bold text-white shadow-md transition hover:brightness-110 sm:w-auto"
    >
      <LineIcon className="h-6 w-6" />
      {label}
    </LineLink>
  );
}
