import Link from "next/link";
import GalleryForm from "../GalleryForm";

export const dynamic = "force-dynamic";

export default function NewGalleryPage() {
  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/gallery"
        className="inline-flex items-center gap-1 text-sm text-smoke transition hover:text-gold-light"
      >
        ← กลับไปรายการอัลบั้ม
      </Link>
      <h1 className="mt-2 font-heading text-xl font-bold text-gold">เพิ่มอัลบั้มใหม่</h1>
      <p className="mt-1 text-sm text-smoke">
        อัลบั้มใหม่จะขึ้นบนสุดและโชว์ในบล็อก “ภาพงานพิธีจริง” บนหน้าแรกทันทีที่บันทึก
      </p>
      <div className="mt-4">
        <GalleryForm />
      </div>
    </div>
  );
}
