import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getData } from "@/lib/db";
import ProductForm, { type ProductFormValues } from "../ProductForm";
import { buildCatOptions } from "../catOptions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  // copied=1 มาจากปุ่ม "ทำสำเนาเป็นชิ้นใหม่" — โชว์ toast ยืนยันว่านี่คือชิ้นสำเนาแล้ว
  searchParams: Promise<{ copied?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const sb = await createSupabaseServer();
  const { data: r } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  const initial: ProductFormValues = {
    id: r.id,
    title: r.title,
    priceText: r.price_text ?? "",
    price: r.price === null ? null : Number(r.price),
    sku: r.sku,
    soldOut: !!r.sold_out,
    categories: r.categories ?? [],
    descriptionHtml: r.description_html,
    images: r.images ?? [],
    slug: r.slug ?? null,
    tags: r.tags ?? [],
    seo: {
      // meta.title ที่เท่ากับชื่อรุ่นคือค่าเริ่มต้นของระบบ ไม่ใช่ของที่เจ้าของตั้งเอง — ปล่อยช่องว่างไว้
      title: r.meta?.title && r.meta.title !== r.title ? r.meta.title : null,
      description: r.meta?.description ?? null,
      keywords: r.meta?.keywords ?? null,
    },
    en: r.en ?? null,
  };

  const { products } = await getData();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-smoke transition hover:text-gold-light"
      >
        ← กลับไปรายการวัตถุมงคล
      </Link>
      <h1 className="mt-2 font-heading line-clamp-2 text-xl font-bold text-gold">
        แก้ไข: {r.title}
      </h1>
      <div className="mt-4">
        {/* key=id — บังคับให้ฟอร์มโหลดค่าใหม่เมื่อสลับไปสินค้าชิ้นอื่น (เช่นหลังทำสำเนา)
            ไม่งั้น React ใช้ state ของชิ้นเดิมต่อ เหมือนกดแล้วไม่มีอะไรเกิดขึ้น */}
        <ProductForm
          key={r.id}
          initial={initial}
          catOptions={buildCatOptions(products)}
          justCopied={sp.copied === "1"}
        />
      </div>
    </div>
  );
}
