"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DATA_TAG } from "@/lib/db";
import type { Category } from "@/lib/data";

// ทุก action เขียนผ่าน client ที่ผูก session ผู้ใช้ — RLS ฝั่ง Supabase บังคับสิทธิ์อีกชั้น
async function requireAuth() {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  return sb;
}

function refresh() {
  // expire ทันที — ให้เจ้าของกดบันทึกแล้วรีเฟรชหน้าเว็บเห็นผลเลย
  revalidateTag(DATA_TAG, { expire: 0 });
}

// เจ้าของพิมพ์ข้อความธรรมดาในฟอร์ม — แปลงเป็น HTML ให้ย่อหน้า/บรรทัดใหม่แสดงถูกต้อง
// (ถ้าเป็น HTML อยู่แล้ว เช่นข้อมูลเดิมจาก igetweb ให้ผ่านตามเดิม)
function toHtml(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  // ต้องเจอแท็กที่รู้จักจริง ๆ (จาก editor หรือข้อมูลเดิม igetweb) — ข้อความธรรมดา
  // ที่บังเอิญมี "<" เช่น "ขนาด <5ซม>" จะถูก escape ตามปกติ
  const TAG =
    /<\/?(p|br|div|span|img|h[1-6]|ul|ol|li|a|strong|b|em|i|u|s|blockquote|table|thead|tbody|tr|td|th|figure|figcaption|hr|iframe|video|source|pre|code)\b[^>]*\/?>/i;
  if (TAG.test(raw)) return raw;
  const esc = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

// แปลง public URL ของ Supabase Storage กลับเป็น path ใน bucket "images"
// (URL อื่น เช่นรูปเก่าจาก igetweb — ข้าม ไม่เกี่ยวกับ bucket เรา)
const STORAGE_MARKER = "/storage/v1/object/public/images/";
function storagePaths(urls: string[]): string[] {
  return urls.flatMap((u) => {
    const i = u.indexOf(STORAGE_MARKER);
    return i === -1 ? [] : [decodeURIComponent(u.slice(i + STORAGE_MARKER.length))];
  });
}

// ลบไฟล์รูปของแถวนี้ออกจาก Storage (best-effort — พลาดก็ไม่ให้การลบแถวล้ม)
async function removeRowImages(
  sb: Awaited<ReturnType<typeof createSupabaseServer>>,
  images: string[],
  contentHtml: string | null
) {
  const inHtml = contentHtml?.match(/https?:\/\/[^\s"'<>)]+/g) ?? [];
  const paths = [...new Set(storagePaths([...images, ...inHtml]))];
  if (paths.length === 0) return;
  const { error } = await sb.storage.from("images").remove(paths);
  if (error) console.error("[admin] remove storage images failed:", error.message);
}

export async function toggleSoldOut(id: string, soldOut: boolean): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const { error } = await sb
    .from("products")
    .update({ sold_out: soldOut, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  refresh();
  return {};
}

export interface ProductInput {
  id?: string; // ไม่ส่ง = สร้างใหม่
  title: string;
  priceText: string;
  price: number | null;
  sku: string | null;
  soldOut: boolean;
  categories: Category[];
  descriptionHtml: string | null;
  images: string[];
}

export async function saveProduct(input: ProductInput): Promise<{ error?: string; id?: string }> {
  const sb = await requireAuth();
  if (!input.title.trim()) return { error: "กรุณาใส่ชื่อรุ่น" };

  const now = new Date().toISOString();
  const html = toHtml(input.descriptionHtml);
  const common = {
    title: input.title.trim(),
    price_text: input.priceText.trim() || (input.price ? `${input.price.toLocaleString()} บาท` : ""),
    price: input.price,
    sku: input.sku?.trim() || null,
    sold_out: input.soldOut,
    categories: input.categories,
    description_html: html,
    description_text: html
      ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : null,
    images: input.images,
    updated_at: now,
  };

  if (input.id) {
    // เก็บ meta description/keywords เดิม (SEO จาก igetweb) — อัปเดตเฉพาะ title
    const { data: existing } = await sb
      .from("products")
      .select("meta")
      .eq("id", input.id)
      .maybeSingle();
    const meta = { ...(existing?.meta ?? {}), title: input.title.trim() };
    const { error } = await sb.from("products").update({ ...common, meta }).eq("id", input.id);
    if (error) return { error: error.message };
    refresh();
    return { id: input.id };
  }

  // สินค้าใหม่: id จาก timestamp (ไม่ชนกับ id เดิมของ igetweb) + แสดงบนสุด
  const id = String(Date.now());
  const { data: minRow } = await sb
    .from("products")
    .select("position")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  const position = (minRow?.position ?? 0) - 1;
  const { error } = await sb.from("products").insert({
    id,
    ...common,
    meta: { title: input.title.trim(), description: null, keywords: null },
    position,
    created_at: now,
  });
  if (error) return { error: error.message };
  refresh();
  return { id };
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const { data: row } = await sb
    .from("products")
    .select("images, description_html")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  if (row) await removeRowImages(sb, row.images ?? [], row.description_html);
  refresh();
  return {};
}

export interface ArticleInput {
  id?: string; // ไม่ส่ง = สร้างใหม่
  kind: "article" | "news";
  title: string;
  dateText: string | null;
  categories: Category[];
  contentHtml: string | null;
  images: string[];
}

export async function saveArticle(input: ArticleInput): Promise<{ error?: string; id?: string }> {
  const sb = await requireAuth();
  if (!input.title.trim()) return { error: "กรุณาใส่หัวข้อบทความ" };

  const now = new Date().toISOString();
  const html = toHtml(input.contentHtml);
  const common = {
    kind: input.kind,
    title: input.title.trim(),
    date_text: input.dateText?.trim() || null,
    categories: input.categories,
    content_html: html,
    content_text: html
      ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : null,
    images: input.images,
    updated_at: now,
  };

  if (input.id) {
    // เก็บ meta description/keywords เดิม (SEO จาก igetweb) — อัปเดตเฉพาะ title
    const { data: existing } = await sb
      .from("articles")
      .select("meta")
      .eq("id", input.id)
      .maybeSingle();
    const meta = { ...(existing?.meta ?? {}), title: input.title.trim() };
    const { error } = await sb.from("articles").update({ ...common, meta }).eq("id", input.id);
    if (error) return { error: error.message };
    refresh();
    return { id: input.id };
  }

  // เรื่องใหม่: id จาก timestamp (ไม่ชนกับ id เดิมของ igetweb) + แสดงบนสุด
  const id = String(Date.now());
  const { data: minRow } = await sb
    .from("articles")
    .select("position")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  const position = (minRow?.position ?? 0) - 1;
  const { error } = await sb.from("articles").insert({
    id,
    ...common,
    meta: { title: input.title.trim(), description: null, keywords: null },
    position,
    created_at: now,
  });
  if (error) return { error: error.message };
  refresh();
  return { id };
}

export async function deleteArticle(id: string): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const { data: row } = await sb
    .from("articles")
    .select("images, content_html")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("articles").delete().eq("id", id);
  if (error) return { error: error.message };
  if (row) await removeRowImages(sb, row.images ?? [], row.content_html);
  refresh();
  return {};
}

export async function saveCeremony(
  label: string,
  date: string
): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const hasLabel = !!label.trim();
  const hasDate = !!date;
  // กรอกอย่างเดียว = น่าจะลืม ไม่ใช่ตั้งใจลบ — เตือนแทนที่จะลบเงียบ ๆ
  if (hasLabel !== hasDate) {
    return { error: "กรุณากรอกทั้งชื่องานและวันที่ (หรือกดปุ่มลบเพื่อซ่อนบล็อกนับถอยหลัง)" };
  }
  const value = hasLabel && hasDate ? { label: label.trim(), date } : null;
  const { error } = await sb
    .from("settings")
    .upsert({ key: "next_ceremony", value, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  refresh();
  return {};
}

export interface MasterInput {
  slug: string;
  photo: string | null;
  bio: string | null;
  /** บรรทัดละคลิป รูปแบบ "youtubeId หรือ url | ชื่อคลิป" */
  videosText: string;
}

export async function saveMaster(input: MasterInput): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const videos = input.videosText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [idPart, ...titleParts] = line.split("|");
      const m =
        idPart.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) ??
        idPart.trim().match(/^([\w-]{11})$/);
      return m ? { id: m[1], title: titleParts.join("|").trim() || m[1] } : null;
    })
    .filter((v): v is { id: string; title: string } => v !== null);

  const { error } = await sb
    .from("masters")
    .update({
      photo: input.photo || null,
      bio: input.bio?.trim() || null,
      videos,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", input.slug);
  if (error) return { error: error.message };
  refresh();
  return {};
}
