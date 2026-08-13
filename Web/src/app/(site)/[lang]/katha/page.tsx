import type { Metadata } from "next";
import Link from "next/link";
import KathaActions from "@/components/KathaActions";
import LineLink from "@/components/LineLink";
import { lineChatUrl } from "@/lib/line";
import { LIVE_KATHA, kathaBySlug, kathaOfTheDay, type Katha } from "@/lib/katha";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";

// คาถาประจำวัน — บทของวันนี้ผูกกับวันที่ตามเวลาไทย ไม่ใช่สุ่มใหม่ทุกครั้งที่รีเฟรช
// ?k=<slug> เปิดบทใดก็ได้จากคลัง และเป็นลิงก์ที่แชร์ออกไปได้ (render ฝั่งเซิร์ฟเวอร์ทั้งหมด)
// ทุกบทลิงก์กลับบทความต้นทาง — ตรวจที่มาได้ และไม่ไปแย่งอันดับกับบทความของตัวเอง

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ k?: string }>;
}): Promise<Metadata> {
  const [{ lang: langParam }, { k }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const picked = k ? kathaBySlug(k) : undefined;
  return {
    title: picked ? (lang === "en" ? picked.nameEn : picked.name) : t.katha.metaTitle,
    description: picked
      ? `${lang === "en" ? picked.purposeEn : picked.purpose} — ${lang === "en" ? picked.howEn : picked.how}`
      : t.katha.metaDescription,
    alternates: {
      // บทที่เลือกไม่ใช่หน้าใหม่ในสายตา Google — canonical ชี้กลับหน้าหลักเสมอ
      canonical: href(lang, "/katha"),
      languages: { th: "/katha", en: "/en/katha" },
    },
  };
}

function KathaCard({
  katha,
  lang,
  eyebrow,
}: {
  katha: Katha;
  lang: Lang;
  eyebrow?: string;
}) {
  const t = getDict(lang);
  const en = lang === "en";
  const name = en ? katha.nameEn : katha.name;
  const purpose = en ? katha.purposeEn : katha.purpose;
  const how = en ? katha.howEn : katha.how;
  const when = en ? katha.whenEn : katha.when;
  const origin = en ? katha.originEn : katha.origin;

  // ข้อความสำหรับปุ่มคัดลอก — ให้ลอกไปวางในโน้ตแล้วสวดตามได้ครบโดยไม่ต้องเปิดเว็บ
  const copyText = [
    name,
    katha.namo ? `${t.katha.namoHeading}\n${t.katha.namoText}` : null,
    katha.lines.join("\n"),
    `${t.katha.howLabel}: ${how}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <article className="rounded-3xl border border-gold-deep/25 bg-cream-soft p-6 shadow-lg shadow-gold-deep/10 sm:p-8">
      {eyebrow && (
        <div className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-2 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
        {name}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-ink-soft">
        {purpose}
      </p>

      {/* ตัวบท — พื้นขาวงาช้างขลิบทอง ตัวใหญ่ บรรทัดห่าง อ่านตามได้จริงตอนถือมือถือไหว้ */}
      <div className="mt-6 rounded-2xl border border-gold-deep/30 bg-paper p-5 shadow-inner shadow-gold-deep/5 sm:p-6">
        {katha.namo && (
          <div className="mb-5 border-b border-gold-deep/20 pb-5 text-center">
            <div className="text-xs font-semibold tracking-wide text-gold-deep">
              {t.katha.namoHeading}
            </div>
            <p className="mt-1.5 font-heading text-base leading-loose text-ink/80">
              {t.katha.namoText}
            </p>
          </div>
        )}
        {/* บางบทมีวรรคซ้ำกัน (เช่นพระราหู 2 ท่อน) จึงใช้ลำดับบรรทัดเป็น key ไม่ใช่ตัวข้อความ */}
        {katha.lines.map((line, i) => (
          <p
            key={i}
            className="text-center font-heading text-lg leading-loose text-ink sm:text-xl"
          >
            {line}
          </p>
        ))}
      </div>

      <dl className="mt-5 space-y-3">
        <div className="rounded-2xl border border-gold-deep/20 bg-cream p-4">
          <dt className="font-heading text-sm font-semibold text-gold-deep">{t.katha.howLabel}</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-ink">{how}</dd>
        </div>
        {when && (
          <div className="rounded-2xl border border-gold-deep/20 bg-cream p-4">
            <dt className="font-heading text-sm font-semibold text-gold-deep">
              {t.katha.whenLabel}
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink">{when}</dd>
          </div>
        )}
        {/* บทที่ไม่มีบทความในเว็บ บอกตำรับแทน จะได้รู้ว่ารับมาจากสายไหน */}
        {origin && (
          <div className="rounded-2xl border border-gold-deep/20 bg-cream p-4">
            <dt className="font-heading text-sm font-semibold text-gold-deep">
              {t.katha.originLabel}
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink">{origin}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <KathaActions lang={lang} name={name} copyText={copyText} />
        <LineLink
          href={lineChatUrl(t.katha.lineMessage(name))}
          lang={lang}
          className="rounded-full bg-line-green px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          {t.katha.lineCta}
        </LineLink>
      </div>

      {katha.sourceId && (
        <div className="mt-5 text-center">
          <Link
            href={href(lang, `/articles/${katha.sourceId}`)}
            className="text-sm font-semibold text-gold-deep underline decoration-gold-deep/40 underline-offset-4 hover:decoration-gold-deep"
          >
            {t.katha.sourceLink}
          </Link>
        </div>
      )}
    </article>
  );
}

export default async function KathaPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const [{ lang: langParam }, { k }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const en = lang === "en";

  const picked = k ? kathaBySlug(k) : undefined;
  const shown = picked ?? kathaOfTheDay();

  return (
    // หน้าเดียวในเว็บที่พื้นสว่าง — เต็มความกว้างเพื่อให้ครีมต่อกับหัวเว็บสีดำได้สนิท
    // ไม่ใช่การ์ดครีมลอยอยู่บนพื้นดำ และมีเส้นทองคาดหัวท้ายรับกับเส้นทองใต้แถบเมนู
    <div className="min-h-screen bg-cream text-ink">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-deep/60 to-transparent" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="text-center">
          <h1 className="font-heading text-2xl font-bold text-gold-deep sm:text-3xl">
            {t.katha.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-soft">{t.katha.lead}</p>
        </header>

        <div className="mt-8">
          <KathaCard katha={shown} lang={lang} eyebrow={picked ? undefined : t.katha.todayLabel} />
          {picked && (
            <div className="mt-4 text-center">
              <Link
                href={href(lang, "/katha")}
                className="text-sm font-semibold text-gold-deep hover:text-ink"
              >
                {t.katha.backToToday}
              </Link>
            </div>
          )}
        </div>

        {/* คลังคาถา — ลิงก์ธรรมดา เปิดอ่านได้แม้ปิด JavaScript และ Google ตามเก็บได้ครบ */}
        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-gold-deep">
            {t.katha.libraryHeading}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t.katha.libraryHint}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {LIVE_KATHA.map((item) => {
              const active = item.slug === shown.slug;
              return (
                <li key={item.slug}>
                  <Link
                    href={href(lang, `/katha?k=${item.slug}`)}
                    aria-current={active ? "true" : undefined}
                    className={`flex h-full flex-col rounded-2xl border p-4 transition ${
                      active
                        ? "border-gold-deep bg-gold-deep/10"
                        : "border-gold-deep/20 bg-cream-soft hover:border-gold-deep/60"
                    }`}
                  >
                    <span className="font-heading text-sm font-semibold text-ink">
                      {en ? item.nameEn : item.name}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {en ? item.purposeEn : item.purpose}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed text-ink-soft">
          {t.katha.disclaimer}
        </p>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-deep/60 to-transparent" />
    </div>
  );
}
