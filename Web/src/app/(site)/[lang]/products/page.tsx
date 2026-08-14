import type { Metadata } from "next";
import CategorySidebar from "@/components/CategorySidebar";
import CategoryCatalog, { type CatalogSection, type CatalogAccent } from "@/components/CategoryCatalog";
import ProductExplorer, { type ExplorerItem } from "@/components/ProductExplorer";
import JsonLd from "@/components/JsonLd";
import {
  getSiteData,
  productsInCategory,
  categoryGroups,
  categoryCount,
  productPath,
} from "@/lib/db";
import { parseThaiTimestamp } from "@/lib/thai-date";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; q?: string; all?: string }>;
}): Promise<Metadata> {
  const [{ lang: langParam }, { cat, q, all }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const data = await getSiteData(lang);
  const name = cat ? data.categoryNames[cat] : undefined;
  if (cat && !name) return {};
  const path = cat ? `/products?cat=${cat}` : "/products";
  const languages = { th: cat ? `/products?cat=${cat}` : "/products", en: cat ? `/en/products?cat=${cat}` : "/en/products" };
  // หน้าผลค้นหา/ตารางรวมไม่ควรติด index — สินค้าชุดเดียวกับหน้าแคตตาล็อก
  if (q || all) {
    return {
      title: q ? t.products.metaSearch(q) : t.products.allTitle,
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

// สีประจำหมวดพุทธคุณบนการ์ดคำโปรยหัวแถว
const POWER_ACCENTS: Record<string, CatalogAccent> = {
  "91638": "gold", // เครื่องรางเสริมโชคลาภ
  "41976": "ember", // เครื่องรางมหาเสน่ห์
  "102273": "crimson", // วัตถุมงคลเสริมดวง สะเดาะเคราะห์
};

/** จำนวนสินค้าต่อหนึ่งแถวเลื่อน */
const RAIL_SIZE = 6;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; q?: string; all?: string }>;
}) {
  const [{ lang: langParam }, { cat, q, all }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const data = await getSiteData(lang);
  const { categoryNames } = data;
  // วิวเริ่มต้น = แคตตาล็อกรายหมวด; กรองหมวด/ค้นหา/กด "ดูทั้งหมด" = ตารางรวมแบบเดิม
  const catalogView = !cat && !q && !all;
  const heading = cat ? categoryNames[cat] ?? t.products.fallbackTitle : t.products.allTitle;
  const list = cat ? productsInCategory(data, cat) : data.products;

  // ฉบับเบาสำหรับ client: การ์ด + ฟิลด์ค้น/เรียง (ไม่ส่ง description ลง payload)
  // โหมดแคตตาล็อกไม่ใช้ตารางนี้ จึงไม่ต้องสร้าง payload ทิ้ง
  const items: ExplorerItem[] = catalogView
    ? []
    : list.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        priceText: p.priceText,
        soldOut: p.soldOut,
        images: p.images.slice(0, 1),
        price: p.price,
        ts: parseThaiTimestamp(p.updatedAt),
        // แท็กเข้าช่องค้นด้วย — ชิป #แท็ก ใต้สินค้าลิงก์มาที่ ?q= คำนี้
        search: [p.title, ...p.categories.map((c) => c.name), ...(p.tags ?? [])]
          .join(" ")
          .toLowerCase(),
      }));

  // แคตตาล็อก: หมวดย่อยของกุมารทอง + หมวดพุทธคุณ (ไม่รวมพระเกจิ — มีหน้า /masters ของตัวเอง)
  let sections: CatalogSection[] = [];
  if (catalogView) {
    const typeGroup = categoryGroups.find((g) => g.slug === "type");
    const powerGroup = categoryGroups.find((g) => g.slug === "power");
    // หมวดใหญ่ "กุมารทอง" ไม่เอาลงแคตตาล็อก — ของซ้ำกับหมวดย่อยเกือบทั้งหมด
    const typeIds = typeGroup?.ids[0] ? typeGroup.children?.[typeGroup.ids[0]] ?? [] : [];

    const section = (id: string, accent?: CatalogAccent): CatalogSection => {
      const inCat = productsInCategory(data, id);
      // โชว์ของที่ยังบูชาได้ก่อน แล้วค่อยต่อด้วยที่หมดแล้ว (ยังเป็นประวัติรุ่นที่คนอยากดู)
      const ranked = [...inCat].sort((a, b) => Number(a.soldOut) - Number(b.soldOut));
      const withImage = ranked.filter((p) => p.images[0]);
      return {
        id,
        name: categoryNames[id] ?? id,
        total: inCat.length,
        image: data.categoryImages[id] ?? withImage[0]?.images[0] ?? null,
        accent,
        items: withImage.slice(0, RAIL_SIZE).map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          priceText: p.priceText,
          soldOut: p.soldOut,
          images: p.images.slice(0, 1),
        })),
      };
    };

    // หมวดที่ของหมดทั้งหมด (เช่น "กุมารทอง หมดแล้ว") ไม่ขึ้นแคตตาล็อก — แถวที่กดบูชาไม่ได้สักชิ้น
    // ไม่ช่วยคนที่กำลังเลือกของ แต่ยังกดดูได้จากแถบหมวดหมู่ด้านซ้าย
    const hasAvailable = (id: string) => productsInCategory(data, id).some((p) => !p.soldOut);
    sections = [
      ...typeIds.map((id) => section(id)),
      ...(powerGroup?.ids ?? []).map((id) => section(id, POWER_ACCENTS[id] ?? "gold")),
    ].filter((s) => s.items.length > 0 && hasAvailable(s.id));
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

  // หน้าค้นหา/ตารางรวมเป็น noindex อยู่แล้ว (ดู generateMetadata) จึงไม่ต้องมี structured data
  // แคตตาล็อกโชว์แค่หัวแถวละ RAIL_SIZE ชิ้น และของชิ้นเดียวอยู่ได้หลายหมวด — ตัดซ้ำก่อนเข้า ItemList
  const listed = catalogView
    ? [...new Map(sections.flatMap((s) => s.items).map((p) => [p.id, p])).values()]
    : list;
  const jsonLd = q || all
    ? null
    : [
        itemListJsonLd(
          heading,
          listed.map((p) => ({ name: p.title, path: l(productPath(p)) }))
        ),
        ...(cat
          ? [
              breadcrumbJsonLd([
                { name: t.nav.home, path: l("/") },
                { name: t.products.allTitle, path: l("/products") },
                { name: heading },
              ]),
            ]
          : []),
      ];

  return (
    // pb ล่างเผื่อปุ่ม Line ลอย ไม่ให้ทับราคาการ์ดแถวสุดท้ายบนมือถือ
    <div className="mx-auto max-w-6xl px-4 py-8">
      {jsonLd && <JsonLd data={jsonLd} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{heading}</h1>
        <div className="flex gap-8 lg:hidden">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} lang={lang} />
        </div>
      </div>

      <div className="mt-6 flex items-start gap-8">
        <div className="hidden lg:contents">
          <CategorySidebar groups={sidebarGroups} active={cat} total={data.products.length} lang={lang} />
        </div>
        {catalogView ? (
          <CategoryCatalog sections={sections} totalProducts={data.products.length} lang={lang} />
        ) : (
          <ProductExplorer key={cat ?? "all"} items={items} lang={lang} />
        )}
      </div>
    </div>
  );
}
