"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/supabase/upload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageManager from "@/components/admin/ImageManager";
import { useToast } from "@/components/admin/Toast";
import { useDraft, draftTime } from "@/components/admin/useDraft";
import { thaiError } from "@/components/admin/adminErrors";
import LangTabs, { type FormLang } from "@/components/admin/LangTabs";
import { saveProduct, deleteProduct, duplicateProduct, type ProductInput } from "../../actions";
import type { Category, EnContent } from "@/lib/data";

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
  en?: EnContent | null;
}

interface DraftData {
  title: string;
  priceText: string;
  sku: string;
  soldOut: boolean;
  catIds: string[];
  description: string;
  images: string[];
  enTitle: string;
  enPriceText: string;
  enDescription: string;
}

export default function ProductForm({
  initial,
  catOptions,
  initialCatIds,
  justSaved,
}: {
  initial?: ProductFormValues;
  catOptions: CatOption[];
  /** หมวดที่เลือกไว้ล่วงหน้า — ส่งต่อมาจาก "บันทึกแล้วเพิ่มต่อ" ของชิ้นก่อน */
  initialCatIds?: string[];
  /** เพิ่งบันทึกชิ้นก่อนเสร็จ — โชว์ toast ยืนยันตอนเปิดฟอร์มใหม่ */
  justSaved?: boolean;
}) {
  const router = useRouter();
  const [rowId, setRowId] = useState(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priceText, setPriceText] = useState(initial?.priceText ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [soldOut, setSoldOut] = useState(initial?.soldOut ?? false);
  const [catIds, setCatIds] = useState<Set<string>>(
    new Set(initial?.categories.map((c) => c.id) ?? initialCatIds ?? [])
  );
  const [description, setDescription] = useState(initial?.descriptionHtml ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [formLang, setFormLang] = useState<FormLang>("th");
  const [enTitle, setEnTitle] = useState(initial?.en?.title ?? "");
  const [enPriceText, setEnPriceText] = useState(initial?.en?.priceText ?? "");
  const [enDescription, setEnDescription] = useState(initial?.en?.html ?? "");
  // RichTextEditor รับ content ตอน mount เท่านั้น — bump key เมื่อกู้คืนร่าง/รีเซ็ตฟอร์ม
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { show: toast, node: toastNode } = useToast();

  const snapshot = useMemo<DraftData>(
    () => ({
      title,
      priceText,
      sku,
      soldOut,
      catIds: [...catIds].sort(),
      description,
      images,
      enTitle,
      enPriceText,
      enDescription,
    }),
    [
      title,
      priceText,
      sku,
      soldOut,
      catIds,
      description,
      images,
      enTitle,
      enPriceText,
      enDescription,
    ]
  );
  const draft = useDraft<DraftData>(`product:${rowId ?? "new"}`, snapshot);

  // มาจาก "บันทึกแล้วเพิ่มต่อ" — ยืนยันว่าชิ้นก่อนขึ้นเว็บแล้ว และล้าง query ออกจาก URL
  useEffect(() => {
    if (!justSaved) return;
    toast("บันทึกแล้ว ✓ เริ่มพิมพ์ชิ้นใหม่ได้เลย");
    window.history.replaceState(null, "", "/admin/products/new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justSaved]);

  function applyDraft(d: DraftData) {
    setTitle(d.title);
    setPriceText(d.priceText);
    setSku(d.sku);
    setSoldOut(d.soldOut);
    setCatIds(new Set(d.catIds));
    setDescription(d.description);
    setImages(d.images);
    setEnTitle(d.enTitle);
    setEnPriceText(d.enPriceText);
    setEnDescription(d.enDescription);
    setEditorEpoch((n) => n + 1);
    draft.clearPending();
  }

  const groups = [...new Set(catOptions.map((c) => c.group))];
  // หมวดเดิมจาก igetweb ที่ไม่อยู่ในตัวเลือก — แสดงให้เห็น/เอาออกได้ ไม่ใช่ซ่อนไว้เฉย ๆ
  const legacyCats = (initial?.categories ?? []).filter(
    (c) => !catOptions.some((o) => o.id === c.id)
  );

  // เลขชุดแรกเท่านั้น — กันเคส "999 - 1,999 บาท" กลายเป็น 9991999
  const priceMatch = priceText.replace(/,/g, "").match(/\d+(?:\.\d+)?/);

  async function onSave(addAnother: boolean) {
    setSaving(true);
    setError(null);
    const categories: Category[] = catOptions
      .filter((c) => catIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
    // เก็บหมวดเดิมที่ไม่อยู่ในตัวเลือก (เช่นหมวดเก่าจาก igetweb) ไว้ด้วย
    for (const c of initial?.categories ?? []) {
      if (catIds.has(c.id) && !categories.some((x) => x.id === c.id)) categories.push(c);
    }
    const input: ProductInput = {
      id: rowId,
      title,
      priceText,
      price: priceMatch ? Number(priceMatch[0]) : null,
      sku: sku || null,
      soldOut,
      categories,
      descriptionHtml: description || null,
      images,
      en: { title: enTitle, priceText: enPriceText, html: enDescription || null },
    };
    const res = await saveProduct(input);
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "บันทึก"));
      return;
    }

    if (addAnother) {
      // เริ่มชิ้นถัดไปทันที — คงหมวดหมู่ไว้ เพราะของชุดเดียวกันมักหมวดเดียวกัน
      // (n=timestamp บังคับให้ฟอร์ม remount เป็นฟอร์มเปล่าเสมอ)
      draft.markSaved();
      const cats = encodeURIComponent([...catIds].join(","));
      router.push(`/admin/products/new?cats=${cats}&saved=1&n=${Date.now()}`);
    } else {
      draft.markSaved();
      if (res.id && !rowId) {
        setRowId(res.id);
        window.history.replaceState(null, "", `/admin/products/${res.id}`);
      }
      toast("บันทึกแล้ว ✓ ขึ้นเว็บเรียบร้อย");
    }
    router.refresh();
  }

  async function onDuplicate() {
    if (!rowId) return;
    setSaving(true);
    setError(null);
    const res = await duplicateProduct(rowId);
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "ทำสำเนา"));
      return;
    }
    router.push(`/admin/products/${res.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!rowId) return;
    if (!confirm(`ลบ "${title}" ออกจากเว็บถาวร?`)) return;
    setSaving(true);
    const res = await deleteProduct(rowId);
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "ลบ"));
      return;
    }
    draft.dismissDraft();
    router.push("/admin/products");
    router.refresh();
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold";
  const chipCls = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition ${
      on
        ? "border-gold bg-gold text-night"
        : "border-gold/40 bg-night-soft text-ivory hover:border-gold"
    }`;

  const hasEn = !!(enTitle.trim() || enPriceText.trim() || enDescription.trim());

  function toggleCat(id: string) {
    setCatIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {draft.pending && (
        <div
          role="alert"
          className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm"
        >
          <p className="font-semibold text-gold-light">
            มีฉบับร่างที่พิมพ์ค้างไว้ (เมื่อ {draftTime(draft.pending.savedAt)}) — ยังไม่ได้บันทึกขึ้นเว็บ
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => applyDraft(draft.pending!.data)}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-night transition hover:brightness-110"
            >
              กู้คืนฉบับร่าง
            </button>
            <button
              type="button"
              onClick={draft.dismissDraft}
              className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-ivory transition hover:border-gold"
            >
              ทิ้งร่าง ใช้ข้อมูลเดิม
            </button>
          </div>
        </div>
      )}

      <LangTabs lang={formLang} onChange={setFormLang} hasEn={hasEn} />

      <div className={formLang === "th" ? "space-y-5" : "hidden"}>
      <div>
        <label htmlFor="p-title" className="text-sm font-semibold">
          ชื่อรุ่น *
        </label>
        <input
          id="p-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="p-price" className="text-sm font-semibold">
            ราคา (เช่น 1,500 บาท)
          </label>
          <input
            id="p-price"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            className={inputCls}
          />
          {priceText.trim() && (
            <p className="mt-1 text-xs text-smoke">
              {priceMatch
                ? `ระบบอ่านราคาเป็น ${Number(priceMatch[0]).toLocaleString()} บาท`
                : "ไม่พบตัวเลข — ชิ้นนี้จะไม่ถูกจัดเรียงตามราคา"}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="p-sku" className="text-sm font-semibold">
            รหัสสินค้า
          </label>
          <input
            id="p-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className={inputCls}
          />
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
        <span className="text-sm font-semibold">รูปภาพ (รูปแรก = รูปปก — ใช้ปุ่ม ◀ ▶ จัดลำดับ)</span>
        <div className="mt-2">
          <ImageManager images={images} onChange={setImages} folder="products" onBusy={setUploading} />
        </div>
      </div>

      {/* หมวดหมู่ */}
      <div>
        <span className="text-sm font-semibold">หมวดหมู่</span>
        {groups.map((g) => (
          <div key={g} className="mt-2">
            <div className="text-xs text-smoke">{g}</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {catOptions
                .filter((c) => c.group === g)
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={catIds.has(c.id)}
                    onClick={() => toggleCat(c.id)}
                    className={chipCls(catIds.has(c.id))}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
        ))}
        {legacyCats.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-smoke">หมวดเดิม (จากเว็บเก่า)</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {legacyCats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={catIds.has(c.id)}
                  onClick={() => toggleCat(c.id)}
                  className={chipCls(catIds.has(c.id))}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <span className="text-sm font-semibold">รายละเอียด / วิธีบูชา</span>
        <div className="mt-1">
          <RichTextEditor
            key={editorEpoch}
            value={description}
            onChange={setDescription}
            uploadImage={(file) => uploadImage(file, "content")}
            placeholder="พิมพ์รายละเอียดรุ่น ประวัติการจัดสร้าง วิธีบูชา คาถา ฯลฯ"
          />
        </div>
      </div>
      </div>

      {/* ฉบับภาษาอังกฤษ — ช่องไหนเว้นว่าง หน้า /en จะใช้ข้อความไทยแทน */}
      <div className={formLang === "en" ? "space-y-5" : "hidden"}>
        <p className="rounded-xl border border-gold/25 bg-night-soft p-3 text-xs text-smoke">
          ใส่เฉพาะที่อยากแปล — ช่องที่เว้นว่างไว้ หน้า <span className="text-gold-light">/en</span>{" "}
          จะแสดงข้อความไทยแทน ส่วนรูป ราคา รหัส และหมวดหมู่ ใช้ร่วมกับฉบับไทย
        </p>

        <div>
          <label htmlFor="p-title-en" className="text-sm font-semibold">
            Product name (EN)
          </label>
          <input
            id="p-title-en"
            value={enTitle}
            onChange={(e) => setEnTitle(e.target.value)}
            placeholder={title || "ชื่อรุ่นภาษาอังกฤษ"}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="p-price-en" className="text-sm font-semibold">
            Price (EN) — เช่น 1,500 Baht
          </label>
          <input
            id="p-price-en"
            value={enPriceText}
            onChange={(e) => setEnPriceText(e.target.value)}
            placeholder={priceText || "1,500 Baht"}
            className={inputCls}
          />
        </div>

        <div>
          <span className="text-sm font-semibold">Description / How to worship (EN)</span>
          <div className="mt-1">
            <RichTextEditor
              key={`en-${editorEpoch}`}
              value={enDescription}
              onChange={setEnDescription}
              uploadImage={(file) => uploadImage(file, "content")}
              placeholder="English description, history, how to worship, mantra…"
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onSave(false)}
          disabled={saving || uploading}
          className="flex-1 rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          onClick={() => onSave(true)}
          disabled={saving || uploading}
          className="rounded-xl border border-gold/50 px-5 py-3.5 font-semibold text-gold-light transition hover:border-gold disabled:opacity-60"
        >
          บันทึกแล้วเพิ่มต่อ
        </button>
      </div>

      {rowId && (
        <div className="flex gap-3">
          <button
            onClick={onDuplicate}
            disabled={saving || uploading}
            className="flex-1 rounded-xl border border-gold/40 py-3 text-sm font-semibold text-ivory transition hover:border-gold disabled:opacity-60"
          >
            ทำสำเนาเป็นชิ้นใหม่
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            className="rounded-xl border border-ember/60 px-5 py-3 text-sm font-semibold text-ember transition hover:bg-ember/10 disabled:opacity-60"
          >
            ลบ
          </button>
        </div>
      )}

      {toastNode}
    </div>
  );
}
