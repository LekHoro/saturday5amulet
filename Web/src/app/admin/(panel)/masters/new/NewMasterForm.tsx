"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaster } from "../../../actions";

export interface CatCountOption {
  id: string;
  name: string;
  count: number;
}

const SLUG_RE = /^[a-z0-9-]+$/;

export default function NewMasterForm({ options }: { options: CatCountOption[] }) {
  const router = useRouter();
  const [catId, setCatId] = useState(options[0]?.id ?? "");
  const [name, setName] = useState(options[0]?.name ?? "");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (options.length === 0) {
    return (
      <p className="rounded-2xl border border-gold/20 bg-night-soft p-4 text-sm text-smoke">
        ทุกหมวดหมู่สินค้าที่มีอยู่ตอนนี้มีการ์ดอาจารย์ครบแล้ว — ถ้าจะเพิ่มอาจารย์ใหม่ทั้งหมดที่ยังไม่มีวัตถุมงคลในระบบ
        ต้องแท็กหมวดหมู่ใหม่ให้สินค้าในโค้ดก่อน แจ้งผู้ดูแลเว็บได้เลย
      </p>
    );
  }

  function onPickCat(id: string) {
    setCatId(id);
    const opt = options.find((o) => o.id === id);
    if (opt) setName(opt.name);
  }

  async function onSave() {
    setError(null);
    if (!catId) return setError("กรุณาเลือกหมวดหมู่");
    if (!name.trim()) return setError("กรุณาใส่ชื่ออาจารย์");
    if (!SLUG_RE.test(slug)) {
      return setError("สลัก (slug) ต้องเป็นอักษรอังกฤษพิมพ์เล็ก ตัวเลข หรือ - เท่านั้น เช่น kalong");
    }
    setSaving(true);
    const res = await createMaster({ slug, catId, name: name.trim() });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push(`/admin/masters/${res.slug}`);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold">หมวดหมู่สินค้า</label>
        <p className="mt-0.5 text-xs text-smoke">เฉพาะหมวดที่มีสินค้าอยู่แล้วแต่ยังไม่มีอาจารย์ผูกไว้</p>
        <select
          value={catId}
          onChange={(e) => onPickCat(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.count} ชิ้น)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold">ชื่ออาจารย์ / สำนัก</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">สลัก (slug สำหรับลิงก์หน้าเว็บ)</label>
        <p className="mt-0.5 text-xs text-smoke">
          อักษรอังกฤษพิมพ์เล็ก ตัวเลข หรือ - เท่านั้น เช่น kalong (จะได้ลิงก์ /masters/kalong)
        </p>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value.trim())}
          placeholder="เช่น kalong"
          className="mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 font-mono text-ivory outline-none focus:border-gold"
        />
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "สร้างอาจารย์ใหม่"}
      </button>
    </div>
  );
}
