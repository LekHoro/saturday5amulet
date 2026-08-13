import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import {
  KumanthongIcon,
  KumareeIcon,
  FortuneBagIcon,
  CharmHeartIcon,
  SparkleIcon,
  ImageFallback,
} from "@/components/icons";
import { getSiteData, categoryCount, productsInCategory } from "@/lib/db";
import { kathaOfTheDay, LIVE_KATHA } from "@/lib/katha";
import { lineChatUrl } from "@/lib/line";
import LineLink from "@/components/LineLink";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";

// แถบคาถาบนหน้าแรกผูกกับวันที่ ถ้าปล่อยให้หน้านี้นิ่งถาวร บทจะค้างอยู่ที่วันที่ deploy
// จึงให้สร้างหน้าใหม่อย่างช้าทุกชั่วโมง — ของอื่นบนหน้าแรกได้ของสดขึ้นตามไปด้วย
export const revalidate = 3600;

const KUMANTHONG_CAT = "8647";
const KUMAREE_CAT = "102534";

// รูป hero — รอรูปที่เจ้าของแต่งตามสเปก (แนวนอน องค์อยู่ขวา เว้นซ้ายมืด) แล้วค่อยสลับ
const heroImage = {
  src: "/banners/kmt-lpamnard.png",
  href: "/products?cat=8650",
};
const ceremonyImage = "/banners/ceremony-ajarn.jpg";

// หมวดรองบนหน้าแรก (กุมารทองแยกเป็นการ์ดแนวตั้ง) — หมวดย่อยอยู่ใน sidebar หน้า /products
// รูปการ์ดมาจาก "รูปประจำหมวด" ในแอดมิน (จตุรัส 1:1 = 800×800 องค์กลางกรอบ) ยังไม่ตั้ง = ใช้ไอคอน
const secondaryCategories: { id: string; icon: React.ReactNode }[] = [
  { id: KUMAREE_CAT, icon: <KumareeIcon className="h-12 w-12" /> }, // น้องกุมารี
  { id: "41976", icon: <CharmHeartIcon className="h-12 w-12" /> }, // เครื่องรางมหาเสน่ห์
  { id: "91638", icon: <FortuneBagIcon className="h-12 w-12" /> }, // เครื่องรางเสริมโชคลาภ
  { id: "102273", icon: <SparkleIcon className="h-12 w-12" /> }, // วัตถุมงคลเสริมดวง สะเดาะเคราะห์
];

// ไอคอน trust strip — เส้น stroke เดียวกันทั้งชุด
const trustIcons = [
  <svg key="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" /></svg>,
  <svg key="seal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M20 7L9 18l-5-5" /><circle cx="12" cy="12" r="10.4" /></svg>,
  <svg key="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c2.8 2.6 4.2 5.8 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.8-4.2-9.5S9.2 5.1 12 2.5z" /></svg>,
  <svg key="chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M21 11.5c0 4.1-4 7.5-9 7.5-1 0-2-.14-2.9-.4L4 20l1.3-3.1C3.9 15.6 3 13.6 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5z" /></svg>,
];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const data = await getSiteData(lang);
  const { articles, categoryNames, masters, galleries, categoryImages } = data;

  const kumanthong = productsInCategory(data, KUMANTHONG_CAT)
    .filter((p) => !p.soldOut)
    .slice(0, 5);
  const otherAmulets = data.availableProducts
    .filter((p) => !p.categories.some((c) => c.id === KUMANTHONG_CAT || c.id === KUMAREE_CAT))
    .slice(0, 4);
  const masterRow = masters.filter((m) => m.photo || m.cover).slice(0, 8);
  const galleryPreview = galleries.slice(0, 5);
  // id เก่าจาก igetweb เป็นเลขสั้น ส่วน id ใหม่เป็น timestamp — ต้องเทียบแบบตัวเลข
  const latestArticles = [...articles]
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    .slice(0, 4);
  const [featureArticle, ...listArticles] = latestArticles;

  // คาถาของวันนี้ — ผูกกับวันที่ตามเวลาไทย หน้าแรกจึงต้อง revalidate (ดูค่าท้ายไฟล์)
  const todayKatha = kathaOfTheDay();
  const kathaName = lang === "en" ? todayKatha.nameEn : todayKatha.name;
  const kathaOrigin = lang === "en" ? todayKatha.originEn : todayKatha.origin;

  return (
    <div>
      {/* Hero split — ซ้ายข้อความ ขวารูปเต็มพื้นที่ กลืนกันด้วยเงาดำ */}
      <section className="grid min-h-[480px] lg:grid-cols-[1fr_1.15fr]">
        <div className="relative order-2 flex flex-col justify-center overflow-hidden px-4 py-12 sm:px-10 lg:order-1 lg:py-16 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <div className="pointer-events-none absolute -top-20 left-0 h-64 w-2/3 rounded-full bg-gold/10 blur-3xl" />
          <h1 className="font-heading max-w-xl text-3xl font-bold leading-snug sm:text-4xl lg:text-[2.6rem] lg:leading-snug">
            <span className="text-gold-light">{t.home.heroTitle1}</span>
            <br />
            <span className="text-ivory">{t.home.heroTitle2}</span>
          </h1>
          <p className="mt-4 max-w-lg text-ivory/85">{t.home.heroLead}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={l("/products")}
              className="rounded-xl bg-gold px-6 py-3 font-bold text-night shadow-lg shadow-gold/20 transition hover:brightness-110"
            >
              {t.home.ctaProducts}
            </Link>
            <Link
              href={l("/articles")}
              className="rounded-xl border border-gold-light/60 px-6 py-3 font-semibold text-gold-light transition hover:bg-gold/10"
            >
              {t.home.ctaArticles}
            </Link>
          </div>
        </div>
        <Link href={l(heroImage.href)} className="relative order-1 block min-h-[240px] overflow-hidden bg-night-soft sm:min-h-[320px] lg:order-2 lg:min-h-0">
          <Image
            src={heroImage.src}
            alt={t.home.heroBadge}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent lg:bg-gradient-to-r lg:from-night lg:via-transparent lg:to-transparent" />
          <span className="absolute bottom-4 right-4 rounded-full border border-gold/40 bg-night/80 px-4 py-1.5 text-xs text-gold-light backdrop-blur-sm sm:text-sm">
            {t.home.heroBadge}
          </span>
        </Link>
      </section>

      {/* Trust strip — แถบงาช้างคั่นความเชื่อใจ */}
      <section className="bg-ivory text-night">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-5 lg:grid-cols-4">
          {t.home.trust.map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-3">
              <span aria-hidden className="shrink-0 text-crimson">{trustIcons[i]}</span>
              <div>
                <p className="text-sm font-semibold leading-snug">{item.title}</p>
                <p className="text-xs text-night/60">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ครูบาอาจารย์ — แถวเลื่อนแนวนอน รูปเต็มการ์ด */}
      <section className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="flex items-baseline justify-between">
          <SectionHeading>{t.home.byMaster}</SectionHeading>
          <Link href={l("/masters")} className="text-sm font-semibold text-gold hover:underline">
            {t.home.viewAll}
          </Link>
        </div>
        <div className="marquee mt-6 pb-3" style={{ "--marquee-duration": `${masterRow.length * 5}s` } as CSSProperties}>
          <div className="marquee-track">
            {[false, true].map((clone) => (
              <div key={clone ? "clone" : "main"} aria-hidden={clone || undefined} className="marquee-group">
                {masterRow.map((m) => (
                  <Link
                    key={m.slug}
                    href={l(`/masters/${m.slug}`)}
                    tabIndex={clone ? -1 : undefined}
                    className="group relative aspect-[3/4] w-[13rem] shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-night-soft transition hover:-translate-y-1 hover:border-gold/60"
                  >
                    <Image
                      src={m.photo ?? m.cover ?? ""}
                      alt={m.name}
                      fill
                      sizes="208px"
                      className="object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/95 via-night/60 to-transparent px-4 pb-3 pt-10">
                      <p className="font-heading text-sm font-semibold leading-snug text-ivory">{m.name}</p>
                      <p className="mt-0.5 text-xs text-gold-light">{t.masters.editions(m.count)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category grid — กุมารทองการ์ดแนวตั้ง 3:4 อีก 4 หมวดจตุรัส 1:1
          ชื่อหมวดอยู่ใต้รูป ไม่ทับองค์ รูปจึงไม่ต้องแต่งให้มุมล่างมืด */}
      <section className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <SectionHeading>{t.home.byCategory}</SectionHeading>
        {/* 1.65fr ทำให้การ์ดกุมารทอง (สูงเท่าสองแถว) ออกมาใกล้ 3:4 พอดี */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:[grid-template-columns:1.65fr_1fr_1fr]">
          <Link
            href={l(`/products?cat=${KUMANTHONG_CAT}`)}
            className="group col-span-2 flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-night-soft transition hover:-translate-y-0.5 hover:border-gold sm:col-span-1 sm:row-span-2"
          >
            {/* มือถือ 3:4 เท่าจอใหญ่ — กรอบแบนเนอร์ 16:10 เดิมครอปรูปองค์แนวตั้งจนหัวขาด
                จอใหญ่ยืดเต็มสองแถวให้ตรงกับการ์ดจตุรัสข้างๆ (ออกมาใกล้ 3:4 พอดี) */}
            <div className="relative aspect-[3/4] overflow-hidden bg-brown-gold/40 sm:aspect-auto sm:flex-1">
              {categoryImages[KUMANTHONG_CAT] ? (
                <Image
                  src={categoryImages[KUMANTHONG_CAT]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span aria-hidden className="flex h-full w-full items-center justify-center text-gold/70">
                  <KumanthongIcon className="h-24 w-24 sm:h-32 sm:w-32" />
                </span>
              )}
              <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-night/75 px-3 py-1 text-xs text-gold-light backdrop-blur-sm">
                {t.home.mainCategory}
              </span>
            </div>
            <div className="bg-gradient-to-b from-crimson/30 to-night-soft px-4 py-3.5">
              <p className="font-heading text-lg font-semibold leading-snug text-gold-light sm:text-xl">
                {categoryNames[KUMANTHONG_CAT]}
              </p>
              <p className="mt-0.5 text-sm text-ivory/70">
                {t.home.items(categoryCount(data, KUMANTHONG_CAT))}
              </p>
            </div>
          </Link>
          {secondaryCategories
            .filter(({ id }) => categoryCount(data, id) > 0)
            .map(({ id, icon }) => (
              <Link
                key={id}
                href={l(`/products?cat=${id}`)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-night-soft transition hover:-translate-y-0.5 hover:border-gold"
              >
                <div className="relative aspect-square overflow-hidden bg-brown-gold/40">
                  {categoryImages[id] ? (
                    <Image
                      src={categoryImages[id]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-full w-full items-center justify-center text-gold/70"
                    >
                      {icon}
                    </span>
                  )}
                </div>
                <div className="px-3 py-3 sm:px-3.5">
                  <p className="font-heading text-sm font-semibold leading-snug text-ivory sm:text-base">
                    {categoryNames[id]}
                  </p>
                  <p className="mt-0.5 text-xs text-smoke">{t.home.items(categoryCount(data, id))}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* คาถาประจำวัน — แถบครีมคั่นดำสองแถบ เด้งออกมาเองโดยไม่ต้องใช้สีแรง
          และเป็นสีเดียวกับหน้า /katha พอกดเข้าไปจะรู้สึกต่อเนื่อง
          โชว์แค่สองวรรคแรก พอให้เห็นว่าเป็นคาถาจริง ไม่ขวางทางคนที่มาซื้อของ */}
      <section className="border-y border-gold-deep/25 bg-cream text-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-[1fr_1.1fr] lg:py-14">
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">
              {t.home.katha.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-snug sm:text-3xl">
              {t.home.katha.title(kathaName)}
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
              {t.home.katha.lead(LIVE_KATHA.length)}
            </p>
            <Link
              href={l("/katha")}
              className="mt-6 inline-block rounded-xl bg-gold-deep px-6 py-3 font-heading font-bold text-cream shadow-lg shadow-gold-deep/20 transition hover:brightness-125"
            >
              {t.home.katha.cta}
            </Link>
          </div>

          {/* ใบคาถา — รูปทรงเดียวกับกล่องบทสวดในหน้า /katha */}
          <div className="rounded-2xl border border-gold-deep/30 bg-paper p-6 text-center shadow-lg shadow-gold-deep/10 sm:p-7">
            {todayKatha.namo && (
              <p className="text-xs font-semibold tracking-wide text-gold-deep">
                {t.katha.namoHeading}
              </p>
            )}
            <p className="mt-0.5 font-heading text-lg font-bold">{kathaName}</p>
            <hr className="my-4 border-gold-deep/20" />
            {todayKatha.lines.slice(0, 2).map((line, i) => (
              <p key={i} className="font-heading text-base leading-loose sm:text-lg">
                {line}
              </p>
            ))}
            <p className="mt-3 text-sm text-ink-soft">
              {t.home.katha.more}
              {kathaOrigin ? ` · ${kathaOrigin}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* แถบแดงชาด — บริการพิธีจุดเทียน */}
      <section className="bg-crimson">
        <div className="grid lg:grid-cols-[1.25fr_1fr]">
          <div className="px-4 py-10 sm:px-10 lg:self-center lg:py-14 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
            <h2 className="font-heading text-2xl font-bold leading-snug text-gold-light sm:text-3xl">
              {t.home.ceremonyService.title1}
              <br />
              {t.home.ceremonyService.title2}
            </h2>
            <p className="mt-3 max-w-xl text-ivory/90">{t.home.ceremonyService.lead}</p>
            <LineLink
              href={lineChatUrl(t.home.ceremonyService.lineMessage)}
              lang={lang}
              className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-bold text-night shadow-lg shadow-crimson-deep/40 transition hover:brightness-110"
            >
              {t.home.ceremonyService.cta}
            </LineLink>
          </div>
          <div className="relative min-h-[220px] lg:min-h-0">
            <Image
              src={ceremonyImage}
              alt={t.home.ceremonyService.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-[50%_30%]"
            />
            {/* มือถือ: ไล่สีจบที่ 15% พอกลืนรอยต่อ ไม่ลงไปทับหัวอาจารย์ */}
            <div className="absolute inset-0 bg-gradient-to-b from-crimson to-transparent to-[15%] lg:bg-gradient-to-r lg:via-transparent lg:to-transparent lg:to-[100%]" />
          </div>
        </div>
      </section>

      {/* Cross-sell lagnara — ต่อจากแถบพิธี เพราะ "ฤกษ์" คือสะพานเชื่อมสองเว็บ
          ลิงก์ออกนอกเว็บ จึงทำเป็นแถบเรียบ ๆ ไม่ให้แย่งความสนใจจากสินค้า */}
      <section className="border-y border-gold/15 bg-night-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:gap-7 lg:gap-10 lg:py-12">
          {/* รูปพื้นสตูดิโอสีอ่อน — ใส่กรอบทองไว้ ไม่ปล่อยไหลไปกับพื้นดำ จะได้ไม่เหมือนรูปหลุด */}
          <div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-2xl border border-gold/30 bg-night sm:w-40 lg:w-48">
            <Image
              src="/banners/lagnara-ajarn.jpg"
              alt={t.home.lagnara.imageAlt}
              fill
              sizes="(max-width: 640px) 144px, 192px"
              className="object-cover object-[50%_15%]"
            />
          </div>
          <div className="min-w-0 flex-1">
            {/* โลโก้ lagnara ตัวอักษรครีม ออกแบบมาสำหรับพื้นเข้ม — คู่กับ eyebrow บอกว่าเป็นคนละแบรนด์ */}
            <div className="flex items-center gap-3">
              <Image
                src="/banners/lagnara-logo.png"
                alt="lagnara"
                width={341}
                height={320}
                className="h-14 w-auto"
              />
              <p className="text-xs uppercase tracking-[0.2em] text-gold/70">{t.home.lagnara.eyebrow}</p>
            </div>
            <h2 className="font-heading mt-2 text-xl font-bold leading-snug text-gold-light sm:text-2xl">
              {t.home.lagnara.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory/80">{t.home.lagnara.lead}</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ivory/70">
              {t.home.lagnara.points.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span aria-hidden className="text-gold">✦</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <a
            href="https://lagnara.com"
            target="_blank"
            rel="noopener"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-gold px-6 py-3 font-bold text-gold-light transition hover:bg-gold hover:text-night lg:self-center"
          >
            {t.home.lagnara.cta}
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
        </div>
      </section>

      {/* กุมารทอง — ตัวดังประจำร้าน: ชิ้นเด่น 2×2 + grid ปกติ */}
      <section className="bg-night-soft px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>{t.home.kumanthongTitle}</SectionHeading>
            <Link
              href={l(`/products?cat=${KUMANTHONG_CAT}`)}
              className="text-sm font-semibold text-gold hover:underline"
            >
              {t.home.kumanthongViewAll}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kumanthong[0] && (
              <Link
                href={l(`/products/${kumanthong[0].id}`)}
                className="group relative col-span-2 row-span-2 flex flex-col overflow-hidden rounded-2xl border border-smoke/20 bg-night transition hover:border-gold/60"
              >
                <div className="relative min-h-[16rem] flex-1 bg-night">
                  {kumanthong[0].images[0] ? (
                    <Image
                      src={kumanthong[0].images[0]}
                      alt={kumanthong[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 576px"
                      className="object-contain p-4 transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ImageFallback className="text-5xl" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold leading-snug text-ivory">
                    {kumanthong[0].title}
                  </h3>
                  <p className="mt-1 font-heading font-semibold text-gold-light">
                    {kumanthong[0].priceText}
                  </p>
                </div>
              </Link>
            )}
            {kumanthong.slice(1).map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* เครื่องรางและวัตถุมงคลอื่น ๆ — โชว์ความหลากหลายนอกจากกุมารทอง */}
      <section className="px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>{t.home.othersTitle}</SectionHeading>
            <Link href={l("/products")} className="text-sm font-semibold text-gold hover:underline">
              {t.home.viewAll}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {otherAmulets.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* วิธีสั่งบูชา — แถบงาช้าง timeline 3 ขั้นตอน */}
      <section className="bg-ivory px-4 py-12 text-night lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t.home.orderEasy}</h2>
            <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
          <div className="mt-10 grid gap-2 sm:[grid-template-columns:1fr_4rem_1fr_4rem_1fr]">
            {t.home.orderSteps.map((s, i) => (
              <div key={i} className="contents">
                {i > 0 && (
                  <div aria-hidden>
                    <div className="mx-auto h-7 w-0.5 bg-gold sm:mt-7 sm:h-0.5 sm:w-full" />
                  </div>
                )}
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-crimson font-heading text-2xl font-bold text-ivory shadow-lg shadow-crimson/25">
                    {i + 1}
                  </div>
                  <h3 className="font-heading mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-night/65">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ภาพงานพิธีจริง — 1 ใหญ่ + 4 เล็ก รูปเด่นบนพื้นดำ */}
      <section className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="flex items-baseline justify-between">
          <SectionHeading>{t.home.ceremonyGallery}</SectionHeading>
          <Link href={l("/gallery")} className="text-sm font-semibold text-gold hover:underline">
            {t.home.viewAll}
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-smoke">{t.home.ceremonyGalleryLead}</p>
        <div className="mt-6 grid auto-rows-[9rem] grid-cols-2 gap-4 sm:grid-cols-3 sm:[grid-template-columns:1.7fr_1fr_1fr]">
          {galleryPreview.map((g, i) => (
            <Link
              key={g.id}
              href={l(`/gallery/${g.id}`)}
              className={`group relative overflow-hidden rounded-2xl border border-gold/20 bg-night-soft transition hover:border-gold/60 ${
                i === 0 ? "col-span-2 sm:col-span-1 sm:row-span-2" : ""
              }`}
            >
              <Image
                src={g.images[0]}
                alt={g.title}
                fill
                sizes={i === 0 ? "(max-width: 640px) 100vw, 45vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <p
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/90 via-night/50 to-transparent px-4 pb-3 pt-10 font-medium leading-snug text-ivory ${
                  i === 0 ? "text-base" : "line-clamp-2 text-sm"
                }`}
              >
                {g.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* บทความล่าสุด — เด่น 1 + รายการ 3 */}
      <section className="bg-night-soft px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <SectionHeading>{t.home.latestArticles}</SectionHeading>
            <Link href={l("/articles")} className="text-sm font-semibold text-gold hover:underline">
              {t.home.viewAll}
            </Link>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            {featureArticle && (
              <Link
                href={l(`/articles/${featureArticle.id}`)}
                className="group overflow-hidden rounded-2xl border border-smoke/20 bg-night transition hover:border-gold/50"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {featureArticle.images[0] ? (
                    <Image
                      src={featureArticle.images[0]}
                      alt={featureArticle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 640px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ImageFallback className="text-4xl" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-smoke">
                    {featureArticle.dateText} · {t.home.readCount(featureArticle.views?.toLocaleString() ?? "-")}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-ivory group-hover:text-gold-light">
                    {featureArticle.title}
                  </h3>
                </div>
              </Link>
            )}
            <div className="flex flex-col gap-3">
              {listArticles.map((a) => (
                <Link
                  key={a.id}
                  href={l(`/articles/${a.id}`)}
                  className="group grid flex-1 grid-cols-[6rem_1fr] items-center gap-4 rounded-xl border border-smoke/20 bg-night p-3 transition hover:border-gold/50"
                >
                  <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-night-soft">
                    {a.images[0] ? (
                      <Image src={a.images[0]} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <ImageFallback className="text-xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ivory group-hover:text-gold-light">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-xs text-smoke">
                      {a.dateText} · {t.home.readCount(a.views?.toLocaleString() ?? "-")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* แถบชวนแอด LINE ปิดท้าย */}
      <section className="bg-brown-gold">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-8">
          <div className="min-w-0 flex-1 basis-72">
            <h2 className="font-heading text-xl font-semibold text-gold-light">{t.home.lineCta.title}</h2>
            <p className="mt-1 text-sm text-ivory/75">{t.home.lineCta.text}</p>
          </div>
          <LineLink
            href={lineChatUrl(t.line.floatingGreeting)}
            lang={lang}
            className="inline-flex items-center gap-2.5 rounded-xl bg-line-green px-6 py-3 font-bold text-[#06320f] transition hover:brightness-105"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 11.5c0 4.1-4 7.5-9 7.5-1 0-2-.14-2.9-.4L4 20l1.3-3.1C3.9 15.6 3 13.6 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5z" /></svg>
            {t.home.lineCta.button}
          </LineLink>
        </div>
      </section>
    </div>
  );
}
