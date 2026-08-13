import Link from "next/link";
import { getData } from "@/lib/db";
import ArticleForm from "../ArticleForm";
import { buildArticleCatOptions } from "../catOptions";

// หน้า admin ทุกหน้าต้องเรนเดอร์ตอน request (มีเช็ค login ใน layout)
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const { articles } = await getData();
  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1 text-sm text-smoke transition hover:text-gold-light"
      >
        ← กลับไปรายการบทความ
      </Link>
      <h1 className="mt-2 font-heading text-xl font-bold text-gold">เขียนบทความ / ข่าวใหม่</h1>
      <div className="mt-4">
        <ArticleForm catOptions={buildArticleCatOptions(articles)} />
      </div>
    </div>
  );
}
