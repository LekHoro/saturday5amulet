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
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
  const esc = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
    .join("\n");
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
    meta: { title: input.title.trim(), description: null, keywords: null },
    updated_at: now,
  };

  if (input.id) {
    const { error } = await sb.from("products").update(common).eq("id", input.id);
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
  const { error } = await sb
    .from("products")
    .insert({ id, ...common, position, created_at: now });
  if (error) return { error: error.message };
  refresh();
  return { id };
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  refresh();
  return {};
}

export async function saveCeremony(
  label: string,
  date: string
): Promise<{ error?: string }> {
  const sb = await requireAuth();
  const value = label.trim() && date ? { label: label.trim(), date } : null;
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
