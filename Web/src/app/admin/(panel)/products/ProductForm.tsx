"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/supabase/upload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { saveProduct, deleteProduct, type ProductInput } from "../../actions";
import type { Category } from "@/lib/data";

export interface CatOption {
  id: string;
  name: string;
  group: string;
}

export interface ProductFormValues {
  id?: string;
  title: string;
  priceText: string;
  price: number | null;
  sku: string | null;
  soldOut: boolean;
  categories: Category[];
  descriptionHtml: string | null;
  images: string[];
}

export default function ProductForm({
  initial,
  catOptions,
}: {
  initial?: ProductFormValues;
  catOptions: CatOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priceText, setPriceText] = useState(initial?.priceText ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [soldOut, setSoldOut] = useState(initial?.soldOut ?? false);
  const [catIds, setCatIds] = useState<Set<string>>(
    new Set(initial?.categories.map((c) => c.id) ?? [])
  );
  const [description, setDescription] = useState(initial?.descriptionHtml ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = [...new Set(catOptions.map((c) => c.group))];

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const sb = createSupabaseBrowser();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from("images").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type || undefined,
      });
      if (error) {
        setError(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`);
        break;
      }
      urls.push(sb.storage.from("images").getPublicUrl(path).data.publicUrl);
    }
    setImages((xs) => [...xs, ...urls]);
    setUploading(false);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    const categories: Category[] = catOptions
      .filter((c) => catIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
    // เก็บหมวดเดิมที่ไม่อยู่ในตัวเลือก (เช่นหมวดเก่าจาก igetweb) ไว้ด้วย
    for (const c of initial?.categories ?? []) {
      if (catIds.has(c.id) && !categories.some((x) => x.id === c.id)) categories.push(c);
    }
    // เลขชุดแรกเท่านั้น — กันเคส "999 - 1,999 บาท" กลายเป็น 9991999
    const priceMatch = priceText.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    const input: ProductInput = {
      id: initial?.id,
      title,
      priceText,
      price: priceMatch ? Number(priceMatch[0]) : null,
      sku: sku || null,
      soldOut,
      categories,
      descriptionHtml: description || null,
      images,
    };
    const res = await saveProduct(input);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!confirm(`ลบ "${title}" ออกจากเว็บถาวร?`)) return;
    setSaving(true);
    const res = await deleteProduct(initial.id);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold";

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold">ชื่อรุ่น *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold">ราคา (เช่น 1,500 บาท)</label>
          <input value={priceText} onChange={(e) => setPriceText(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-semibold">รหัสสินค้า</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className={inputCls} />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-gold/25 bg-night-soft p-4">
        <input
          type="checkbox"
          checked={soldOut}
          onChange={(e) => setSoldOut(e.target.checked)}
          className="h-5 w-5 accent-gold"
        />
        <span className="font-semibold">หมดแล้ว (แสดงเป็น &quot;หมดแล้ว&quot; บนเว็บ)</span>
      </label>

      {/* รูปภาพ */}
      <div>
        <label className="text-sm font-semibold">รูปภาพ (รูปแรก = รูปปก)</label>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            <div key={url} className="relative overflow-hidden rounded-xl border border-gold/20 bg-night-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-night/80 px-1 py-0.5 text-xs">
                {i > 0 ? (
                  <button
                    onClick={() => setImages((xs) => [xs[i], ...xs.filter((_, j) => j !== i)])}
                    className="px-1 text-gold-light"
                  >
                    ตั้งเป็นปก
                  </button>
                ) : (
                  <span className="px-1 text-gold">ปก</span>
                )}
                <button
                  onClick={() => setImages((xs) => xs.filter((_, j) => j !== i))}
                  className="px-1 text-ember"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gold/40 text-smoke transition hover:border-gold hover:text-gold-light">
            <span className="text-2xl">{uploading ? "⏳" : "＋"}</span>
            <span className="text-xs">{uploading ? "กำลังอัปโหลด" : "เพิ่มรูป"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* หมวดหมู่ */}
      <div>
        <label className="text-sm font-semibold">หมวดหมู่</label>
        {groups.map((g) => (
          <div key={g} className="mt-2">
            <div className="text-xs text-smoke">{g}</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {catOptions
                .filter((c) => c.group === g)
                .map((c) => {
                  const on = catIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setCatIds((s) => {
                          const next = new Set(s);
                          if (on) next.delete(c.id);
                          else next.add(c.id);
                          return next;
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        on
                          ? "border-gold bg-gold text-night"
                          : "border-gold/40 bg-night-soft text-ivory hover:border-gold"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-semibold">รายละเอียด / วิธีบูชา</label>
        <div className="mt-1">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            uploadImage={(file) => uploadImage(file, "content")}
            placeholder="พิมพ์รายละเอียดรุ่น ประวัติการจัดสร้าง วิธีบูชา คาถา ฯลฯ"
          />
        </div>
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving || uploading}
          className="flex-1 rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {initial?.id && (
          <button
            onClick={onDelete}
            disabled={saving}
            className="rounded-xl border border-ember/60 px-5 py-3.5 font-semibold text-ember transition hover:bg-ember/10"
          >
            ลบ
          </button>
        )}
      </div>
    </div>
  );
}
