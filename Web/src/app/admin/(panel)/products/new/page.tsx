import { getData } from "@/lib/db";
import ProductForm from "../ProductForm";
import { buildCatOptions } from "../catOptions";

// หน้า admin ทุกหน้าต้องเรนเดอร์ตอน request (มีเช็ค login ใน layout)
export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  // cats/saved/n มาจากปุ่ม "บันทึกแล้วเพิ่มต่อ" — คงหมวดหมู่ของชิ้นก่อน + โชว์ toast ยืนยัน
  searchParams: Promise<{ cats?: string; saved?: string; n?: string }>;
}) {
  const { products } = await getData();
  const sp = await searchParams;
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">เพิ่มวัตถุมงคลใหม่</h1>
      <div className="mt-4">
        <ProductForm
          key={sp.n ?? "0"}
          catOptions={buildCatOptions(products)}
          initialCatIds={sp.cats?.split(",").filter(Boolean)}
          justSaved={sp.saved === "1"}
        />
      </div>
    </div>
  );
}
