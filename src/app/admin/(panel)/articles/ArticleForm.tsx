"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { saveArticle, deleteArticle, type ArticleInput } from "../../actions";
import type { Category } from "@/lib/data";

export interface ArticleFormValues {
  id?: string;
  kind: "article" | "news";
  title: string;
  dateText: string | null;
  categories: Category[];
  contentHtml: string | null;
  images: string[];
}

export default function ArticleForm({ initial }: { initial?: ArticleFormValues }) {
  const router = useRouter();
  const [kind, setKind] = useState<"article" | "news">(initial?.kind ?? "article");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dateText, setDateText] = useState(initial?.dateText ?? "");
  const [catText, setCatText] = useState(
    (initial?.categories ?? []).map((c) => c.name).join(", ")
  );
  const [content, setContent] = useState(initial?.contentHtml ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const sb = createSupabaseBrowser();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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

  function buildCategories(): Category[] {
    const prev = initial?.categories ?? [];
    return catText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => {
        // รักษา id เดิมถ้าชื่อไม่เปลี่ยน — ที่เหลือสร้าง id ใหม่
        const existing = prev.find((c) => c.name === name);
        return existing ?? { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), name };
      });
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    const input: ArticleInput = {
      id: initial?.id,
      kind,
      title,
      dateText: dateText || null,
      categories: buildCategories(),
      contentHtml: content || null,
      images,
    };
    const res = await saveArticle(input);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/articles");
    router.refresh();
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!confirm(`ลบ "${title}" ออกจากเว็บถาวร?`)) return;
    setSaving(true);
    const res = await deleteArticle(initial.id);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/articles");
    router.refresh();
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold";

  return (
    <div className="space-y-5">
      {/* ประเภท */}
      <div>
        <label className="text-sm font-semibold">ประเภท</label>
        <div className="mt-2 flex gap-2">
          {([
            { key: "article", label: "บทความ" },
            { key: "news", label: "ข่าว" },
          ] as const).map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => setKind(k.key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                kind === k.key
                  ? "border-gold bg-gold text-night"
                  : "border-gold/40 bg-night-soft text-ivory hover:border-gold"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">หัวข้อ *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold">วันที่ (เช่น 31 มกราคม 2018)</label>
          <input value={dateText} onChange={(e) => setDateText(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-semibold">หมวดหมู่ (คั่นด้วย ,)</label>
          <input value={catText} onChange={(e) => setCatText(e.target.value)} className={inputCls} />
        </div>
      </div>

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

      <div>
        <label className="text-sm font-semibold">เนื้อหา</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder="พิมพ์เนื้อหาบทความ/ข่าว (ขึ้นบรรทัดใหม่ได้ตามปกติ — เว้น 1 บรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)"
          className={inputCls}
        />
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
