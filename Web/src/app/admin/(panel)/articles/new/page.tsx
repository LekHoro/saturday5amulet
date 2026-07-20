import ArticleForm from "../ArticleForm";

// หน้า admin ทุกหน้าต้องเรนเดอร์ตอน request (มีเช็ค login ใน layout)
export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">เขียนบทความ / ข่าวใหม่</h1>
      <div className="mt-4">
        <ArticleForm />
      </div>
    </div>
  );
}
