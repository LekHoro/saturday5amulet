"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { saveCategoryImage } from "../../actions";

/** ชื่อไฟล์ใน bucket — นอกคอมโพเนนต์ ไม่ให้ Date.now() ไปโดนกฎ purity ของ react-hooks */
function uploadPath(catId: string, ext: string) {
  return `categories/${catId}-${Date.now()}.${ext}`;
}

export interface CategoryImageRow {
  id: string;
  name: string;
  group: string;
  /** รูปที่ระบบเลือกให้อัตโนมัติ (สินค้าชิ้นแรกที่มีรูปในหมวด) ไว้พรีวิวตอนยังไม่ตั้งเอง */
  auto: string | null;
}

export default function CategoryImagesForm({
  cats,
  initial,
}: {
  cats: CategoryImageRow[];
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(catId: string, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusyId(catId);
    setError(null);
    const sb = createSupabaseBrowser();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = uploadPath(catId, ext);
    const { error: upErr } = await sb.storage.from("images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
    });
    if (upErr) {
      setError(`อัปโหลดรูปไม่สำเร็จ: ${upErr.message}`);
      setBusyId(null);
      return;
    }
    const url = sb.storage.from("images").getPublicUrl(path).data.publicUrl;
    const res = await saveCategoryImage(catId, url);
    if (res.error) setError(`บันทึกไม่สำเร็จ: ${res.error}`);
    else {
      setImages((m) => ({ ...m, [catId]: url }));
      router.refresh();
    }
    setBusyId(null);
  }

  async function onRemove(catId: string) {
    setBusyId(catId);
    setError(null);
    const res = await saveCategoryImage(catId, null);
    if (res.error) setError(`ลบไม่สำเร็จ: ${res.error}`);
    else {
      setImages((m) => {
        const next = { ...m };
        delete next[catId];
        return next;
      });
      router.refresh();
    }
    setBusyId(null);
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-ember">{error}</p>}
      <ul className="divide-y divide-gold/15">
        {cats.map((c) => {
          const custom = images[c.id];
          const shown = custom ?? c.auto;
          const busy = busyId === c.id;
          return (
            <li key={c.id} className="flex items-center gap-4 py-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-gold/25 bg-night">
                {shown ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shown} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-smoke">
                    ไม่มีรูป
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ivory">{c.name}</p>
                <p className="mt-0.5 text-xs text-smoke">
                  {c.group} ·{" "}
                  {custom ? (
                    <span className="text-gold-light">รูปที่ตั้งเอง</span>
                  ) : (
                    "รูปอัตโนมัติจากสินค้า"
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <label
                  className={`cursor-pointer rounded-lg border border-gold/40 px-3 py-1.5 text-xs text-gold-light transition hover:border-gold ${busy ? "pointer-events-none opacity-60" : ""}`}
                >
                  {busy ? "กำลังบันทึก..." : custom ? "เปลี่ยนรูป" : "ตั้งรูปเอง"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => onUpload(c.id, e.target.files)}
                  />
                </label>
                {custom && (
                  <button
                    onClick={() => onRemove(c.id)}
                    disabled={busy}
                    className="rounded-lg border border-ember/50 px-3 py-1.5 text-xs text-ember transition hover:bg-ember/10 disabled:opacity-60"
                  >
                    ลบ
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
