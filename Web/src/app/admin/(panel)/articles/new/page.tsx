import { getData } from "@/lib/db";
import ArticleForm from "../ArticleForm";
import { buildArticleCatOptions } from "../catOptions";

// หน้า admin ทุกหน้าต้องเรนเดอร์ตอน request (มีเช็ค login ใน layout)
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const { articles } = await getData();
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">เขียนบทความ / ข่าวใหม่</h1>
      <div className="mt-4">
        <ArticleForm catOptions={buildArticleCatOptions(articles)} />
      </div>
    </div>
  );
}
