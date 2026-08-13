"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/supabase/upload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageManager from "@/components/admin/ImageManager";
import { useDraft, draftTime } from "@/components/admin/useDraft";
import { thaiError } from "@/components/admin/adminErrors";
import LangTabs, { type FormLang } from "@/components/admin/LangTabs";
import { saveArticle, deleteArticle, type ArticleInput } from "../../actions";
import type { Category, EnContent } from "@/lib/data";

export interface ArticleFormValues {
  id?: string;
  kind: "article" | "news";
  title: string;
  dateText: string | null;
  categories: Category[];
  contentHtml: string | null;
  images: string[];
  en?: EnContent | null;
}

interface DraftData {
  kind: "article" | "news";
  title: string;
  dateText: string;
  cats: Category[];
  content: string;
  images: string[];
  enTitle: string;
  enContent: string;
}

export default function ArticleForm({
  initial,
  catOptions,
}: {
  initial?: ArticleFormValues;
  /** หมวดที่มีอยู่แล้วในบทความทั้งหมด — เลือกจากชิป กันหมวดแตกซ้ำจากการพิมพ์เอง */
  catOptions: Category[];
}) {
  const router = useRouter();
  // ฟอร์มถูก remount ทุกครั้งที่เปลี่ยนบทความ (key=id ที่หน้าแก้ไข) — id จึงคงที่ตลอดอายุฟอร์ม
  const rowId = initial?.id;
  const [kind, setKind] = useState<"article" | "news">(initial?.kind ?? "article");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dateText, setDateText] = useState(initial?.dateText ?? "");
  const [cats, setCats] = useState<Category[]>(initial?.categories ?? []);
  const [newCat, setNewCat] = useState("");
  const [content, setContent] = useState(initial?.contentHtml ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [formLang, setFormLang] = useState<FormLang>("th");
  const [enTitle, setEnTitle] = useState(initial?.en?.title ?? "");
  const [enContent, setEnContent] = useState(initial?.en?.html ?? "");
  // RichTextEditor รับ content ตอน mount เท่านั้น — bump key เมื่อกู้คืนร่าง
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapshot = useMemo<DraftData>(
    () => ({ kind, title, dateText, cats, content, images, enTitle, enContent }),
    [kind, title, dateText, cats, content, images, enTitle, enContent]
  );
  const draft = useDraft<DraftData>(`article:${rowId ?? "new"}`, snapshot);

  function applyDraft(d: DraftData) {
    setKind(d.kind);
    setTitle(d.title);
    setDateText(d.dateText);
    setCats(d.cats);
    setContent(d.content);
    setImages(d.images);
    setEnTitle(d.enTitle);
    setEnContent(d.enContent);
    setEditorEpoch((n) => n + 1);
    draft.clearPending();
  }

  // ชิปที่แสดง = หมวดที่มีอยู่ทั้งเว็บ + หมวดของบทความนี้ที่ยังไม่อยู่ในรายการ (รวมหมวดที่เพิ่งพิมพ์เพิ่ม)
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

  async function onSave() {
    setSaving(true);
    setError(null);
    const input: ArticleInput = {
      id: rowId,
      kind,
      title,
      dateText: dateText || null,
      categories: cats.map((c) => ({ id: c.id, name: c.name.trim() })),
      contentHtml: content || null,
      images,
      en: { title: enTitle, html: enContent || null },
    };
    const res = await saveArticle(input);
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "บันทึก"));
      return;
    }
    // บันทึกเสร็จ → กลับไปหน้ารายการ แล้วโชว์ toast ยืนยันที่นั่น
    draft.markSaved();
    router.push("/admin/articles?saved=1");
    router.refresh();
  }

  async function onDelete() {
    if (!rowId) return;
    if (!confirm(`ลบ "${title}" ออกจากเว็บถาวร?`)) return;
    setSaving(true);
    const res = await deleteArticle(rowId);
    setSaving(false);
    if (res.error) {
      setError(thaiError(res.error, "ลบ"));
      return;
    }
    draft.dismissDraft();
    router.push("/admin/articles");
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

  return (
    <div className="space-y-5">
      {draft.pending && (
        <div role="alert" className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm">
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

      <LangTabs
        lang={formLang}
        onChange={setFormLang}
        hasEn={!!(enTitle.trim() || enContent.trim())}
      />

      <div className={formLang === "th" ? "space-y-5" : "hidden"}>
      {/* ประเภท */}
      <div>
        <span className="text-sm font-semibold">ประเภท</span>
        <div className="mt-2 flex gap-2">
          {([
            { key: "article", label: "บทความ" },
            { key: "news", label: "ข่าว" },
          ] as const).map((k) => (
            <button
              key={k.key}
              type="button"
              aria-pressed={kind === k.key}
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
        <label htmlFor="a-title" className="text-sm font-semibold">
          หัวข้อ *
        </label>
        <input
          id="a-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="a-date" className="text-sm font-semibold">
          วันที่ (เช่น 31 มกราคม 2018)
        </label>
        <input
          id="a-date"
          value={dateText}
          onChange={(e) => setDateText(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* หมวดหมู่ — เลือกจากหมวดที่มีอยู่แล้ว กันหมวดซ้ำจากการสะกดต่างกัน */}
      <div>
        <span className="text-sm font-semibold">หมวดหมู่</span>
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

      {/* รูปภาพ */}
      <div>
        <span className="text-sm font-semibold">รูปภาพ (รูปแรก = รูปปก — ใช้ปุ่ม ◀ ▶ จัดลำดับ)</span>
        <div className="mt-2">
          <ImageManager images={images} onChange={setImages} folder="articles" onBusy={setUploading} />
        </div>
      </div>

      <div>
        <span className="text-sm font-semibold">เนื้อหา</span>
        <div className="mt-1">
          <RichTextEditor
            key={editorEpoch}
            value={content}
            onChange={setContent}
            uploadImage={(file) => uploadImage(file, "content")}
            placeholder="พิมพ์เนื้อหาบทความ/ข่าว"
          />
        </div>
      </div>
      </div>

      {/* ฉบับภาษาอังกฤษ — ช่องไหนเว้นว่าง หน้า /en จะใช้ข้อความไทยแทน */}
      <div className={formLang === "en" ? "space-y-5" : "hidden"}>
        <p className="rounded-xl border border-gold/25 bg-night-soft p-3 text-xs text-smoke">
          ใส่เฉพาะที่อยากแปล — ช่องที่เว้นว่างไว้ หน้า <span className="text-gold-light">/en</span>{" "}
          จะแสดงข้อความไทยแทน ส่วนรูป วันที่ และหมวดหมู่ ใช้ร่วมกับฉบับไทย
        </p>

        <div>
          <label htmlFor="a-title-en" className="text-sm font-semibold">
            Title (EN)
          </label>
          <input
            id="a-title-en"
            value={enTitle}
            onChange={(e) => setEnTitle(e.target.value)}
            placeholder={title || "หัวข้อภาษาอังกฤษ"}
            className={inputCls}
          />
        </div>

        <div>
          <span className="text-sm font-semibold">Content (EN)</span>
          <div className="mt-1">
            <RichTextEditor
              key={`en-${editorEpoch}`}
              value={enContent}
              onChange={setEnContent}
              uploadImage={(file) => uploadImage(file, "content")}
              placeholder="English article / news content…"
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
          onClick={onSave}
          disabled={saving || uploading}
          className="flex-1 rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {rowId && (
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
