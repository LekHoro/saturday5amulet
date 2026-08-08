import type { Metadata } from "next";
import CategorySidebar from "@/components/CategorySidebar";
import ProductExplorer, { type ExplorerItem } from "@/components/ProductExplorer";
import { getData, productsInCategory, categoryGroups, categoryCount } from "@/lib/db";
import { parseThaiTimestamp } from "@/lib/thai-date";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}): Promise<Metadata> {
  const { cat, q } = await searchParams;
  const data = await getData();
  const name = cat ? data.categoryNames[cat] : undefined;
  if (cat && !name) return {};
  // หน้าผลค้นหาไม่ควรติด index — เนื้อหาซ้ำกับหน้า list
  if (q) {
    return {
      title: `ค้นหา "${q}"`,
      robots: { index: false },
      alternates: { canonical: cat ? `/products?cat=${cat}` : "/products" },
    };
  }
  return {
    title: name ?? "วัตถุมงคลและเครื่องรางทั้งหมด",
    description: name
      ? `รวม${name}ทั้งหมด ${categoryCount(data, cat!)} รายการ — ของแท้จากวัดและสำนักโดยตรง พร้อมวิธีบูชาและคาถากำกับ`
      : "รวมวัตถุมงคล เครื่องราง กุมารทอง กุมารี จากพระเกจิอาจารย์ชื่อดัง เลือกชมตามประเภท พุทธคุณ หรือพระเกจิ",
    alternates: { canonical: cat ? `/products?cat=${cat}` : "/products" },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const data = await getData();
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
    label: g.label,
    slug: g.slug,
    items: g.ids
      .map((id) => ({ id, name: categoryNames[id] ?? id, count: categoryCount(data, id) }))
      .filter((item) => item.count > 0),
  }));

  return (
    // pb ล่างเผื่อปุ่ม Line ลอย ไม่ให้ทับราคาการ์ดแถวสุดท้ายบนมือถือ
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 lg:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">
          {cat ? categoryNames[cat] ?? "วัตถุมงคล" : "วัตถุมงคลและเครื่องรางทั้งหมด"}
        </h1>
        <div className="flex gap-8 lg:hidden">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} />
        </div>
      </div>

      <div className="mt-6 flex items-start gap-8">
        <div className="hidden lg:contents">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} />
        </div>
        <ProductExplorer key={cat ?? "all"} items={items} />
      </div>
    </div>
  );
}
