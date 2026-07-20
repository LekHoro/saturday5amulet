import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getData } from "@/lib/db";
import ProductForm, { type ProductFormValues } from "../ProductForm";
import { buildCatOptions } from "../catOptions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  };

  const { products } = await getData();

  return (
    <div>
      <h1 className="font-heading line-clamp-2 text-xl font-bold text-gold">แก้ไข: {r.title}</h1>
      <div className="mt-4">
        <ProductForm initial={initial} catOptions={buildCatOptions(products)} />
      </div>
    </div>
  );
}
