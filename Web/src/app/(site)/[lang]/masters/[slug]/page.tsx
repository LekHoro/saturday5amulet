import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { ImageFallback } from "@/components/icons";
import JsonLd from "@/components/JsonLd";
import { getSiteData, getMaster, productsInCategory, youtubeEmbed } from "@/lib/db";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

/** ประวัติเก็บเป็นข้อความยาว ย่อหน้าคั่นด้วยบรรทัดว่าง — ตัดเป็นย่อหน้าให้อ่านง่าย */
function bioParagraphs(bio: string | undefined): string[] {
  return (bio ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function generateStaticParams() {
  const { masters } = await getSiteData();
  return masters.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: langParam, slug } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const m = getMaster(await getSiteData(lang), slug);
  if (!m) return {};
  // ประวัติยาวหลายย่อหน้า — meta description เอาแค่ย่อหน้าแรก
  const description = bioParagraphs(m.bio)[0] ?? t.masters.metaMaster(m.name, m.count);
  return {
    title: m.name,
    description,
    alternates: {
      canonical: href(lang, `/masters/${m.slug}`),
      languages: { th: `/masters/${m.slug}`, en: `/en/masters/${m.slug}` },
    },
    openGraph: m.cover ? { title: m.name, description, images: [m.cover] } : undefined,
  };
}

export default async function MasterPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: langParam, slug } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const data = await getSiteData(lang);
  const m = getMaster(data, slug);
  if (!m) notFound();

  const items = [...productsInCategory(data, m.catId)].sort(
    (a, b) => Number(a.soldOut) - Number(b.soldOut)
  );

  // จับคู่อัลบั้มงานพิธีจริงกับอาจารย์ ด้วยชื่อเฉพาะ (ตัดคำนำหน้า/คำว่า วัด ออก)
  // จับคู่ด้วยชื่อไทยเสมอ (ชื่ออัลบั้มต้นทางเป็นไทย) แม้หน้าอยู่โหมด EN
  const thaiData = await getSiteData("th");
  const thaiName = getMaster(thaiData, slug)?.name ?? m.name;
  const honorifics = ["อาจารย์", "หลวงปู่", "หลวงพ่อ", "พระอาจารย์", "พระครู", "พระมหา", "ครูบา", "วัด"];
  const nameTokens = thaiName
    .split(/\s+/)
    .filter((tok) => tok.length >= 3 && !honorifics.includes(tok));
  const thaiGalleryIds = new Set(
    thaiData.galleries.filter((g) => nameTokens.some((tok) => g.title.includes(tok))).map((g) => g.id)
  );
  const masterGalleries = data.galleries.filter((g) => thaiGalleryIds.has(g.id));

  // ย่อหน้าแรกเป็นเกริ่นในหัวเรื่อง ที่เหลือลงเป็นหัวข้อ "ประวัติ" ใต้หัวเรื่อง
  const [bioLead, ...bioRest] = bioParagraphs(m.bio);

  // ประวัติเขียนโดยเจ้าของเท่านั้น (ห้ามแต่งเอง) — ถ้ายังไม่มีก็ไม่ต้องใส่ description
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    url: absoluteUrl(l(`/masters/${m.slug}`)),
    image: m.cover ? absoluteUrl(m.cover) : undefined,
    description: m.bio ?? undefined,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: t.nav.home, path: l("/") },
    { name: t.masters.breadcrumb, path: l("/masters") },
    { name: m.name },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={[personJsonLd, breadcrumb]} />
      {/* breadcrumb */}
      <nav className="text-xs text-smoke/80">
        <Link href={l("/")} className="hover:text-gold-light">{t.nav.home}</Link>
        {" › "}
        <Link href={l("/masters")} className="hover:text-gold-light">{t.masters.breadcrumb}</Link>
        {" › "}
        <span className="text-smoke">{m.name}</span>
      </nav>

      {/* header */}
      <header className="mt-4 flex flex-col items-center gap-5 rounded-2xl border border-gold/25 bg-night-soft p-6 text-center sm:flex-row sm:text-left">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-gold/60 bg-night ring-2 ring-gold/10">
          {m.cover ? (
            // รูปตัวแทน — เจ้าของเปลี่ยนเป็นรูปอาจารย์จริงได้ภายหลัง
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.cover} alt={m.name} className="h-full w-full object-cover" />
          ) : (
            <ImageFallback className="text-4xl" />
          )}
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{m.name}</h1>
          <p className="mt-2 text-sm text-smoke">
            {t.masters.totalEditions(m.count)}
            {m.available > 0 && ` · ${t.masters.availableEditions(m.available)}`}
          </p>
          {bioLead && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/85">{bioLead}</p>
          )}
        </div>
      </header>

      {/* ประวัติ (ส่วนที่เหลือจากย่อหน้าเกริ่นในหัวเรื่อง) */}
      {bioRest.length > 0 && (
        <section className="mt-8">
          <SectionHeading>{t.masters.bioHeading}</SectionHeading>
          <div className="mt-4 max-w-3xl space-y-4">
            {bioRest.map((p, i) => (
              <p key={i} className="text-sm leading-loose text-ivory/85">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* แบนเนอร์แนวนอนของอาจารย์ (เจ้าของอัปเองใน /admin) — ยังไม่ใส่ = ไม่มีช่องว่างค้าง
          h-auto ตามสัดส่วนไฟล์จริง เพราะแบนเนอร์เก่าจาก igetweb 850×450 แต่ของใหม่อาจไม่เท่ากัน */}
      {m.banner && (
        // แบนเนอร์เก่าจาก igetweb มีปุ่ม "CLICK HERE" ฝังอยู่ในรูป — จึงต้องกดได้จริง
        // พาไปหน้ารวมวัตถุมงคลของอาจารย์ท่านนั้น (มีตัวกรอง/เรียงลำดับ มากกว่าตารางท้ายหน้านี้)
        <Link
          href={l(`/products?cat=${m.catId}`)}
          className="mt-8 block overflow-hidden rounded-2xl border border-gold/25 bg-night-soft transition hover:border-gold"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.banner} alt={t.masters.bannerAlt(m.name)} className="h-auto w-full" />
        </Link>
      )}

      {/* วิดีโอ (คาถา/พิธี) — ถ้ามี */}
      {m.videos && m.videos.length > 0 && (
        <section className="mt-8">
          <SectionHeading>{t.masters.videos}</SectionHeading>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {m.videos.map((v) => {
              const embed = youtubeEmbed(v.id);
              if (!embed) return null;
              return (
                <div key={v.id}>
                  <div className="aspect-video overflow-hidden rounded-2xl border border-gold/25 bg-night">
                    <iframe
                      src={embed}
                      // aria-label ไม่ใช่ title — title จะเด้ง tooltip ของเบราว์เซอร์ทับรูปคลิปตอนเอาเมาส์ชี้
                      // (ชื่อคลิปมีบรรทัดใต้กรอบอยู่แล้ว) แต่ยังมีชื่อให้ screen reader เหมือนเดิม
                      aria-label={v.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="mt-2 text-sm text-smoke">{v.title}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* อัลบั้มงานพิธีจริงของอาจารย์ท่านนี้ */}
      {masterGalleries.length > 0 && (
        <section className="mt-8">
          <SectionHeading>{t.masters.galleryHeading}</SectionHeading>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {masterGalleries.map((g) => (
              <Link
                key={g.id}
                href={l(`/gallery/${g.id}`)}
                className="group overflow-hidden rounded-xl border border-gold/25 bg-night-soft transition hover:border-gold"
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.images[0]}
                    alt={g.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <p className="line-clamp-2 p-2 text-xs leading-snug text-smoke">{g.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* วัตถุมงคล */}
      <section className="mt-10">
        <SectionHeading>{t.masters.amuletsOf(m.name)}</SectionHeading>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  );
}
