import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AdminHome() {
  const sb = await createSupabaseServer();
  const [{ count: total }, { count: soldOut }, { count: articleCount }] = await Promise.all([
    sb.from("products").select("id", { count: "exact", head: true }),
    sb.from("products").select("id", { count: "exact", head: true }).eq("sold_out", true),
    sb.from("articles").select("id", { count: "exact", head: true }),
  ]);
  const available = (total ?? 0) - (soldOut ?? 0);

  const stats = [
    { label: "พร้อมบูชา", value: available, tone: "text-gold" },
    { label: "หมดแล้ว", value: soldOut ?? 0, tone: "text-smoke" },
    { label: "บทความ/ข่าว", value: articleCount ?? 0, tone: "text-ivory" },
  ];

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">ภาพรวมร้าน</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gold/25 bg-night-soft p-4 text-center">
            <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-xs text-smoke">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href="/admin/products/new"
          className="block rounded-2xl bg-gold p-4 text-center font-bold text-night shadow transition hover:brightness-110"
        >
          ＋ เพิ่มวัตถุมงคลใหม่
        </Link>
        <Link
          href="/admin/products"
          className="block rounded-2xl border border-gold/30 bg-night-soft p-4 text-center font-semibold text-gold-light transition hover:border-gold"
        >
          จัดการวัตถุมงคล / ติ๊กหมดแล้ว
        </Link>
        <Link
          href="/"
          target="_blank"
          className="block rounded-2xl border border-gold/20 p-4 text-center text-sm text-smoke transition hover:border-gold/50 hover:text-gold-light"
        >
          เปิดดูหน้าเว็บจริง ↗
        </Link>
      </div>
    </div>
  );
}
