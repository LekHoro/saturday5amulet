import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products, productsInCategory, categoryNames, categoryGroups, categoryCount } from "@/lib/data";

export const metadata: Metadata = {
  title: "วัตถุมงคลและเครื่องรางทั้งหมด",
  description:
    "รวมวัตถุมงคล เครื่องราง กุมารทอง กุมารี จากพระเกจิอาจารย์ชื่อดัง เลือกชมตามประเภท พุทธคุณ หรือพระเกจิ",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const list = cat ? productsInCategory(cat) : products;
  // available first, sold-out last
  const sorted = [...list].sort((a, b) => Number(a.soldOut) - Number(b.soldOut));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-maroon">
        {cat ? categoryNames[cat] ?? "วัตถุมงคล" : "วัตถุมงคลและเครื่องรางทั้งหมด"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">{sorted.length} รายการ</p>

      {/* filter chips */}
      <div className="mt-4 space-y-2">
        {categoryGroups.map((g) => (
          <div key={g.slug} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">{g.label}:</span>
            {g.ids
              .filter((id) => categoryCount(id) > 0)
              .map((id) => (
                <Link
                  key={id}
                  href={cat === id ? "/products" : `/products?cat=${id}`}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    cat === id
                      ? "border-maroon bg-maroon text-white"
                      : "border-gold/40 bg-white text-foreground hover:border-maroon hover:text-maroon"
                  }`}
                >
                  {categoryNames[id]}
                </Link>
              ))}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
