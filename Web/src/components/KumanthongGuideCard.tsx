import Link from "next/link";
import Image from "next/image";
import { href, type Lang, type Dict } from "@/lib/i18n";
import { KMT_GUIDE_COVER } from "@/lib/kumanthong-guide";

/** การ์ดชวนเข้า "คู่มือเลี้ยงกุมารทอง" — ใช้ทั้งหน้าแรก (ท้ายสินค้ากุมารทอง) และหมวดบทความกุมารทอง */
export default function KumanthongGuideCard({
  lang,
  t,
  className = "",
}: {
  lang: Lang;
  t: Dict;
  className?: string;
}) {
  const g = t.kumanthongGuide;
  return (
    <Link
      href={href(lang, "/articles/kumanthong-guide")}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-gold/35 bg-gradient-to-r from-night-soft to-night transition hover:border-gold/60 sm:flex-row sm:items-center ${className}`}
    >
      {/* ปกตัวเดียวกับหน้าปกบนยูทูป — มือถือเต็มกว้าง จอใหญ่ชิดซ้าย */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-night sm:w-72 md:w-80">
        <Image
          src={KMT_GUIDE_COVER}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night/70 text-gold-light backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-crimson/90 group-hover:text-ivory">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5" aria-hidden>
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">
          {g.promoEyebrow}
        </p>
        <h3 className="font-heading mt-1 text-base font-bold leading-snug text-ivory transition group-hover:text-gold-light sm:text-lg">
          {g.promoTitle}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-smoke">{g.promoText}</p>
        <span className="mt-2 inline-block text-xs font-semibold text-gold transition group-hover:text-gold-light">
          {g.promoCta}
        </span>
      </div>
    </Link>
  );
}
