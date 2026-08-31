import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData, getArticleFullLang, cleanHtml } from "@/lib/db";
import { articleRelatedProducts } from "@/lib/data";
import { lineChatUrl } from "@/lib/line";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { LineInquiryButton } from "@/components/LineButton";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { coverImage, isVideoUrl } from "@/lib/media";
import { breadcrumbJsonLd, metaDescription } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ArticleViewPing from "@/components/ArticleViewPing";

export async function generateStaticParams() {
  const { articles, news } = await getSiteData();
  return [...articles, ...news].map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langParam, id } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const a = await getArticleFullLang(id, lang);
  if (!a) return {};
  const description = metaDescription(a.contentText, a.meta.description);
  return {
    title: a.title,
    description,
    alternates: {
      canonical: href(lang, `/articles/${a.id}`),
      languages: { th: `/articles/${a.id}`, en: `/en/articles/${a.id}` },
    },
    openGraph: coverImage(a.images)
      ? { title: a.title, description, images: [coverImage(a.images)!] }
      : undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: langParam, id } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const a = await getArticleFullLang(id, lang);
  if (!a) notFound();

  // สะพานบทความ → สินค้า: จับคู่จากฉบับไทยเสมอ (ฝั่ง /en ชื่อบทความ/อาจารย์ถูกแปลแล้ว)
  const data = await getSiteData(lang);
  const aTh = lang === "th" ? a : await getArticleFullLang(id, "th");
  const { products: related, master, kuman } = aTh
    ? articleRelatedProducts(data, aTh)
    : { products: [], master: null, kuman: false };
  const browseAll = master
    ? { href: l(`/masters/${master.slug}`), label: t.articles.viewMasterAll(master.name) }
    : kuman && related.length > 0
      ? { href: l("/products?cat=8647"), label: t.articles.viewKumanAll }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    image: a.images.filter((u) => !isVideoUrl(u)),
    articleSection: a.categories[0]?.name,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: t.nav.home, path: l("/") },
    { name: t.articles.breadcrumb, path: l("/articles") },
    { name: a.title },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd data={[jsonLd, breadcrumb]} />
      <ArticleViewPing id={a.id} />
      <nav className="text-xs text-smoke/80">
        <Link href={l("/")} className="hover:text-gold-light">{t.nav.home}</Link>
        {" › "}
        <Link href={l("/articles")} className="hover:text-gold-light">{t.articles.breadcrumb}</Link>
      </nav>

      <h1 className="font-heading mt-3 text-2xl font-bold leading-snug text-gold sm:text-3xl">
        {a.title}
      </h1>
      <div className="mt-2 text-sm text-smoke/80">
        {a.categories[0]?.name}
        {a.dateText ? ` · ${a.dateText}` : ""}
        {a.views ? ` · ${t.articles.readTimes(a.views.toLocaleString())}` : ""}
      </div>
      {browseAll && (
        <Link
          href={browseAll.href}
          className="mt-3 inline-block rounded-full border border-gold/40 px-4 py-1.5 text-sm text-gold-light transition hover:border-gold hover:bg-gold/10"
        >
          {browseAll.label}
        </Link>
      )}

      <article
        className="legacy-content mt-6 text-[16px]"
        dangerouslySetInnerHTML={{ __html: cleanHtml(a.contentHtml) }}
      />

      {/* สะพานไปหน้าสินค้า — คนอ่านบทความคือทางเข้าหลักของเว็บ แต่เดิมจบแล้วไม่มีทางไปต่อ
          นอกจากทักไลน์ทันที (ซึ่งส่วนใหญ่ยังไม่พร้อม) ให้เห็นของจริงก่อนค่อยตัดสินใจทัก */}
      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeading>{t.articles.relatedTitle}</SectionHeading>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} lang={lang} />
            ))}
          </div>
          {browseAll && (
            <div className="mt-4 text-right">
              <Link href={browseAll.href} className="text-sm text-gold-light hover:text-gold">
                {browseAll.label}
              </Link>
            </div>
          )}
        </section>
      )}

      <div className="mt-10 rounded-2xl bg-night p-6 text-center">
        <p className="font-heading font-semibold text-gold">
          {t.articles.consultTitle}
        </p>
        <div className="mt-3 flex justify-center">
          <LineInquiryButton
            url={lineChatUrl(t.line.articleInquiry(a.title))}
            lang={lang}
            label={t.articles.consultLabel}
          />
        </div>
      </div>
    </div>
  );
}
