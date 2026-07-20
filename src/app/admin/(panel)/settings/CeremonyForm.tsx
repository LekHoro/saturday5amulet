"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCeremony } from "../../actions";

export default function CeremonyForm({
  initial,
}: {
  initial: { label: string; date: string } | null;
}) {
  const router = useRouter();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const res = await saveCeremony(label, date);
    setSaving(false);
    if (res.error) {
      setMsg(`บันทึกไม่สำเร็จ: ${res.error}`);
      return;
    }
    setMsg(label.trim() && date ? "บันทึกแล้ว ✓ หน้าแรกจะแสดงนับถอยหลัง" : "ลบแล้ว — เว็บซ่อนบล็อกนับถอยหลัง");
    router.refresh();
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-gold/30 bg-night px-4 py-3 text-ivory outline-none focus:border-gold";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold">ชื่องาน</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="เช่น พิธีเสาร์ ๕ มหามงคล"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-sm font-semibold">วันที่จัดพิธี</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </div>
      {msg && <p className="text-sm text-gold-light">{msg}</p>}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-gold py-3 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {(label || date) && (
          <button
            onClick={() => {
              setLabel("");
              setDate("");
            }}
            className="rounded-xl border border-gold/30 px-4 py-3 text-sm text-smoke transition hover:border-gold"
          >
            เว้นว่าง
          </button>
        )}
      </div>
    </div>
  );
}
