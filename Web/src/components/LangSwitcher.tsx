"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getDict, stripLang, href, type Lang } from "@/lib/i18n";

/* ธงเป็น SVG ในไฟล์ — ธง emoji แสดงไม่ได้บน Windows */

function ThaiFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} aria-hidden="true">
      <rect width="900" height="600" fill="#A51931" />
      <rect y="100" width="900" height="400" fill="#F4F5F8" />
      <rect y="200" width="900" height="200" fill="#2D2A4A" />
    </svg>
  );
}

function UsFlag({ className }: { className?: string }) {
  // แถบขาว 6 แถบบนพื้นแดง 13 แถบ (ความสูงแถบละ 100/13) + ผืนน้ำเงินมุมบน — ดาววาดไม่ไหวที่ขนาดนี้
  return (
    <svg viewBox="0 0 190 100" className={className} aria-hidden="true">
      <rect width="190" height="100" fill="#B22234" />
      <path
        d="M0,11.54h190M0,26.92h190M0,42.31h190M0,57.69h190M0,73.08h190M0,88.46h190"
        stroke="#fff"
        strokeWidth="7.69"
      />
      <rect width="76" height="53.85" fill="#3C3B6E" />
    </svg>
  );
}

/** ปุ่มสลับ ไทย ⇄ EN — ธง+ชื่อภาษาปลายทาง ชี้ไปหน้าเดียวกันในอีกภาษา (คง query string ไว้) */
function SwitcherInner({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = getDict(lang);
  const other: Lang = lang === "en" ? "th" : "en";
  const qs = searchParams.toString();
  const target = href(other, stripLang(pathname)) + (qs ? `?${qs}` : "");
  const Flag = other === "th" ? ThaiFlag : UsFlag;

  return (
    <Link
      href={target}
      aria-label={t.langSwitch.otherAria}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gold/30 px-2.5 py-1.5 text-xs font-semibold tracking-wide text-ivory/90 transition hover:border-gold hover:bg-gold/10 hover:text-gold-light"
    >
      <Flag className="h-3 w-[18px] shrink-0 rounded-[2px] ring-1 ring-ivory/20" />
      {t.langSwitch.other}
    </Link>
  );
}

export default function LangSwitcher({ lang }: { lang: Lang }) {
  // useSearchParams ต้องมี Suspense ครอบตอน prerender
  return (
    <Suspense fallback={null}>
      <SwitcherInner lang={lang} />
    </Suspense>
  );
}
