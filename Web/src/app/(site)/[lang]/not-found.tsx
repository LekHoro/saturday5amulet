import Link from "next/link";

// not-found ใต้ [lang] — ไม่รู้ภาษาจาก params (ถูกเรียกจาก notFound() ได้ทุกจุด) จึงแสดงสองภาษา
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-heading text-5xl font-bold text-gold">404</p>
      <h1 className="font-heading mt-4 text-xl font-semibold text-ivory">
        ไม่พบหน้าที่ต้องการ · Page not found
      </h1>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-gold px-6 py-3 font-bold text-night shadow transition hover:brightness-110"
        >
          กลับหน้าแรก
        </Link>
        <Link
          href="/en"
          className="rounded-xl border border-gold-light/60 px-6 py-3 font-semibold text-gold-light transition hover:bg-gold/10"
        >
          English home
        </Link>
      </div>
    </div>
  );
}
