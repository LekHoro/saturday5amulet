import type { Metadata } from "next";
import Link from "next/link";
import { lineChatUrl } from "@/lib/line";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { LineInquiryButton } from "@/components/LineButton";
import { breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import GuideVideoPlayer from "@/components/GuideVideoPlayer";
import {
  KMT_GUIDE_VIDEO_ID,
  KMT_GUIDE_WATCH_URL,
  KMT_GUIDE_UPLOAD_DATE,
  KMT_GUIDE_DURATION_S,
  KMT_GUIDE_DURATION_ISO,
  KMT_GUIDE_POSTER,
  KMT_GUIDE_COVER,
  KMT_GUIDE_CHAPTERS,
  formatChapterTime,
} from "@/lib/kumanthong-guide";

// หน้าคู่มือเลี้ยงกุมารทอง — วิดีโอยาว 26 นาทีตัดจากไลฟ์จริงของอาจารย์เล็ก + สารบัญกดข้ามบท
// เนื้อหาอยู่ในคลิปทั้งหมด หน้านี้เป็นกรอบรับชม ไม่เขียนคำสอนใหม่เอง

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  return {
    title: t.kumanthongGuide.metaTitle,
    description: t.kumanthongGuide.metaDescription,
    alternates: {
      canonical: href(lang, "/articles/kumanthong-guide"),
      languages: {
        th: "/articles/kumanthong-guide",
        en: "/en/articles/kumanthong-guide",
      },
    },
    openGraph: {
      title: t.kumanthongGuide.metaTitle,
      description: t.kumanthongGuide.metaDescription,
      images: [KMT_GUIDE_COVER],
    },
  };
}

export default async function KumanthongGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const g = t.kumanthongGuide;
  const l = (path: string) => href(lang, path);
  const en = lang === "en";

  const chapters = KMT_GUIDE_CHAPTERS.map((c) => ({
    start: c.start,
    label: en ? c.nameEn : c.name,
    time: formatChapterTime(c.start),
  }));

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: g.metaTitle,
    description: g.metaDescription,
    thumbnailUrl: [
      `https://i.ytimg.com/vi/${KMT_GUIDE_VIDEO_ID}/maxresdefault.jpg`,
      KMT_GUIDE_COVER,
    ],
    uploadDate: KMT_GUIDE_UPLOAD_DATE,
    duration: KMT_GUIDE_DURATION_ISO,
    contentUrl: KMT_GUIDE_WATCH_URL,
    embedUrl: `https://www.youtube-nocookie.com/embed/${KMT_GUIDE_VIDEO_ID}`,
    // บทในคลิป — ให้ Google โชว์ key moments ตามไทม์สแตมป์เดียวกับบนยูทูป
    hasPart: KMT_GUIDE_CHAPTERS.map((c, i) => ({
      "@type": "Clip",
      name: en ? c.nameEn : c.name,
      startOffset: c.start,
      endOffset: KMT_GUIDE_CHAPTERS[i + 1]?.start ?? KMT_GUIDE_DURATION_S,
      url: `${KMT_GUIDE_WATCH_URL}&t=${c.start}s`,
    })),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: t.nav.home, path: l("/") },
    { name: t.articles.breadcrumb, path: l("/articles") },
    { name: g.breadcrumb },
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={[videoJsonLd, breadcrumb]} />
      <nav className="text-xs text-smoke/80">
        <Link href={l("/")} className="hover:text-gold-light">{t.nav.home}</Link>
        {" › "}
        <Link href={l("/articles")} className="hover:text-gold-light">{t.articles.breadcrumb}</Link>
        {" › "}
        <span>{g.breadcrumb}</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/70">
          {g.eyebrow}
        </p>
        <h1 className="font-heading mt-2 text-2xl font-bold leading-snug text-gold sm:text-3xl">
          {g.title}
        </h1>
        <p className="mt-3 leading-relaxed text-smoke">{g.lead}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-gold/30 bg-night-soft px-3 py-1 font-semibold text-gold-light">
            {g.durationBadge}
          </span>
          <span className="rounded-full border border-gold/30 bg-night-soft px-3 py-1 font-semibold text-gold-light">
            {g.chapterCountBadge(KMT_GUIDE_CHAPTERS.length)}
          </span>
          <a
            href={KMT_GUIDE_WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gold/30 px-3 py-1 font-semibold text-smoke transition hover:border-gold hover:text-gold-light"
          >
            {g.watchOnYoutube}
          </a>
        </div>
      </header>

      <div className="mt-8">
        <GuideVideoPlayer
          videoId={KMT_GUIDE_VIDEO_ID}
          poster={KMT_GUIDE_POSTER}
          posterAlt={g.posterAlt}
          playLabel={g.play}
          chaptersHeading={g.chaptersHeading}
          chaptersHint={g.chaptersHint}
          chapters={chapters}
        />
      </div>

      <div className="mt-10 rounded-2xl bg-night p-6 text-center">
        <p className="font-heading font-semibold text-gold">{t.articles.consultTitle}</p>
        <div className="mt-3 flex justify-center">
          <LineInquiryButton
            url={lineChatUrl(t.line.articleInquiry(g.title))}
            lang={lang}
            label={t.articles.consultLabel}
          />
        </div>
        <div className="mt-4">
          <Link
            href={l("/articles?sec=kumanthong")}
            className="text-sm font-semibold text-gold hover:underline"
          >
            {g.moreArticles}
          </Link>
        </div>
      </div>
    </div>
  );
}
