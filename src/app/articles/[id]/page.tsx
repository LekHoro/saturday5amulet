import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, news, getArticle, cleanHtml } from "@/lib/data";
import { lineChatUrl } from "@/lib/line";
import { LineInquiryButton } from "@/components/LineButton";

export function generateStaticParams() {
  return [...articles, ...news].map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = getArticle(id);
  if (!a) return {};
  return {
    title: a.title,
    description: a.contentText?.slice(0, 155) ?? a.meta.description ?? undefined,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = getArticle(id);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    image: a.images,
    articleSection: a.categories[0]?.name,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-xs text-smoke/80">
        <Link href="/" className="hover:text-gold-light">หน้าแรก</Link>
        {" › "}
        <Link href="/articles" className="hover:text-gold-light">บทความ</Link>
      </nav>

      <h1 className="font-heading mt-3 text-2xl font-bold leading-snug text-gold sm:text-3xl">
        {a.title}
      </h1>
      <div className="mt-2 text-sm text-smoke/80">
        {a.categories[0]?.name}
        {a.dateText ? ` · ${a.dateText}` : ""}
        {a.views ? ` · อ่าน ${a.views.toLocaleString()} ครั้ง` : ""}
      </div>

      <article
        className="legacy-content mt-6 text-[16px]"
        dangerouslySetInnerHTML={{ __html: cleanHtml(a.contentHtml) }}
      />

      <div className="mt-10 rounded-2xl bg-night p-6 text-center">
        <p className="font-heading font-semibold text-gold">
          สนใจวัตถุมงคลหรืออยากปรึกษาเรื่องดวง / การบูชา
        </p>
        <div className="mt-3 flex justify-center">
          <LineInquiryButton
            url={lineChatUrl(`อ่านบทความ "${a.title}" แล้วสนใจสอบถามเพิ่มเติม`)}
            label="ปรึกษาผ่าน Line"
          />
        </div>
      </div>
    </div>
  );
}
