import type { Metadata } from "next";
import CategorySidebar from "@/components/CategorySidebar";
import CategoryShowcase, { type ShowcaseTile, type PowerAccent } from "@/components/CategoryShowcase";
import ProductExplorer, { type ExplorerItem } from "@/components/ProductExplorer";
import { getSiteData, productsInCategory, categoryGroups, categoryCount } from "@/lib/db";
import type { Product } from "@/lib/data";
import { parseThaiTimestamp } from "@/lib/thai-date";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; q?: string }>;
}): Promise<Metadata> {
  const [{ lang: langParam }, { cat, q }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const data = await getSiteData(lang);
  const name = cat ? data.categoryNames[cat] : undefined;
  if (cat && !name) return {};
  const path = cat ? `/products?cat=${cat}` : "/products";
  const languages = { th: cat ? `/products?cat=${cat}` : "/products", en: cat ? `/en/products?cat=${cat}` : "/en/products" };
  // หน้าผลค้นหาไม่ควรติด index — เนื้อหาซ้ำกับหน้า list
  if (q) {
    return {
      title: t.products.metaSearch(q),
      robots: { index: false },
      alternates: { canonical: href(lang, path) },
    };
  }
  return {
    title: name ?? t.products.allTitle,
    description: name
      ? t.products.metaCatDescription(name, categoryCount(data, cat!))
      : t.products.metaDescription,
    alternates: { canonical: href(lang, path), languages },
  };
}

// สีประจำหมวดพุทธคุณบนแถบ showcase
const POWER_ACCENTS: Record<string, PowerAccent> = {
  "91638": "gold", // เครื่องรางเสริมโชคลาภ
  "41976": "ember", // เครื่องรางมหาเสน่ห์
  "102273": "crimson", // วัตถุมงคลเสริมดวง สะเดาะเคราะห์
};

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const [{ lang: langParam }, { cat, q }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const data = await getSiteData(lang);
  const { categoryNames } = data;
  const list = cat ? productsInCategory(data, cat) : data.products;

  // ฉบับเบาสำหรับ client: การ์ด + ฟิลด์ค้น/เรียง (ไม่ส่ง description ลง payload)
  const items: ExplorerItem[] = list.map((p) => ({
    id: p.id,
    title: p.title,
    priceText: p.priceText,
    soldOut: p.soldOut,
    images: p.images.slice(0, 1),
    price: p.price,
    ts: parseThaiTimestamp(p.updatedAt),
    search: [p.title, ...p.categories.map((c) => c.name)].join(" ").toLowerCase(),
  }));

  // แถบหมวดหมู่พร้อมรูปตัวอย่าง — เฉพาะวิวรวมที่ยังไม่กรอง/ค้นหา (ประเภท+พุทธคุณ ไม่รวมพระเกจิ)
  let showcase: { hero: ShowcaseTile; subs: ShowcaseTile[]; powers: (ShowcaseTile & { accent: PowerAccent })[] } | null = null;
  if (!cat && !q) {
    // รูปการ์ด: รูปที่เจ้าของตั้งใน /admin/settings มาก่อน — ไม่ตั้งใช้สินค้า
    // พร้อมบูชาชิ้นแรกที่มีรูปในหมวดนั้น (ไม่มีก็เอาที่หมดแล้ว)
    // กันรูปซ้ำข้ามการ์ด — สินค้ากุมารทองมักติดทั้งหมวดใหญ่และหมวดย่อย
    const usedImages = new Set<string>(Object.values(data.categoryImages));
    const tile = (id: string): ShowcaseTile => {
      const custom = data.categoryImages[id];
      const items = productsInCategory(data, id);
      const fresh = (p: Product) => p.images[0] && !usedImages.has(p.images[0]);
      const withImage =
        items.find((p) => !p.soldOut && fresh(p)) ?? items.find(fresh) ?? items.find((p) => p.images[0]);
      const image = custom ?? withImage?.images[0] ?? null;
      if (image) usedImages.add(image);
      return { id, name: categoryNames[id] ?? id, count: items.length, image };
    };
    const typeGroup = categoryGroups.find((g) => g.slug === "type");
    const powerGroup = categoryGroups.find((g) => g.slug === "power");
    const heroId = typeGroup?.ids[0];
    if (heroId && typeGroup && powerGroup) {
      const hero = tile(heroId);
      const subs = (typeGroup.children?.[heroId] ?? []).map(tile).filter((s) => s.count > 0);
      const powers = powerGroup.ids
        .map((id) => ({ ...tile(id), accent: POWER_ACCENTS[id] ?? ("gold" as PowerAccent) }))
        .filter((p) => p.count > 0);
      if (hero.count > 0) showcase = { hero, subs, powers };
    }
  }

  const sidebarGroups = categoryGroups.map((g) => {
    const childIds = new Set(Object.values(g.children ?? {}).flat());
    const toItem = (id: string) => ({ id, name: categoryNames[id] ?? id, count: categoryCount(data, id) });
    return {
      label: t.categoryGroups[g.slug] ?? g.label,
      slug: g.slug,
      items: g.ids
        .filter((id) => !childIds.has(id))
        .map((id) => ({
          ...toItem(id),
          children: (g.children?.[id] ?? []).map(toItem).filter((c) => c.count > 0),
        }))
        .filter((item) => item.count > 0),
    };
  });

  return (
    // pb ล่างเผื่อปุ่ม Line ลอย ไม่ให้ทับราคาการ์ดแถวสุดท้ายบนมือถือ
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">
          {cat ? categoryNames[cat] ?? t.products.fallbackTitle : t.products.allTitle}
        </h1>
        <div className="flex gap-8 lg:hidden">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} lang={lang} />
        </div>
      </div>

      {showcase && (
        <div className="mt-6">
          <CategoryShowcase hero={showcase.hero} subs={showcase.subs} powers={showcase.powers} lang={lang} />
        </div>
      )}

      <div className="mt-6 flex items-start gap-8">
        <div className="hidden lg:contents">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} lang={lang} />
        </div>
        <ProductExplorer key={cat ?? "all"} items={items} lang={lang} />
      </div>
    </div>
  );
}
