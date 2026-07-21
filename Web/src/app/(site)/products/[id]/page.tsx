import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, getProductFull, cleanHtml } from "@/lib/db";
import { productInquiryUrl, productNotifyUrl } from "@/lib/line";
import { LineInquiryButton } from "@/components/LineButton";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";

export async function generateStaticParams() {
  const { products } = await getData();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductFull(id);
  if (!p) return {};
  const title = p.meta.title || p.title;
  const description = p.meta.description ?? p.descriptionText?.slice(0, 155);
  return {
    title,
    description,
    keywords: p.meta.keywords ?? undefined,
    alternates: { canonical: `/products/${p.id}` },
    openGraph: p.images[0] ? { title, description, images: [p.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, p] = await Promise.all([getData(), getProductFull(id)]);
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
    image: p.images,
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
      <nav aria-label="เส้นทางหน้า" className="text-xs text-smoke">
        <Link href="/" className="hover:text-gold-light">หน้าแรก</Link>
        {" › "}
        <Link href="/products" className="hover:text-gold-light">วัตถุมงคล</Link>
        {p.categories[0] && (
          <>
            {" › "}
            <Link href={`/products?cat=${p.categories[0].id}`} className="hover:text-gold-light">
              {p.categories[0].name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* gallery */}
        <div>
          {p.images[0] ? (
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-b from-night-soft to-night shadow-lg shadow-black/30">
              <Image
                src={p.images[0]}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1152px) 50vw, 576px"
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-night text-6xl" aria-hidden>🙏</div>
          )}
          {p.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {/* object-contain กันองค์พระ/กุมารโดนครอปหัวท้าย เหมือนเหตุผลใน ProductCard */}
              {p.images.slice(1, 9).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gold/20 bg-night-soft">
                  <Image src={img} alt={`${p.title} รูปที่ ${i + 2}`} fill sizes="120px" className="object-contain" />
                </div>
              ))}
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
              href={`/masters/${master.slug}`}
              className="mt-2 inline-block text-sm font-semibold text-gold-light hover:text-gold hover:underline"
            >
              โดย {master.name} →
            </Link>
          )}

          {/* buy box — ราคา + ปุ่มสั่งบูชา อยู่ด้วยกันเป็นโซนเดียว */}
          <div className="mt-5 rounded-2xl border border-gold/20 bg-night-soft/60 p-5">
            {p.soldOut ? (
              <>
                <span className="inline-block rounded-full bg-night px-4 py-1.5 text-sm font-semibold text-smoke ring-1 ring-smoke/40">
                  หมดแล้ว — เก็บไว้เป็นประวัติรุ่น
                </span>
                <div className="mt-4">
                  <LineInquiryButton url={productNotifyUrl(p.title)} label="แจ้งเตือนเมื่อมีเข้าใหม่ทาง Line" />
                  <p className="mt-2.5 text-xs leading-relaxed text-smoke">
                    รุ่นนี้หมดแล้ว กดปุ่มเพื่อฝากชื่อไว้ — ทางร้านจะทัก Line แจ้งเมื่อมีองค์ใหม่หรือรุ่นใกล้เคียงเข้ามา
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-smoke">ราคาบูชา</div>
                <div className="font-heading mt-0.5 text-3xl font-bold text-gold sm:text-4xl">
                  {p.priceText}
                </div>
                <div className="mt-4">
                  <LineInquiryButton url={productInquiryUrl(p.title)} label="สอบถาม / สั่งบูชาผ่าน Line" />
                  <p className="mt-2.5 text-xs leading-relaxed text-smoke">
                    กดปุ่มแล้วระบบจะเปิดแชท Line พร้อมแนบชื่อรุ่นนี้ให้อัตโนมัติ
                  </p>
                </div>
              </>
            )}
          </div>

          <dl className="mt-6 divide-y divide-gold/10 border-y border-gold/10 text-sm">
            {p.sku && (
              <div className="flex gap-3 py-2.5">
                <dt className="w-28 shrink-0 text-smoke">รหัสสินค้า</dt>
                <dd className="text-ivory">{p.sku}</dd>
              </div>
            )}
            <div className="flex gap-3 py-2.5">
              <dt className="w-28 shrink-0 pt-0.5 text-smoke">หมวดหมู่</dt>
              <dd className="flex flex-wrap gap-1.5">
                {p.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?cat=${c.id}`}
                    className="rounded-full border border-gold/40 bg-night-soft px-2.5 py-0.5 text-xs transition hover:border-gold hover:text-gold-light"
                  >
                    {c.name}
                  </Link>
                ))}
              </dd>
            </div>
            {p.updatedAt && (
              <div className="flex gap-3 py-2.5">
                <dt className="w-28 shrink-0 text-smoke">อัปเดตล่าสุด</dt>
                <dd className="text-ivory">{p.updatedAt}</dd>
              </div>
            )}
          </dl>

          {master && (
            <Link
              href={`/masters/${master.slug}`}
              className="mt-5 inline-block text-sm font-semibold text-gold-light hover:text-gold hover:underline"
            >
              ดูวัตถุมงคลของ{master.name}ทั้งหมด →
            </Link>
          )}
        </div>
      </div>

      {/* description — คอลัมน์อ่าน จำกัดความกว้างให้บรรทัดไม่ยาวเกินสายตา */}
      {p.descriptionHtml && (
        <section className="mt-12">
          <SectionHeading>รายละเอียด</SectionHeading>
          <div
            className="legacy-content mt-6 max-w-3xl text-base"
            dangerouslySetInnerHTML={{ __html: cleanHtml(p.descriptionHtml) }}
          />
        </section>
      )}

      {/* related */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading>วัตถุมงคลที่เกี่ยวข้อง</SectionHeading>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
