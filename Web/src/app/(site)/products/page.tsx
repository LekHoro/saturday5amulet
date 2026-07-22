import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import { getData, productsInCategory, categoryGroups, categoryCount } from "@/lib/db";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}): Promise<Metadata> {
  const { cat } = await searchParams;
  const data = await getData();
  const name = cat ? data.categoryNames[cat] : undefined;
  if (cat && !name) return {};
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
  // available first, sold-out last
  const sorted = [...list].sort((a, b) => Number(a.soldOut) - Number(b.soldOut));

  const sidebarGroups = categoryGroups.map((g) => ({
    label: g.label,
    slug: g.slug,
    items: g.ids
      .map((id) => ({ id, name: categoryNames[id] ?? id, count: categoryCount(data, id) }))
      .filter((item) => item.count > 0),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">
            {cat ? categoryNames[cat] ?? "วัตถุมงคล" : "วัตถุมงคลและเครื่องรางทั้งหมด"}
          </h1>
          <p className="mt-1 text-sm text-smoke">{sorted.length} รายการ</p>
        </div>
        <div className="flex gap-8 lg:hidden">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} />
        </div>
      </div>

      <div className="mt-6 flex items-start gap-8">
        <div className="hidden lg:contents">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
