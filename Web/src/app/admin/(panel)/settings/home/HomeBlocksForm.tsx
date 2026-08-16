"use client";

import { useState, useTransition } from "react";
import { saveHomeBlocks } from "../../../actions";
import {
  DEFAULT_HOME_BLOCKS,
  HOME_BLOCK_INFO,
  newBlockKey,
  type HomeBlock,
} from "@/lib/home-blocks";

export interface CatOption {
  id: string;
  name: string;
  group: string;
}

export default function HomeBlocksForm({
  initial,
  cats,
}: {
  initial: HomeBlock[];
  cats: CatOption[];
}) {
  const [items, setItems] = useState<HomeBlock[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [addCat, setAddCat] = useState(cats[0]?.id ?? "");

  function update(next: HomeBlock[]) {
    setItems(next);
    setDirty(true);
    setMsg(null);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  }

  function toggle(i: number) {
    const next = [...items];
    next[i] = { ...next[i], on: !next[i].on };
    update(next);
  }

  function remove(i: number) {
    update(items.filter((_, k) => k !== i));
  }

  function addProductRow() {
    if (!addCat) return;
    update([
      ...items,
      { key: newBlockKey("productRow"), kind: "productRow", on: true, catId: addCat },
    ]);
  }

  function reset() {
    if (!confirm("กลับไปใช้ลำดับตั้งต้นของเว็บ? บล็อกที่เพิ่มเองจะหายไป")) return;
    update(DEFAULT_HOME_BLOCKS);
  }

  function save() {
    startTransition(async () => {
      const { error } = await saveHomeBlocks(items);
      if (error) {
        setMsg(`บันทึกไม่สำเร็จ: ${error}`);
        return;
      }
      setDirty(false);
      setMsg("บันทึกแล้ว — เปิดหน้าเว็บดูได้เลย");
    });
  }

  const catName = (id?: string) => cats.find((c) => c.id === id)?.name ?? id ?? "";
  const groups = [...new Set(cats.map((c) => c.group))];

  return (
    <div>
      <ol className="space-y-2">
        {items.map((b, i) => {
          const info = HOME_BLOCK_INFO[b.kind];
          return (
            <li
              key={b.key}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                b.on ? "border-gold/25 bg-night-soft" : "border-smoke/20 bg-night-soft/40"
              }`}
            >
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="เลื่อนขึ้น"
                  className="rounded-md border border-gold/30 px-1.5 py-0.5 text-xs text-gold-light transition hover:border-gold disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="เลื่อนลง"
                  className="rounded-md border border-gold/30 px-1.5 py-0.5 text-xs text-gold-light transition hover:border-gold disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <div className={`min-w-0 flex-1 ${b.on ? "" : "opacity-55"}`}>
                <div className="truncate text-sm font-medium">
                  <span className="mr-1.5 text-xs text-smoke">{i + 1}.</span>
                  {b.kind === "productRow" ? `แถวสินค้า · ${catName(b.catId)}` : info.label}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-smoke">{info.note}</div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={b.on}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                    b.on
                      ? "border-gold/50 text-gold-light hover:border-gold"
                      : "border-smoke/40 text-smoke hover:text-ivory"
                  }`}
                >
                  {b.on ? "แสดงอยู่" : "ซ่อนอยู่"}
                </button>
                {info.repeatable && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="ลบบล็อกนี้"
                    className="rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10"
                  >
                    ลบ
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* เพิ่มบล็อกเอง — ตอนนี้มีชนิดเดียวคือแถวสินค้าตามหมวด (บล็อกอื่นมีอยู่แล้วในลิสต์ กดเปิด-ปิดเอา) */}
      <div className="mt-4 rounded-2xl border border-dashed border-gold/30 p-3">
        <p className="text-xs font-semibold text-gold-light">เพิ่มแถวสินค้าตามหมวด</p>
        <p className="mt-1 text-xs leading-relaxed text-smoke">
          เลือกหมวดแล้วกดเพิ่ม จะได้แถวสินค้า 4 ชิ้นที่ยังมีของ ต่อท้ายลิสต์ — เลื่อนขึ้นไปวางตรงไหนก็ได้
          (หมวดที่ไม่เหลือของ เว็บจะข้ามแถวนั้นให้เอง)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={addCat}
            onChange={(e) => setAddCat(e.target.value)}
            aria-label="หมวดสินค้า"
            className="min-w-0 flex-1 rounded-lg border border-gold/30 bg-night px-3 py-2 text-sm"
          >
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {cats
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={addProductRow}
            className="rounded-lg border border-gold/50 px-4 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/10"
          >
            + เพิ่มบล็อก
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-xl bg-gold px-5 py-2.5 font-bold text-night transition hover:brightness-110 disabled:opacity-40"
        >
          {pending ? "กำลังบันทึก…" : "บันทึกลำดับ"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-smoke underline transition hover:text-ivory"
        >
          กลับไปใช้ลำดับตั้งต้น
        </button>
        {dirty && !pending && <span className="text-xs text-gold-light">ยังไม่ได้บันทึก</span>}
        {msg && <span className="text-xs text-ivory/80">{msg}</span>}
      </div>
    </div>
  );
}
