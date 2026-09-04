import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getSiteData,
  getProductFullLang,
  cleanHtml,
  productPath,
  parseProductRef,
} from "@/lib/db";
import { lineChatUrl } from "@/lib/line";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { LineInquiryButton, LineBuyBarButton } from "@/components/LineButton";
import { ChatOpenButton } from "@/components/ChatWidget";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import LineQrBlock from "@/components/LineQrBlock";
import SectionHeading from "@/components/SectionHeading";
import { ImageFallback } from "@/components/icons";
import { coverImage, schemaImages } from "@/lib/media";
import { breadcrumbJsonLd, metaDescription, ownDescription } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

// prerender เฉพาะ URL ทางการ (id-ชื่อรุ่น) — URL เก่าที่ไม่มีท่อนชื่อเรนเดอร์ตอนขอ แล้ว 308 ไปตัวทางการ
export async function generateStaticParams() {
  const { products } = await getSiteData();
  return products.map((p) => ({ id: productPath(p).replace("/products/", "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langParam, id: ref } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const { id } = parseProductRef(decodeURIComponent(ref));
  const p = await getProductFullLang(id, lang);
  if (!p) return {};
  const title = p.meta.title || p.title;
  // คำโปรยที่เจ้าของเขียนเองใช้เต็ม ๆ — ไม่มีค่อยย่อจากรายละเอียดสินค้าให้
  const description = ownDescription(p.meta.description) ?? metaDescription(p.descriptionText);
  // แท็กที่เจ้าของใส่ไว้ = คีย์เวิร์ดของหน้านี้ด้วย (ต่อท้ายคีย์เวิร์ดที่กรอกเอง ไม่ซ้ำกัน)
  // ?? [] กัน snapshot เก่าใน cache ที่ยังไม่มีฟิลด์ tags (หมดอายุเองใน 5 นาที)
  const keywords = [
    ...(p.meta.keywords?.split(",") ?? []),
    ...(p.tags ?? []),
  ]
    .map((k) => k.trim())
    .filter((k, i, all) => k && all.indexOf(k) === i);
  // encodeURI — ท่อนชื่อเป็นภาษาไทย ต้องเข้ารหัสก่อนใส่ใน <link canonical> / header
  const path = encodeURI(productPath(p));
  return {
    title,
    description,
    keywords: keywords.length ? keywords.join(", ") : undefined,
    alternates: {
      canonical: href(lang, path),
      languages: { th: path, en: `/en${path}` },
    },
    openGraph: coverImage(p.images)
      ? { title, description, images: [coverImage(p.images)!] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: langParam, id: ref } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const decodedRef = decodeURIComponent(ref);
  const { id } = parseProductRef(decodedRef);
  const [data, p] = await Promise.all([getSiteData(lang), getProductFullLang(id, lang)]);
  if (!p) notFound();

  // เข้ามาด้วย URL เก่า (ไม่มีท่อนชื่อ หรือชื่อเก่าจาก igetweb) → 308 ไป URL ทางการชิ้นเดียวกัน
  const path = productPath(p);
  if (decodedRef !== path.replace("/products/", "")) permanentRedirect(encodeURI(l(path)));

  const related = data.products
    .filter(
      (x) =>
        x.id !== p.id &&
        !x.soldOut &&
        x.categories.some((c) => p.categories.some((pc) => pc.id === c.id))
    )
    .slice(0, 4);

  // อาจารย์ผู้จัดสร้างรุ่นนี้ (ถ้าอยู่ในแกน master)
  const master = data.masters.find((m) => p.categories.some((c) => c.id === m.catId));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    image: schemaImages(p.images, p.descriptionHtml),
    description: p.descriptionText ?? undefined,
    sku: p.sku ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: p.price ?? undefined,
      availability: p.soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  // เส้นทางเดียวกับ breadcrumb ที่เห็นบนหน้า
  const breadcrumb = breadcrumbJsonLd([
    { name: t.nav.home, path: l("/") },
    { name: t.products.fallbackTitle, path: l("/products") },
    ...(p.categories[0]
      ? [{ name: p.categories[0].name, path: l(`/products?cat=${p.categories[0].id}`) }]
      : []),
    { name: p.title },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={[jsonLd, breadcrumb]} />
      {/* breadcrumb */}
      <nav aria-label={t.product.breadcrumbAria} className="text-xs text-smoke">
        <Link href={l("/")} className="hover:text-gold-light">{t.nav.home}</Link>
        {" › "}
        <Link href={l("/products")} className="hover:text-gold-light">{t.products.fallbackTitle}</Link>
        {p.categories[0] && (
          <>
            {" › "}
            <Link href={l(`/products?cat=${p.categories[0].id}`)} className="hover:text-gold-light">
              {p.categories[0].name}
            </Link>
          </>
        )}
      </nav>

      {/* มือถือ: ชื่อรุ่นมาก่อนรูป (คนกดจากลิงก์แชร์ต้องรู้ทันทีว่าดูอะไรอยู่)
          จอใหญ่: แกลเลอรีซ้าย ชื่อ+ราคาขวา ตามเดิม — ใช้ grid จัดลำดับต่างกันสองบริบท */}
      <div className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2 md:gap-y-0">
        {/* header — h1 + อาจารย์ผู้สร้าง */}
        <div className="md:col-start-2 md:row-start-1">
          <h1 className="font-heading text-2xl font-bold leading-snug text-ivory sm:text-3xl">
            {p.title}
          </h1>

          {master && (
            <Link
              href={l(`/masters/${master.slug}`)}
              className="mt-2 inline-block text-sm font-semibold text-gold-light hover:text-gold hover:underline"
            >
              {t.product.byMaster(master.name)}
            </Link>
          )}
        </div>

        {/* gallery — กด thumbnail สลับรูป, กดรูปใหญ่ขยายเต็มจอ, รองรับวิดีโอ */}
        <div className="md:col-start-1 md:row-span-2 md:row-start-1">
          {p.images.length > 0 ? (
            <ProductGallery items={p.images} title={p.title} lang={lang} />
          ) : (
            <div className="aspect-[4/5] rounded-2xl bg-night">
              <ImageFallback className="text-6xl" />
            </div>
          )}
        </div>

        {/* info */}
        <div className="md:col-start-2 md:row-start-2">
          {/* buy box — ราคา + ปุ่มสั่งบูชา อยู่ด้วยกันเป็นโซนเดียว */}
          <div className="rounded-2xl border border-gold/20 bg-night-soft/60 p-5 md:mt-5">
            {p.soldOut ? (
              <>
                <span className="inline-block rounded-full bg-night px-4 py-1.5 text-sm font-semibold text-smoke ring-1 ring-smoke/40">
                  {t.product.soldOut}
                </span>
                <div className="mt-4">
                  <LineInquiryButton url={lineChatUrl(t.line.notify(p.title))} lang={lang} label={t.product.notifyLabel} />
                  <p className="mt-2.5 text-xs leading-relaxed text-smoke">
                    {t.product.notifyHint}
                  </p>
                  <ChatOpenButton lang={lang} variant="text" />
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-smoke">{t.product.priceLabel}</div>
                <div className="font-heading mt-0.5 text-3xl font-bold text-gold sm:text-4xl">
                  {p.priceText}
                </div>
                <div className="mt-4">
                  <LineInquiryButton url={lineChatUrl(t.line.inquiry(p.title))} lang={lang} label={t.product.inquireLabel} />
                  <p className="mt-2.5 text-xs leading-relaxed text-smoke">
                    {t.product.inquireHint}
                  </p>
                  <ChatOpenButton lang={lang} variant="text" />
                </div>
              </>
            )}
          </div>

          <dl className="mt-6 divide-y divide-gold/10 border-y border-gold/10 text-sm">
            {p.sku && (
              <div className="flex gap-3 py-2.5">
                <dt className="w-28 shrink-0 text-smoke">{t.product.sku}</dt>
                <dd className="text-ivory">{p.sku}</dd>
              </div>
            )}
            <div className="flex gap-3 py-2.5">
              <dt className="w-28 shrink-0 pt-0.5 text-smoke">{t.product.categories}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {p.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={l(`/products?cat=${c.id}`)}
                    className="rounded-full border border-gold/40 bg-night-soft px-2.5 py-0.5 text-xs transition hover:border-gold hover:text-gold-light"
                  >
                    {c.name}
                  </Link>
                ))}
              </dd>
            </div>
            {/* แท็ก — คำค้นที่เจ้าของใส่เอง กดแล้วไปหน้ารวมที่ค้นคำนั้นให้เลย */}
            {(p.tags ?? []).length > 0 && (
              <div className="flex gap-3 py-2.5">
                <dt className="w-28 shrink-0 pt-0.5 text-smoke">{t.product.tags}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={l(`/products?q=${encodeURIComponent(tag)}`)}
                      className="rounded-full border border-gold/20 bg-night px-2.5 py-0.5 text-xs text-smoke transition hover:border-gold/50 hover:text-gold-light"
                    >
                      #{tag}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
            {p.updatedAt && (
              <div className="flex gap-3 py-2.5">
                <dt className="w-28 shrink-0 text-smoke">{t.product.updatedAt}</dt>
                <dd className="text-ivory">{p.updatedAt}</dd>
              </div>
            )}
          </dl>

          {master && (
            <Link
              href={l(`/masters/${master.slug}`)}
              className="mt-5 inline-block text-sm font-semibold text-gold-light hover:text-gold hover:underline"
            >
              {t.product.allByMaster(master.name)}
            </Link>
          )}
        </div>
      </div>

      {/* description — คอลัมน์อ่าน จำกัดความกว้างให้บรรทัดไม่ยาวเกินสายตา */}
      {p.descriptionHtml && (
        <section className="mt-12">
          <SectionHeading>{t.product.details}</SectionHeading>
          <div
            className="legacy-content mt-6 max-w-3xl text-base"
            dangerouslySetInnerHTML={{ __html: cleanHtml(p.descriptionHtml) }}
          />
        </section>
      )}

      {/* ช่องทางร้าน — แทนแบนเนอร์ Add-Friend เก่าที่เคยฝังอยู่ท้าย description */}
      <section className="mt-12">
        <LineQrBlock lang={lang} />
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading>{t.product.related}</SectionHeading>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* buy-bar ติดขอบล่าง เฉพาะมือถือ — ราคากับปุ่มสั่งบูชาอยู่ในสายตาตลอด
          ไม่ต้องเลื่อนหารายละเอียดก่อนตัดสินใจ (ปุ่มแชทลอยงดแสดงบนหน้านี้ — ใช้ไอคอนใน buy-bar แทน)
          z-40 ต่ำกว่า lightbox ของแกลเลอรี (z-50) จะได้ไม่ลอยทับตอนขยายรูป */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-night-soft/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          {p.soldOut ? (
            <>
              <span className="rounded-full bg-night px-3 py-1 text-sm font-semibold text-smoke ring-1 ring-smoke/40">
                {t.products.soldOutBadge}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <ChatOpenButton lang={lang} variant="icon" />
                <LineBuyBarButton
                  url={lineChatUrl(t.line.notify(p.title))}
                  lang={lang}
                  label={t.product.notifyShort}
                />
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <div className="text-[11px] leading-tight text-smoke">{t.product.priceLabel}</div>
                <div className="font-heading truncate text-xl font-bold leading-tight text-gold">
                  {p.priceText}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ChatOpenButton lang={lang} variant="icon" />
                <LineBuyBarButton
                  url={lineChatUrl(t.line.inquiry(p.title))}
                  lang={lang}
                  label={t.product.buyBarLabel}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
