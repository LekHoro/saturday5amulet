import type { Metadata } from "next";
import MasterCard from "@/components/MasterCard";
import SectionHeading from "@/components/SectionHeading";
import { getSiteData, YOUTUBE_CHANNEL } from "@/lib/db";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  return {
    title: t.masters.metaTitle,
    description: t.masters.metaDescription,
    alternates: {
      canonical: href(lang, "/masters"),
      languages: { th: "/masters", en: "/en/masters" },
    },
  };
}

export default async function MastersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const { masters } = await getSiteData(lang);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">
          {t.masters.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
          {t.masters.lead}
        </p>
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold-light transition hover:border-gold hover:bg-gold/10"
        >
          {t.masters.youtube}
        </a>
      </div>

      <div className="mt-10">
        <SectionHeading center>{t.masters.byMaster}</SectionHeading>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {masters.map((m) => (
            <MasterCard key={m.slug} master={m} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}
