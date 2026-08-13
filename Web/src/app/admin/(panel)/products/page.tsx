import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import ProductAdminList, { type AdminProduct } from "./ProductAdminList";
import type { Category, EnContent } from "@/lib/data";
import { coverImage } from "@/lib/media";

// อ่านตรงจาก Supabase เสมอ (ไม่ใช้ cache ของหน้าเว็บ) เพื่อให้เห็นสถานะล่าสุด
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  // saved=1 มาจากปุ่ม "บันทึก" ในฟอร์ม — เด้งกลับมาหน้านี้แล้วยืนยันผลด้วย toast
  searchParams: Promise<{ saved?: string }>;
}) {
  const sp = await searchParams;
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("id,title,price_text,sku,sold_out,visible,position,images,categories,en")
    .order("position")
    .limit(5000);

  if (error) {
    return (
      <p className="text-sm text-ember">
        อ่านข้อมูลไม่สำเร็จ: {error.message} — ตรวจว่ารัน schema.sql และ seed แล้ว
      </p>
    );
  }

  // ชื่อหมวดมาจากสินค้าจริง (แหล่งเดียวกับ sidebar หน้าเว็บ) — id ที่ไม่มีชื่อคือหมวดร้าง
  const catNames: Record<string, string> = {};
  for (const r of data ?? [])
    for (const c of (r.categories ?? []) as Category[]) catNames[c.id] = c.name;

  const products: AdminProduct[] = (data ?? []).map((r) => {
    const en = r.en as EnContent | null;
    return {
      id: r.id,
      title: r.title,
      priceText: r.price_text ?? "",
      sku: r.sku,
      soldOut: !!r.sold_out,
      visible: r.visible !== false,
      position: r.position ?? 0,
      thumb: coverImage(r.images as string[] | null) ?? null,
      catIds: ((r.categories ?? []) as Category[]).map((c) => c.id),
      hasEn: !!(en?.title?.trim() || en?.html?.trim()),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-gold">วัตถุมงคล ({products.length})</h1>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-night transition hover:brightness-110"
        >
          ＋ เพิ่มใหม่
        </Link>
      </div>
      <ProductAdminList products={products} catNames={catNames} justSaved={sp.saved === "1"} />
    </div>
  );
}
