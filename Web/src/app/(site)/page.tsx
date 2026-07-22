import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import MasterCard from "@/components/MasterCard";
import SectionHeading from "@/components/SectionHeading";
import BannerCarousel, { type Banner } from "@/components/BannerCarousel";
import CeremonyCountdown from "@/components/CeremonyCountdown";
import { getData, categoryCount } from "@/lib/db";

const banners: Banner[] = [
  {
    src: "/banners/kmt-lpamnard.png",
    alt: "กุมารทอง หลวงพ่ออำนาจ มหาวีโร — Kumanthong LP Amnard Mahaveero",
    href: "/products?cat=8650",
    width: 1140,
    height: 400,
  },
  {
    src: "/banners/lpyeam.png",
    alt: "กุมารทอง หลวงปู่แย้ม วัดสามง่าม — Kumanthong LP Yaem",
    href: "/products?cat=8681",
    width: 1140,
    height: 400,
  },
  {
    src: "/banners/ajarnsubin.jpg",
    alt: "วัตถุมงคล อาจารย์สุบิน นะหน้าทอง",
    href: "/products?cat=8672",
    width: 850,
    height: 400,
  },
  {
    src: "/banners/ship-worldwide.png",
    alt: "We Ship Worldwide — บริการจัดส่งทั่วโลก DHL TNT EMS",
    href: "/how-to-order",
    width: 850,
    height: 450,
  },
];

// วันงานยังไม่พ้น (นับถึงสิ้นวันตามเวลาไทย) — เช็กตอน request กันส่ง shell ของงานที่จบแล้ว
function ceremonyUpcoming(date: string) {
  return Date.now() < new Date(`${date}T00:00:00+07:00`).getTime() + 86_400_000;
}

// หมวดหลักบนหน้าแรก — ชื่อดึงจาก categoryNames ตอน render, หมวดย่อย (ขนาดบูชา/พกพา ฯลฯ) เข้าถึงได้จาก sidebar หน้า /products
const featuredCategories = [
  { id: "8647", icon: "🧒" }, // กุมารทอง
  { id: "102534", icon: "👧" }, // น้องกุมารี
  { id: "91638", icon: "💰" }, // เครื่องรางเสริมโชคลาภ
  { id: "41976", icon: "💖" }, // เครื่องรางมหาเสน่ห์
  { id: "102273", icon: "✨" }, // วัตถุมงคลเสริมดวง สะเดาะเคราะห์
];

const orderSteps = [
  { icon: "🔎", title: "เลือกวัตถุมงคล", text: "ดูรายละเอียด รูปภาพ และพุทธคุณของแต่ละรุ่นได้จากหน้าเว็บ" },
  { icon: "💬", title: "ทัก Line สอบถาม", text: "กดปุ่มสั่งบูชา ระบบจะเปิดแชท Line พร้อมชื่อรุ่นที่คุณสนใจอัตโนมัติ" },
  { icon: "📦", title: "ชำระเงินและจัดส่ง", text: "โอนชำระแล้วรอรับองค์ที่บ้าน พร้อมวิธีบูชาและคาถากำกับทุกองค์" },
];

export default async function Home() {
  const data = await getData();
  const { articles, categoryNames, masters, galleries, nextCeremony } = data;
  const featured = data.availableProducts.slice(0, 8);
  const galleryPreview = galleries.slice(0, 4);
  // id เก่าจาก igetweb เป็นเลขสั้น ส่วน id ใหม่เป็น timestamp — ต้องเทียบแบบตัวเลข
  const latestArticles = [...articles]
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    .slice(0, 4);

  return (
    <div>
      {/* Banner carousel เหมือนเว็บเดิม */}
      <BannerCarousel banners={banners} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-night-soft via-night to-night px-4 py-16 text-center text-ivory">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 w-2/3 rounded-full bg-gold/10 blur-3xl" />
        <h1 className="font-heading mx-auto max-w-3xl text-3xl font-bold leading-snug text-gold-light sm:text-4xl lg:text-5xl lg:leading-snug">
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

      {/* Category cards — หมวดหลักแบบกะทัดรัด ตัวกรองละเอียดอยู่ใน sidebar หน้า /products */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading center>เลือกชมตามหมวดหมู่</SectionHeading>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {featuredCategories
            .filter(({ id }) => categoryCount(data, id) > 0)
            .map(({ id, icon }) => (
              <Link
                key={id}
                href={`/products?cat=${id}`}
                className="rounded-2xl border border-gold/25 bg-night-soft p-5 text-center shadow-sm transition hover:border-gold hover:bg-night"
              >
                <span aria-hidden className="text-3xl">{icon}</span>
                <p className="font-heading mt-2 font-semibold text-ivory">{categoryNames[id]}</p>
                <p className="mt-0.5 text-xs text-smoke">{categoryCount(data, id)} รายการ</p>
              </Link>
            ))}
          <Link
            href="/products"
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/45 p-5 text-center transition hover:border-gold hover:bg-night"
          >
            <p className="font-heading font-semibold text-gold-light">ดูหมวดทั้งหมด →</p>
            <p className="mt-0.5 text-xs text-smoke">{data.products.length} รายการ</p>
          </Link>
        </div>
      </section>

      {/* นับถอยหลังวันมงคล เสาร์ ๕ — แสดงเมื่อเจ้าของตั้งวันแล้วและยังไม่พ้นวันงาน */}
      {nextCeremony && ceremonyUpcoming(nextCeremony.date) && (
        <CeremonyCountdown label={nextCeremony.label} date={nextCeremony.date} />
      )}

      {/* เลือกตามอาจารย์ */}
      <section className="bg-night px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>เลือกตามครูบาอาจารย์</SectionHeading>
            <Link href="/masters" className="text-sm font-semibold text-gold hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {masters.slice(0, 8).map((m) => (
              <MasterCard key={m.slug} master={m} />
            ))}
          </div>
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
              <div className="text-4xl" aria-hidden>{s.icon}</div>
              <h3 className="font-heading mt-3 font-semibold text-gold">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-smoke">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ภาพงานพิธีจริง — สร้างความน่าเชื่อถือ */}
      <section className="bg-night px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>ภาพงานพิธีจริง</SectionHeading>
            <Link href="/gallery" className="text-sm font-semibold text-gold hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-smoke">
            ทุกองค์ผ่านพิธีปลุกเสก พุทธาภิเษก และไหว้ครูจากงานจริง — ดูบรรยากาศพิธีได้จากภาพเหล่านี้
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {galleryPreview.map((g) => (
              <Link
                key={g.id}
                href={`/gallery/${g.id}`}
                className="group overflow-hidden rounded-2xl border border-gold/25 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:border-gold"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={g.images[0]}
                    alt={g.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1152px) 25vw, 288px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <p className="line-clamp-2 p-3 text-sm font-medium leading-snug text-ivory/90 group-hover:text-gold-light">
                  {g.title}
                </p>
              </Link>
            ))}
          </div>
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
                className="group rounded-xl border border-gold/25 bg-night-soft p-4 shadow-sm transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-md"
              >
                <div className="text-xs text-smoke">
                  {a.dateText} · อ่าน {a.views?.toLocaleString() ?? "-"} ครั้ง
                </div>
                <h3 className="mt-1 line-clamp-3 font-semibold leading-snug text-foreground group-hover:text-gold-light">
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
