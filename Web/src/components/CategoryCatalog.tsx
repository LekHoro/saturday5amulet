import Link from "next/link";
import Image from "next/image";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import { getDict, href, type Lang } from "@/lib/i18n";

// แคตตาล็อกหน้ารวมสินค้า — หมวดละหนึ่งแถวเลื่อนแนวนอน
// หมวดตามประเภท: หัวข้อ + รูปหมวดกลม แล้วแถวสินค้า
// หมวดตามพุทธคุณ: การ์ดคำโปรยสีประจำหมวดนำหน้าแถว (คนที่ยังไม่รู้จะเลือกอะไรอ่านแล้วเลือกถูก)

export type CatalogAccent = "gold" | "ember" | "crimson";

export interface CatalogSection {
  id: string;
  name: string;
  total: number;
  /** รูปประจำหมวด (ตั้งเองใน /admin/settings หรือหยิบจากสินค้าอัตโนมัติ) */
  image: string | null;
  /** มีค่าเฉพาะหมวดพุทธคุณ — แสดงการ์ดคำโปรยนำหน้าแถว */
  accent?: CatalogAccent;
  items: ProductCardData[];
}

const PANEL: Record<CatalogAccent, { panel: string; heading: string; cta: string }> = {
  gold: {
    panel: "border-gold/35 bg-gradient-to-br from-brown-gold to-[#191207]",
    heading: "text-gold-light",
    cta: "text-gold-light",
  },
  ember: {
    panel: "border-ember/45 bg-gradient-to-br from-[#4d2415] to-[#2a140c]",
    heading: "text-[#f0a077]",
    cta: "text-[#f0a077]",
  },
  crimson: {
    panel: "border-crimson/70 bg-gradient-to-br from-crimson-deep to-[#340a0a]",
    heading: "text-[#e8a0a0]",
    cta: "text-[#e8a0a0]",
  },
};

function Arrow() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function CategoryCatalog({
  sections,
  totalProducts,
  lang,
}: {
  sections: CatalogSection[];
  totalProducts: number;
  lang: Lang;
}) {
  const t = getDict(lang);
  const catHref = (id: string) => `${href(lang, "/products")}?cat=${id}`;

  return (
    <div className="min-w-0 flex-1">
      {/* ค้นหาแบบไม่ง้อ JS — ส่ง q แล้วหน้าเดียวกันสลับไปโหมดผลค้นหา */}
      <form action={href(lang, "/products")} className="flex gap-2.5">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg className="h-4 w-4 text-smoke" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            name="q"
            placeholder={t.nav.searchPlaceholder}
            aria-label={t.nav.searchAria}
            className="w-full rounded-lg border border-gold/30 bg-night-soft py-2 pl-9 pr-3 text-sm text-ivory placeholder:text-smoke/80 focus:border-gold/60 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-gold/40 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/10"
        >
          {t.catalog.searchButton}
        </button>
      </form>

      {sections.map((s) => {
        const headingId = `cat-${s.id}`;
        const p = s.accent ? PANEL[s.accent] : null;
        return (
          <section key={s.id} aria-labelledby={headingId} className="mt-8 first:mt-7">
            {/* หมวดตามประเภท — หัวข้อบรรทัดเดียว (หมวดพุทธคุณใช้การ์ดคำโปรยแทน) */}
            {!p && (
              <div className="flex items-center justify-between gap-3 pb-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {s.image && (
                    // แนวนอนพอให้เห็นรูปประจำหมวดที่เจ้าของตั้งเอง (วงกลม 36px เดิมเล็กจนดูไม่ออกว่าเปลี่ยนรูปแล้ว)
                    <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-gold/30">
                      <Image src={s.image} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                  )}
                  {/* truncate ต้องอยู่ที่ span — globals.css ตั้ง text-wrap: balance ให้ h2 ทับ nowrap ของ h2 เอง */}
                  <h2 id={headingId} className="font-heading min-w-0 text-lg font-semibold text-gold sm:text-xl">
                    <span className="block truncate">{s.name}</span>
                  </h2>
                  {/* จำนวนซ้ำกับปุ่ม "ดูทั้งหมด (n)" — จอเล็กเอาออกไม่ให้หัวข้อแน่น */}
                  <span className="hidden shrink-0 text-xs text-smoke sm:inline">{t.home.items(s.total)}</span>
                </div>
                <Link
                  href={catHref(s.id)}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold transition hover:text-gold-light"
                >
                  {t.catalog.viewAll(s.total)}
                  <Arrow />
                </Link>
              </div>
            )}

            {/* แถวเลื่อน — ปัดต่อทางขวาได้ทั้งเมาส์ ทัช และคีย์บอร์ด */}
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0">
              {p && (
                <li className="w-[15rem] shrink-0 snap-start sm:w-[16rem]">
                  <div className={`relative flex h-full flex-col justify-center overflow-hidden rounded-xl border p-4 ${p.panel}`}>
                    {/* รูปหมวดเป็นพื้นหลังจาง ๆ — คุมให้จางพอที่คำโปรยยังอ่านชัด */}
                    {s.image && (
                      <>
                        <Image src={s.image} alt="" fill sizes="256px" className="object-cover opacity-[0.13]" />
                        <div className="absolute inset-0 bg-gradient-to-br from-night/75 to-night/35" />
                      </>
                    )}
                    <div className="relative">
                      <h2 id={headingId} className={`font-heading text-lg font-semibold leading-snug ${p.heading}`}>
                        <span className="line-clamp-2">{s.name}</span>
                      </h2>
                      <p className="mt-0.5 text-xs text-ivory/70">{t.home.items(s.total)}</p>
                      {t.catalog.leads[s.id] && (
                        <p className="mt-2 text-xs leading-relaxed text-ivory/80">{t.catalog.leads[s.id]}</p>
                      )}
                      <Link
                        href={catHref(s.id)}
                        className={`mt-3 inline-flex items-center gap-1 text-sm font-bold ${p.cta} hover:underline`}
                      >
                        {t.catalog.viewAll(s.total)}
                        <Arrow />
                      </Link>
                    </div>
                  </div>
                </li>
              )}
              {s.items.map((item) => (
                <li key={item.id} className="w-[10.5rem] shrink-0 snap-start sm:w-[12rem]">
                  <ProductCard product={item} lang={lang} />
                </li>
              ))}
              {/* การ์ดปิดท้ายแถว — ปัดจนสุดแล้วไปต่อได้เลย ไม่ต้องเลื่อนกลับขึ้นไปกดหัวข้อ */}
              <li className="w-[10.5rem] shrink-0 snap-start sm:w-[12rem]">
                <Link
                  href={catHref(s.id)}
                  className="flex h-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gold/40 px-3 text-center transition hover:border-gold hover:bg-night-soft"
                >
                  <span className="text-sm font-semibold text-gold-light">{t.catalog.viewAll(s.total)}</span>
                  <span className="text-xs text-smoke">{s.name}</span>
                </Link>
              </li>
            </ul>
          </section>
        );
      })}

      <div className="mt-10 text-center">
        <Link
          href={`${href(lang, "/products")}?all=1`}
          className="inline-block rounded-full border border-gold/40 px-7 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/10"
        >
          {t.catalog.allProducts(totalProducts)}
        </Link>
        <p className="mt-1.5 text-xs text-smoke">{t.catalog.allProductsHint}</p>
      </div>
    </div>
  );
}
