"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getDict, stripLang, href, type Lang } from "@/lib/i18n";

/** ปุ่มสลับ ไทย ⇄ EN — ชี้ไปหน้าเดียวกันในอีกภาษา (คง query string ไว้) */
function SwitcherInner({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = getDict(lang);
  const other: Lang = lang === "en" ? "th" : "en";
  const qs = searchParams.toString();
  const target = href(other, stripLang(pathname)) + (qs ? `?${qs}` : "");

  return (
    <Link
      href={target}
      aria-label={t.langSwitch.otherAria}
      className="shrink-0 rounded-lg border border-gold/30 px-2.5 py-1.5 text-xs font-semibold tracking-wide text-ivory/90 transition hover:border-gold hover:bg-gold/10 hover:text-gold-light"
    >
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
