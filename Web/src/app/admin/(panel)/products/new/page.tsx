import { getData } from "@/lib/db";
import ProductForm from "../ProductForm";
import { buildCatOptions } from "../catOptions";

// หน้า admin ทุกหน้าต้องเรนเดอร์ตอน request (มีเช็ค login ใน layout)
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { products } = await getData();
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">เพิ่มวัตถุมงคลใหม่</h1>
      <div className="mt-4">
        <ProductForm catOptions={buildCatOptions(products)} />
      </div>
    </div>
  );
}
