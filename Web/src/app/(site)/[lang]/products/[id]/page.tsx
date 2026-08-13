import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData, getProductFullLang, cleanHtml } from "@/lib/db";
import { lineChatUrl } from "@/lib/line";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { LineInquiryButton } from "@/components/LineButton";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import LineQrBlock from "@/components/LineQrBlock";
import SectionHeading from "@/components/SectionHeading";
import { ImageFallback } from "@/components/icons";
import { coverImage, isVideoUrl } from "@/lib/media";
import { metaDescription } from "@/lib/seo";

export async function generateStaticParams() {
  const { products } = await getSiteData();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langParam, id } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const p = await getProductFullLang(id, lang);
  if (!p) return {};
  const title = p.meta.title || p.title;
  const description = metaDescription(p.meta.description, p.descriptionText);
  return {
    title,
    description,
    keywords: p.meta.keywords ?? undefined,
    alternates: {
      canonical: href(lang, `/products/${p.id}`),
      languages: { th: `/products/${p.id}`, en: `/en/products/${p.id}` },
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
  const { lang: langParam, id } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const [data, p] = await Promise.all([getSiteData(lang), getProductFullLang(id, lang)]);
  if (!p) notFound();

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
    image: p.images.filter((u) => !isVideoUrl(u)),
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* gallery — กด thumbnail สลับรูป, กดรูปใหญ่ขยายเต็มจอ, รองรับวิดีโอ */}
        <div>
          {p.images.length > 0 ? (
            <ProductGallery items={p.images} title={p.title} lang={lang} />
          ) : (
            <div className="aspect-[4/5] rounded-2xl bg-night">
              <ImageFallback className="text-6xl" />
            </div>
          )}
        </div>

        {/* info */}
        <div>
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

          {/* buy box — ราคา + ปุ่มสั่งบูชา อยู่ด้วยกันเป็นโซนเดียว */}
          <div className="mt-5 rounded-2xl border border-gold/20 bg-night-soft/60 p-5">
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
    </div>
  );
}
