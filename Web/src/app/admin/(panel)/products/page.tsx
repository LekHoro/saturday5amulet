import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import ProductAdminList, { type AdminProduct } from "./ProductAdminList";

// อ่านตรงจาก Supabase เสมอ (ไม่ใช้ cache ของหน้าเว็บ) เพื่อให้เห็นสถานะล่าสุด
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("id,title,price_text,sku,sold_out,images")
    .order("position")
    .limit(5000);

  if (error) {
    return (
      <p className="text-sm text-ember">
        อ่านข้อมูลไม่สำเร็จ: {error.message} — ตรวจว่ารัน schema.sql และ seed แล้ว
      </p>
    );
  }

  const products: AdminProduct[] = (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    priceText: r.price_text ?? "",
    sku: r.sku,
    soldOut: !!r.sold_out,
    thumb: (r.images as string[] | null)?.[0] ?? null,
  }));

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
      <ProductAdminList products={products} />
    </div>
  );
}
