import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import {
  availableProducts,
  articles,
  categoryGroups,
  categoryNames,
  categoryCount,
} from "@/lib/data";

const orderSteps = [
  { icon: "🔎", title: "เลือกวัตถุมงคล", text: "ดูรายละเอียด รูปภาพ และพุทธคุณของแต่ละรุ่นได้จากหน้าเว็บ" },
  { icon: "💬", title: "ทัก Line สอบถาม", text: "กดปุ่มสั่งบูชา ระบบจะเปิดแชท Line พร้อมชื่อรุ่นที่คุณสนใจอัตโนมัติ" },
  { icon: "📦", title: "ชำระเงินและจัดส่ง", text: "โอนชำระแล้วรอรับองค์ที่บ้าน พร้อมวิธีบูชาและคาถากำกับทุกองค์" },
];

export default function Home() {
  const featured = availableProducts.slice(0, 8);
  const latestArticles = [...articles]
    .sort((a, b) => (b.id > a.id ? 1 : -1))
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-night-soft via-night to-night px-4 py-16 text-center text-ivory">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 w-2/3 rounded-full bg-gold/10 blur-3xl" />
        <h1 className="font-heading mx-auto max-w-3xl text-3xl font-bold leading-snug text-gold-light sm:text-4xl">
          วัตถุมงคล เครื่องราง กุมารทอง
          <br className="hidden sm:block" /> ของแท้จากวัดและสำนักโดยตรง
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-ivory/85">
          เสาร์๕มหานิยม โดยแม่หมอสายมู อาจารย์เล็กเสาร์ห้า — คัดทุกองค์จากพิธีปลุกเสกจริง
          พร้อมประวัติการจัดสร้าง วิธีบูชา และคาถากำกับครบทุกรุ่น
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-gold px-6 py-3 font-bold text-night shadow transition hover:brightness-110"
          >
            ชมวัตถุมงคลทั้งหมด
          </Link>
          <Link
            href="/articles"
            className="rounded-xl border border-gold-light/60 px-6 py-3 font-semibold text-gold-light transition hover:bg-gold/10"
          >
            อ่านบทความ / วิธีบูชา
          </Link>
        </div>
      </section>

      {/* Category groups */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading center>เลือกชมตามหมวดหมู่</SectionHeading>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {categoryGroups.map((group) => (
            <div key={group.slug} className="rounded-2xl border border-gold/25 bg-night-soft p-5 shadow-sm">
              <h3 className="font-heading border-b border-gold/20 pb-2 text-lg font-semibold text-gold">
                {group.label}
              </h3>
              <ul className="mt-3 space-y-1">
                {group.ids
                  .filter((id) => categoryCount(id) > 0)
                  .map((id) => (
                    <li key={id}>
                      <Link
                        href={`/products?cat=${id}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-night hover:text-gold-light"
                      >
                        <span>{categoryNames[id]}</span>
                        <span className="text-xs text-smoke/80">{categoryCount(id)}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-night px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>วัตถุมงคลแนะนำ</SectionHeading>
            <Link href="/products" className="text-sm font-semibold text-gold hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading center>สั่งบูชาง่าย ๆ ใน 3 ขั้นตอน</SectionHeading>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {orderSteps.map((s, i) => (
            <div key={i} className="rounded-2xl border border-gold/25 bg-night-soft p-6 text-center shadow-sm">
              <div className="text-4xl">{s.icon}</div>
              <h3 className="font-heading mt-3 font-semibold text-gold">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-smoke">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest articles */}
      <section className="bg-night px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>บทความล่าสุด</SectionHeading>
            <Link href="/articles" className="text-sm font-semibold text-gold hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestArticles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.id}`}
                className="rounded-xl border border-gold/25 bg-night-soft p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-xs text-smoke/80">
                  {a.dateText} · อ่าน {a.views?.toLocaleString() ?? "-"} ครั้ง
                </div>
                <h3 className="mt-1 line-clamp-3 font-semibold leading-snug text-foreground">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
