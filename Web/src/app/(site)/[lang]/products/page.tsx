import type { Metadata } from "next";
import CategorySidebar from "@/components/CategorySidebar";
import ProductExplorer, { type ExplorerItem } from "@/components/ProductExplorer";
import { getSiteData, productsInCategory, categoryGroups, categoryCount } from "@/lib/db";
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

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const [{ lang: langParam }, { cat }] = await Promise.all([params, searchParams]);
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

  const sidebarGroups = categoryGroups.map((g) => ({
    label: t.categoryGroups[g.slug] ?? g.label,
    slug: g.slug,
    items: g.ids
      .map((id) => ({ id, name: categoryNames[id] ?? id, count: categoryCount(data, id) }))
      .filter((item) => item.count > 0),
  }));

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

      <div className="mt-6 flex items-start gap-8">
        <div className="hidden lg:contents">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} lang={lang} />
        </div>
        <ProductExplorer key={cat ?? "all"} items={items} lang={lang} />
      </div>
    </div>
  );
}
