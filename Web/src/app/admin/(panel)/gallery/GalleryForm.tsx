"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageManager from "@/components/admin/ImageManager";
import { useDraft, draftTime } from "@/components/admin/useDraft";
import { thaiError } from "@/components/admin/adminErrors";
import { saveGallery, deleteGallery } from "../../actions";
import type { Category } from "@/lib/data";

export interface GalleryFormValues {
  id?: string;
  title: string;
  images: string[];
  categories: Category[];
  enTitle: string;
}

interface DraftData {
  title: string;
  images: string[];
  cats: Category[];
  enTitle: string;
}

export default function GalleryForm({
  initial,
  catOptions,
}: {
  initial?: GalleryFormValues;
  /** หมวดที่มีอยู่แล้วในอัลบั้มทั้งหมด — เลือกจากชิป กันหมวดแตกซ้ำจากการพิมพ์เอง */
  catOptions: Category[];
}) {
  const router = useRouter();
  const rowId = initial?.id;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [enTitle, setEnTitle] = useState(initial?.enTitle ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [cats, setCats] = useState<Category[]>(initial?.categories ?? []);
  const [newCat, setNewCat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // เกราะกันงานหาย — รูปที่อัปโหลดค้างไว้แต่ยังไม่ได้กดบันทึกจะกู้คืนได้
  const snapshot = useMemo<DraftData>(
    () => ({ title, images, cats, enTitle }),
    [title, images, cats, enTitle]
  );
  const draft = useDraft<DraftData>(`gallery:${rowId ?? "new"}`, snapshot);

  function applyDraft(d: DraftData) {
    setTitle(d.title);
    setImages(d.images);
    setCats(d.cats ?? []);
    setEnTitle(d.enTitle);
    draft.clearPending();
  }

  // ชิปที่แสดง = หมวดที่มีอยู่ทั้งเว็บ + หมวดของอัลบั้มนี้ที่ยังไม่อยู่ในรายการ (รวมหมวดที่เพิ่งพิมพ์เพิ่ม)
  const chipOptions = useMemo(() => {
    const seen = new Map<string, Category>();
    for (const c of [...catOptions, ...cats]) {
      const name = c.name.trim();
      if (name && !seen.has(name)) seen.set(name, c);
    }
    return [...seen.values()];
  }, [catOptions, cats]);
  const selectedNames = new Set(cats.map((c) => c.name.trim()));

  function toggleCat(c: Category) {
    setCats((xs) =>
      xs.some((x) => x.name.trim() === c.name.trim())
        ? xs.filter((x) => x.name.trim() !== c.name.trim())
        : [...xs, c]
    );
  }

  function addNewCat() {
    const name = newCat.trim();
    if (!name) return;
    setNewCat("");
    if (selectedNames.has(name)) return;
    const existing = chipOptions.find((c) => c.name.trim() === name);
    setCats((xs) => [
      ...xs,
      existing ?? { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), name },
    ]);
  }

  const chipCls = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition ${
      on ? "border-gold bg-gold text-night" : "border-gold/40 bg-night-soft text-ivory hover:border-gold"
    }`;

  async function onSave() {
    setError(null);
    if (!title.trim()) return setError("กรุณาใส่ชื่ออัลบั้ม");
    if (images.length === 0) return setError("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป");
    setSaving(true);
    const res = await saveGallery({
      id: rowId,
      title,
      images,
      enTitle,
      categories: cats.map((c) => ({ id: c.id, name: c.name.trim() })),
    });
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "บันทึก"));
      return;
    }
    draft.markSaved();
    router.push("/admin/gallery?saved=1");
    router.refresh();
  }

  async function onDelete() {
    if (!rowId) return;
    if (!confirm(`ลบอัลบั้ม "${initial?.title}" ทั้งอัลบั้ม (${images.length} รูป) ออกจากเว็บถาวร?`)) return;
    setSaving(true);
    const res = await deleteGallery(rowId);
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "ลบ"));
      return;
    }
    draft.markSaved();
    router.push("/admin/gallery?deleted=1");
    router.refresh();
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold";

  return (
    <div className="space-y-5">
      {draft.pending && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold/40 bg-gold/10 p-3 text-sm">
          <span>มีร่างที่ยังไม่ได้บันทึกจาก {draftTime(draft.pending.savedAt)}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applyDraft(draft.pending!.data)}
              className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-night"
            >
              กู้คืนร่าง
            </button>
            <button
              type="button"
              onClick={draft.dismissDraft}
              className="rounded-lg border border-gold/40 px-3 py-1.5 text-xs text-gold-light"
            >
              ทิ้งร่าง
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold">ชื่ออัลบั้ม</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น พิธีไหว้ครู อาจารย์เล็กเสาร์ห้า ปี 2569"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-sm font-semibold">
          ชื่ออัลบั้มภาษาอังกฤษ <span className="font-normal text-smoke">(ไม่บังคับ)</span>
        </label>
        <p className="mt-0.5 text-xs text-smoke">ใช้บนหน้า /en — เว้นว่างไว้ หน้าอังกฤษจะแสดงชื่อไทย</p>
        <input
          value={enTitle}
          onChange={(e) => setEnTitle(e.target.value)}
          placeholder="e.g. Wai Khru ceremony, Ajarn Lek Saturday 5, 2026"
          className={inputCls}
        />
      </div>

      {/* หมวดหมู่ — เลือกจากหมวดที่มีอยู่แล้ว กันหมวดซ้ำจากการสะกดต่างกัน */}
      <div>
        <span className="text-sm font-semibold">หมวดหมู่</span>
        <p className="mt-0.5 text-xs text-smoke">
          เช่น ไหว้ครู / ปลุกเสก / เททอง / ชื่ออาจารย์ — เลือกได้หลายหมวด หน้าภาพงานพิธีจะมีแท็บกรองให้อัตโนมัติ
          (ไม่เลือกก็ได้ อัลบั้มจะอยู่ในแท็บ “ทั้งหมด”)
        </p>
        {chipOptions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {chipOptions.map((c) => (
              <button
                key={c.name.trim()}
                type="button"
                aria-pressed={selectedNames.has(c.name.trim())}
                onClick={() => toggleCat(c)}
                className={chipCls(selectedNames.has(c.name.trim()))}
              >
                {c.name.trim()}
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 flex gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNewCat();
              }
            }}
            placeholder="พิมพ์ชื่อหมวดใหม่..."
            aria-label="เพิ่มหมวดใหม่"
            className="w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-2.5 text-sm text-ivory outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={addNewCat}
            disabled={!newCat.trim()}
            className="whitespace-nowrap rounded-xl border border-gold/40 px-4 py-2.5 text-sm font-semibold text-gold-light transition hover:border-gold disabled:opacity-40"
          >
            ＋ เพิ่มหมวด
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">รูปในอัลบั้ม</label>
        <p className="mb-2 mt-0.5 text-xs text-smoke">
          เลือกจากเครื่องได้ทีละหลายรูป ระบบอัปโหลดต่อกันเอง — เสร็จแล้วอย่าลืมกด “บันทึก” ด้านล่าง
        </p>
        <ImageManager images={images} onChange={setImages} folder="galleries" onBusy={setUploading} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving || uploading}
        className="w-full rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
      >
        {uploading ? "รออัปโหลดรูปให้เสร็จก่อน…" : saving ? "กำลังบันทึก..." : rowId ? "บันทึก" : "สร้างอัลบั้ม"}
      </button>

      {rowId && (
        <button
          type="button"
          onClick={onDelete}
          disabled={saving || uploading}
          className="w-full rounded-xl border border-ember/60 py-3 text-sm font-semibold text-ember transition hover:bg-ember/10 disabled:opacity-60"
        >
          ลบอัลบั้มนี้
        </button>
      )}
    </div>
  );
}
