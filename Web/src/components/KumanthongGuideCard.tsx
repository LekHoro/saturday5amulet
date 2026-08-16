import Link from "next/link";
import Image from "next/image";
import { href, type Lang, type Dict } from "@/lib/i18n";
import { KMT_GUIDE_COVER, KMT_GUIDE_CHAPTERS } from "@/lib/kumanthong-guide";

/** จำนวนหัวข้อที่โชว์เป็นชิปในบล็อกไฮไลท์ — ที่เหลือรวบเป็นชิป "+N หัวข้อ" */
const PREVIEW_CHAPTERS = 6;

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

/** ฉบับใหญ่สำหรับหน้าแรก — คลิปนี้คนดูเยอะที่สุด เลยให้เป็นบล็อกเต็มแถบของตัวเอง
 *  ปกใหญ่ + สารบัญบางส่วน เพื่อให้เห็นตั้งแต่หน้าแรกว่าในคลิปตอบอะไรบ้าง */
export function KumanthongGuideFeature({ lang, t }: { lang: Lang; t: Dict }) {
  const g = t.kumanthongGuide;
  const guideHref = href(lang, "/articles/kumanthong-guide");
  const chapters = KMT_GUIDE_CHAPTERS.slice(0, PREVIEW_CHAPTERS);
  const rest = KMT_GUIDE_CHAPTERS.length - chapters.length;

  return (
    <section className="border-y border-gold/20 bg-gradient-to-b from-night-soft to-night">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid items-center gap-7 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          {/* ปก 16:9 ตัวเดียวกับบนยูทูป — ใหญ่เต็มคอลัมน์ ให้เห็นแต่ไกลว่าเป็นวิดีโอ */}
          <Link
            href={guideHref}
            aria-label={g.title}
            className="group relative block aspect-video overflow-hidden rounded-2xl border border-gold/30 bg-night shadow-xl shadow-black/40 transition hover:border-gold/60"
          >
            <Image
              src={KMT_GUIDE_COVER}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 680px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-night/70 text-gold-light shadow-lg backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-crimson/90 group-hover:text-ivory sm:h-20 sm:w-20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 sm:h-9 sm:w-9" aria-hidden>
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              </span>
            </span>
          </Link>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">
              {g.eyebrow}
            </p>
            <h2 className="font-heading mt-2 text-2xl font-bold leading-snug text-gold-light sm:text-3xl">
              {g.title}
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ivory/80">{g.promoText}</p>

            {/* ตัวอย่างสารบัญ — บอกว่าในคลิปตอบคำถามแนวไหน (กดเลือกทีละหัวข้อได้ในหน้าคู่มือ) */}
            <ul className="mt-5 flex flex-wrap gap-2">
              {chapters.map((c) => (
                <li
                  key={c.start}
                  className="rounded-full border border-gold/20 bg-night/60 px-3 py-1 text-xs text-ivory/75"
                >
                  {lang === "en" ? c.nameEn : c.name}
                </li>
              ))}
              {rest > 0 && (
                <li className="rounded-full border border-gold/35 px-3 py-1 text-xs font-semibold text-gold">
                  +{g.chapterCountBadge(rest)}
                </li>
              )}
            </ul>

            <Link
              href={guideHref}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-bold text-night shadow-lg shadow-gold/20 transition hover:brightness-110"
            >
              {g.promoCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
