import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { getMaster, masters, productsInCategory, galleries, youtubeEmbed } from "@/lib/data";

export function generateStaticParams() {
  return masters.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMaster(slug);
  if (!m) return {};
  return {
    title: m.name,
    description:
      m.bio ??
      `รวมวัตถุมงคล เครื่องราง ${m.name} ทั้งหมด ${m.count} รุ่น — คัดสายตรงผ่านพิธีปลุกเสกจริง พร้อมวิธีบูชาและคาถากำกับ`,
  };
}

export default async function MasterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getMaster(slug);
  if (!m) notFound();

  const items = [...productsInCategory(m.catId)].sort(
    (a, b) => Number(a.soldOut) - Number(b.soldOut)
  );

  // จับคู่อัลบั้มงานพิธีจริงกับอาจารย์ ด้วยชื่อเฉพาะ (ตัดคำนำหน้า/คำว่า วัด ออก)
  const honorifics = ["อาจารย์", "หลวงปู่", "หลวงพ่อ", "พระอาจารย์", "พระครู", "พระมหา", "ครูบา", "วัด"];
  const nameTokens = m.name
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !honorifics.includes(t));
  const masterGalleries = galleries.filter((g) =>
    nameTokens.some((t) => g.title.includes(t))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* breadcrumb */}
      <nav className="text-xs text-smoke/80">
        <Link href="/" className="hover:text-gold-light">หน้าแรก</Link>
        {" › "}
        <Link href="/masters" className="hover:text-gold-light">ครูบาอาจารย์</Link>
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
            <div className="flex h-full w-full items-center justify-center text-5xl">🙏</div>
          )}
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{m.name}</h1>
          <p className="mt-2 text-sm text-smoke">
            วัตถุมงคลทั้งหมด {m.count} รุ่น
            {m.available > 0 && ` · พร้อมบูชา ${m.available} รุ่น`}
          </p>
          {m.bio && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/85">{m.bio}</p>
          )}
        </div>
      </header>

      {/* วิดีโอ (คาถา/พิธี) — ถ้ามี */}
      {m.videos && m.videos.length > 0 && (
        <section className="mt-8">
          <SectionHeading>วิดีโอคาถา / พิธีปลุกเสก</SectionHeading>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {m.videos.map((v) => {
              const embed = youtubeEmbed(v.id);
              if (!embed) return null;
              return (
                <div key={v.id}>
                  <div className="aspect-video overflow-hidden rounded-2xl border border-gold/25 bg-night">
                    <iframe
                      src={embed}
                      title={v.title}
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
          <SectionHeading>ภาพงานพิธีจริง</SectionHeading>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {masterGalleries.map((g) => (
              <Link
                key={g.id}
                href={`/gallery/${g.id}`}
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
        <SectionHeading>วัตถุมงคลของ{m.name}</SectionHeading>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
