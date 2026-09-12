"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageManager from "@/components/admin/ImageManager";
import { useDraft, draftTime } from "@/components/admin/useDraft";
import { thaiError } from "@/components/admin/adminErrors";
import { saveGallery, deleteGallery } from "../../actions";

export interface GalleryFormValues {
  id?: string;
  title: string;
  images: string[];
  enTitle: string;
}

interface DraftData {
  title: string;
  images: string[];
  enTitle: string;
}

export default function GalleryForm({ initial }: { initial?: GalleryFormValues }) {
  const router = useRouter();
  const rowId = initial?.id;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [enTitle, setEnTitle] = useState(initial?.enTitle ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // เกราะกันงานหาย — รูปที่อัปโหลดค้างไว้แต่ยังไม่ได้กดบันทึกจะกู้คืนได้
  const snapshot = useMemo<DraftData>(() => ({ title, images, enTitle }), [title, images, enTitle]);
  const draft = useDraft<DraftData>(`gallery:${rowId ?? "new"}`, snapshot);

  function applyDraft(d: DraftData) {
    setTitle(d.title);
    setImages(d.images);
    setEnTitle(d.enTitle);
    draft.clearPending();
  }

  async function onSave() {
    setError(null);
    if (!title.trim()) return setError("กรุณาใส่ชื่ออัลบั้ม");
    if (images.length === 0) return setError("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป");
    setSaving(true);
    const res = await saveGallery({ id: rowId, title, images, enTitle });
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
